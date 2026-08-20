package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FieldEncryptionMigrationRunnerIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private FieldEncryptionMigrationRunner runner;

    private Long inserirServicoBruto(String codigoOs, String cpf, String endereco) {
        jdbcTemplate.update(
                "INSERT INTO servicos (codigo_os, cliente, solicitacao, quantidade, status, valor, data_criacao, cpf_ou_cnpj, endereco) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                codigoOs, "Cliente Teste Migração", "Calibração", 1, "1º Contato", new BigDecimal("100.00"),
                LocalDate.now(), cpf, endereco);
        return jdbcTemplate.queryForObject("SELECT id FROM servicos WHERE codigo_os = ?", Long.class, codigoOs);
    }

    private String colunaBruta(Long id, String coluna) {
        return jdbcTemplate.queryForObject("SELECT " + coluna + " FROM servicos WHERE id = ?", String.class, id);
    }

    @Test
    void migraCpfEEnderecoEmTextoClaroParaCifrado() {
        Long id = inserirServicoBruto("OS-MIGR-0001", "123.456.789-00", "Rua Teste, 100");

        runner.run(new DefaultApplicationArguments());

        assertTrue(colunaBruta(id, "cpf_ou_cnpj").startsWith("enc:v1:"));
        assertTrue(colunaBruta(id, "endereco").startsWith("enc:v1:"));
    }

    @Test
    void rodarDeNovoNaoAlteraLinhaJaMigrada() {
        Long id = inserirServicoBruto("OS-MIGR-0002", "987.654.321-00", "Av. Teste, 200");

        runner.run(new DefaultApplicationArguments());
        String cifradoAposPrimeiraRodada = colunaBruta(id, "cpf_ou_cnpj");

        runner.run(new DefaultApplicationArguments());
        String cifradoAposSegundaRodada = colunaBruta(id, "cpf_ou_cnpj");

        assertEquals(cifradoAposPrimeiraRodada, cifradoAposSegundaRodada);
    }

    @Test
    void linhaJaCifradaNaoEhAlteradaPelaMigracao() {
        Long id = inserirServicoBruto("OS-MIGR-0003", null, null);
        jdbcTemplate.update("UPDATE servicos SET cpf_ou_cnpj = ? WHERE id = ?", "enc:v1:valorJaCifradoDeMentirinha==", id);

        runner.run(new DefaultApplicationArguments());

        assertEquals("enc:v1:valorJaCifradoDeMentirinha==", colunaBruta(id, "cpf_ou_cnpj"));
    }

    @Test
    void camposNulosPermanecemNulosAposAMigracao() {
        Long id = inserirServicoBruto("OS-MIGR-0004", null, null);

        runner.run(new DefaultApplicationArguments());

        assertEquals(null, colunaBruta(id, "cpf_ou_cnpj"));
        assertEquals(null, colunaBruta(id, "endereco"));
    }
}
