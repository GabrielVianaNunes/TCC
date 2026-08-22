package com.zeiss.pilot.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Cria um Cliente para cada CPF/CNPJ distinto ainda não vinculado em
 * servicos, e preenche servicos.cliente_id. Roda a cada subida, mas é
 * idempotente — OS já vinculada (cliente_id preenchido) nunca é reprocessada,
 * e cliente já existente com aquele hash nunca é duplicado.
 *
 * <p>JDBC puro, não JPA — mesmo motivo do FieldEncryptionMigrationRunner:
 * carregar/salvar via entidade não gera UPDATE quando o valor Java não muda
 * de verdade, e aqui não há valor Java nenhum ainda pra "não mudar".
 */
@Component
public class ClienteMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ClienteMigrationRunner.class);

    @Value("${security.field-encryption-key:}")
    private String chaveBase64;

    private final JdbcTemplate jdbcTemplate;

    public ClienteMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (chaveBase64 == null || chaveBase64.isBlank()) {
            log.info("FIELD_ENCRYPTION_KEY não configurada — migração de clientes desabilitada.");
            return;
        }
        byte[] chave = Base64.getDecoder().decode(chaveBase64);

        List<Map<String, Object>> pendentes = jdbcTemplate.queryForList(
                "SELECT id, cpf_ou_cnpj, endereco, cliente FROM servicos "
                + "WHERE cliente_id IS NULL AND cpf_ou_cnpj IS NOT NULL");

        Map<String, Long> hashParaClienteId = new HashMap<>();
        int clientesCriados = 0;
        int osVinculadas = 0;

        for (Map<String, Object> linha : pendentes) {
            Long servicoId = ((Number) linha.get("id")).longValue();
            String cpfClaro = decifrarTolerante((String) linha.get("cpf_ou_cnpj"), chave);
            if (cpfClaro == null || cpfClaro.isBlank()) {
                continue;
            }
            String enderecoClaro = decifrarTolerante((String) linha.get("endereco"), chave);
            String nome = (String) linha.get("cliente");

            String hash = HashUtil.sha256Hex(HashUtil.normalizarDocumento(cpfClaro));
            Long clienteId = hashParaClienteId.get(hash);
            if (clienteId == null) {
                clienteId = buscarClienteExistente(hash);
                if (clienteId == null) {
                    clienteId = criarCliente(nome, cpfClaro, enderecoClaro, hash, chave);
                    clientesCriados++;
                }
                hashParaClienteId.put(hash, clienteId);
            }

            jdbcTemplate.update("UPDATE servicos SET cliente_id = ? WHERE id = ?", clienteId, servicoId);
            osVinculadas++;
        }

        if (osVinculadas > 0) {
            log.info("Migração de clientes: {} cliente(s) criado(s), {} OS vinculada(s).", clientesCriados, osVinculadas);
        }
    }

    private Long buscarClienteExistente(String hash) {
        List<Long> encontrados = jdbcTemplate.query(
                "SELECT id FROM clientes WHERE cpf_ou_cnpj_hash = ?",
                (rs, rowNum) -> rs.getLong("id"), hash);
        return encontrados.isEmpty() ? null : encontrados.get(0);
    }

    private Long criarCliente(String nome, String cpfClaro, String enderecoClaro, String hash, byte[] chave) {
        String cpfCifrado = cifrar(cpfClaro, chave);
        String enderecoCifrado = enderecoClaro != null ? cifrar(enderecoClaro, chave) : null;
        String nomeFinal = (nome == null || nome.isBlank()) ? "Cliente sem nome" : nome;

        return jdbcTemplate.queryForObject(
                "INSERT INTO clientes (nome, cpf_ou_cnpj, cpf_ou_cnpj_hash, endereco, data_cadastro) "
                + "VALUES (?, ?, ?, ?, CURRENT_DATE) RETURNING id",
                Long.class, nomeFinal, cpfCifrado, hash, enderecoCifrado);
    }

    private static String decifrarTolerante(String valorBanco, byte[] chave) {
        if (valorBanco == null) {
            return null;
        }
        if (!valorBanco.startsWith(CryptoConverter.PREFIXO)) {
            return valorBanco; // ainda em texto claro (FieldEncryptionMigrationRunner não rodou antes deste)
        }
        try {
            byte[] cifrado = Base64.getDecoder().decode(valorBanco.substring(CryptoConverter.PREFIXO.length()));
            byte[] claro = AesGcmUtil.descriptografar(cifrado, chave);
            return new String(claro, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao decifrar dado legado durante migração de clientes: " + e.getMessage(), e);
        }
    }

    private static String cifrar(String valorClaro, byte[] chave) {
        try {
            byte[] cifrado = AesGcmUtil.criptografar(valorClaro.getBytes(StandardCharsets.UTF_8), chave);
            return CryptoConverter.PREFIXO + Base64.getEncoder().encodeToString(cifrado);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao cifrar dado de cliente migrado: " + e.getMessage(), e);
        }
    }
}
