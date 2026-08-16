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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.ServicoDTO;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ServicoServiceIntegrationTest {

    @Autowired
    private ServicoService servicoService;

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
}
