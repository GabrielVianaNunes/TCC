package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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
class ClienteMigrationRunnerIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ClienteMigrationRunner runner;

    private Long inserirServicoComCpfEmTextoClaro(String codigoOs, String cpf, String enderecoTexto, String nomeCliente) {
        jdbcTemplate.update(
                "INSERT INTO servicos (codigo_os, cliente, solicitacao, quantidade, status, valor, data_criacao, cpf_ou_cnpj, endereco) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                codigoOs, nomeCliente, "Calibração", 1, "1º Contato", new BigDecimal("100.00"),
                LocalDate.now(), cpf, enderecoTexto);
        return jdbcTemplate.queryForObject("SELECT id FROM servicos WHERE codigo_os = ?", Long.class, codigoOs);
    }

    private Long clienteIdDoServico(Long servicoId) {
        return jdbcTemplate.queryForObject("SELECT cliente_id FROM servicos WHERE id = ?", Long.class, servicoId);
    }

    @Test
    void migraCpfEmTextoClaroParaUmClienteNovoEVinculaAOs() {
        Long servicoId = inserirServicoComCpfEmTextoClaro("OS-CLI-0001", "123.456.789-00", "Rua Teste, 1", "Fulano de Tal");

        runner.run(new DefaultApplicationArguments());

        Long clienteId = clienteIdDoServico(servicoId);
        assertTrue(clienteId != null && clienteId > 0);

        String nome = jdbcTemplate.queryForObject("SELECT nome FROM clientes WHERE id = ?", String.class, clienteId);
        assertEquals("Fulano de Tal", nome);
    }

    @Test
    void duasOsComOMesmoCpfViramUmUnicoCliente() {
        Long servico1 = inserirServicoComCpfEmTextoClaro("OS-CLI-0002", "987.654.321-00", "Endereço A", "Ciclano");
        Long servico2 = inserirServicoComCpfEmTextoClaro("OS-CLI-0003", "987.654.321-00", "Endereço A", "Ciclano");

        runner.run(new DefaultApplicationArguments());

        Long cliente1 = clienteIdDoServico(servico1);
        Long cliente2 = clienteIdDoServico(servico2);
        assertEquals(cliente1, cliente2);

        Integer totalClientesComEsseCpfHash = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM clientes WHERE id = ?", Integer.class, cliente1);
        assertEquals(1, totalClientesComEsseCpfHash);
    }

    @Test
    void osSemCpfFicaComClienteIdNulo() {
        Long servicoId = inserirServicoComCpfEmTextoClaro("OS-CLI-0004", null, null, "Sem Documento");

        runner.run(new DefaultApplicationArguments());

        assertNull(clienteIdDoServico(servicoId));
    }

    @Test
    void rodarDeNovoNaoDuplicaClienteJaMigrado() {
        Long servicoId = inserirServicoComCpfEmTextoClaro("OS-CLI-0005", "111.222.333-44", "End.", "Beltrano");

        runner.run(new DefaultApplicationArguments());
        Long clienteAposPrimeiraRodada = clienteIdDoServico(servicoId);

        runner.run(new DefaultApplicationArguments());
        Long clienteAposSegundaRodada = clienteIdDoServico(servicoId);

        assertEquals(clienteAposPrimeiraRodada, clienteAposSegundaRodada);
    }
}
