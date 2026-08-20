package com.zeiss.pilot.security;

import java.security.GeneralSecurityException;
import java.util.Base64;
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
 * Recriptografa, uma vez, qualquer CPF/CNPJ ou endereço gravado em texto
 * claro antes de {@link CryptoConverter} existir.
 *
 * <p>Usa JDBC puro em vez de JPA/Hibernate de propósito: carregar a entidade,
 * reatribuir o mesmo valor via o setter e salvar NÃO gera um UPDATE, porque o
 * dirty-checking do Hibernate compara o valor já convertido (pós-leitura) —
 * um valor que não mudou no nível Java não é considerado sujo, mesmo que a
 * representação em texto claro no banco nunca tenha sido de fato substituída
 * pela cifrada. Ler e escrever a coluna bruta via JDBC evita essa armadilha.
 *
 * <p>Idempotente e seguro de rodar a cada subida: a cláusula {@code NOT LIKE
 * 'enc:v1:%'} garante que uma linha já migrada nunca é tocada de novo.
 */
@Component
public class FieldEncryptionMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(FieldEncryptionMigrationRunner.class);

    @Value("${security.field-encryption-key:}")
    private String chaveBase64;

    private final JdbcTemplate jdbcTemplate;

    public FieldEncryptionMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (chaveBase64 == null || chaveBase64.isBlank()) {
            log.info("FIELD_ENCRYPTION_KEY não configurada — migração de dado pessoal legado desabilitada.");
            return;
        }
        byte[] chave = Base64.getDecoder().decode(chaveBase64);

        List<Map<String, Object>> linhas = jdbcTemplate.queryForList(
                "SELECT id, cpf_ou_cnpj, endereco FROM servicos WHERE "
                + "(cpf_ou_cnpj IS NOT NULL AND cpf_ou_cnpj NOT LIKE 'enc:v1:%') "
                + "OR (endereco IS NOT NULL AND endereco NOT LIKE 'enc:v1:%')");

        int migradas = 0;
        for (Map<String, Object> linha : linhas) {
            Long id = ((Number) linha.get("id")).longValue();
            String cpfClaro = (String) linha.get("cpf_ou_cnpj");
            String enderecoClaro = (String) linha.get("endereco");

            String cpfCifrado = precisaCifrar(cpfClaro) ? cifrar(cpfClaro, chave) : cpfClaro;
            String enderecoCifrado = precisaCifrar(enderecoClaro) ? cifrar(enderecoClaro, chave) : enderecoClaro;

            jdbcTemplate.update(
                    "UPDATE servicos SET cpf_ou_cnpj = ?, endereco = ? WHERE id = ?",
                    cpfCifrado, enderecoCifrado, id);
            migradas++;
        }
        if (migradas > 0) {
            log.info("Migração de dado pessoal: {} registro(s) de servicos recriptografado(s).", migradas);
        }
    }

    private static boolean precisaCifrar(String valor) {
        return valor != null && !valor.startsWith(CryptoConverter.PREFIXO);
    }

    private static String cifrar(String valorClaro, byte[] chave) {
        try {
            byte[] cifrado = AesGcmUtil.criptografar(valorClaro.getBytes(java.nio.charset.StandardCharsets.UTF_8), chave);
            return CryptoConverter.PREFIXO + Base64.getEncoder().encodeToString(cifrado);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao migrar dado pessoal legado: " + e.getMessage(), e);
        }
    }
}
