package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.ServicoDTO;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ServicoServiceIntegrationTest {

    @Autowired
    private ServicoService servicoService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ServicoDTO novoServico(String cliente) {
        ServicoDTO dto = new ServicoDTO();
        dto.setCliente(cliente);
        dto.setSolicitacao("Calibração de equipamento");
        dto.setQuantidade(1);
        dto.setStatus("1º Contato");
        dto.setValor(new BigDecimal("500.00"));
        dto.setDataCriacao(LocalDate.now());
        return dto;
    }

    @Test
    void criarServicoGeraCodigoOsNoFormatoEsperado() {
        ServicoDTO criado = servicoService.criarServico(novoServico("Cliente Teste A"));

        assertNotNull(criado.getCodigoOs());
        assertTrue(criado.getCodigoOs().matches("OS-\\d{4}-\\d{4}"),
                "código gerado (" + criado.getCodigoOs() + ") não bate com o padrão OS-AAAA-NNNN");
        assertTrue(criado.getCodigoOs().startsWith("OS-" + LocalDate.now().getYear() + "-"));
    }

    @Test
    void doisServicosCriadosEmSequenciaRecebemCodigosDiferentesEIncrementais() {
        ServicoDTO primeiro = servicoService.criarServico(novoServico("Cliente Teste B"));
        ServicoDTO segundo = servicoService.criarServico(novoServico("Cliente Teste C"));

        assertNotEquals(primeiro.getCodigoOs(), segundo.getCodigoOs());

        int sequenciaPrimeiro = Integer.parseInt(primeiro.getCodigoOs().substring(primeiro.getCodigoOs().length() - 4));
        int sequenciaSegundo = Integer.parseInt(segundo.getCodigoOs().substring(segundo.getCodigoOs().length() - 4));
        assertEquals(sequenciaPrimeiro + 1, sequenciaSegundo);
    }

    @Test
    void cpfEEnderecoFicamCriptografadosNoBancoMasEmTextoClaroViaService() {
        ServicoDTO dto = novoServico("Cliente Teste Cripto");
        dto.setCpfOuCnpj("123.456.789-00");
        dto.setEndereco("Rua Exemplo, 123");

        ServicoDTO criado = servicoService.criarServico(dto);

        assertEquals("123.456.789-00", criado.getCpfOuCnpj());
        assertEquals("Rua Exemplo, 123", criado.getEndereco());

        String cpfNoBanco = jdbcTemplate.queryForObject(
                "SELECT cpf_ou_cnpj FROM servicos WHERE id = ?", String.class, criado.getId());
        String enderecoNoBanco = jdbcTemplate.queryForObject(
                "SELECT endereco FROM servicos WHERE id = ?", String.class, criado.getId());

        assertTrue(cpfNoBanco.startsWith("enc:v1:"));
        assertTrue(enderecoNoBanco.startsWith("enc:v1:"));
        assertNotEquals("123.456.789-00", cpfNoBanco);
        assertNotEquals("Rua Exemplo, 123", enderecoNoBanco);
    }
}
