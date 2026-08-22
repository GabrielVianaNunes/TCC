package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

    @Autowired
    private ClienteService clienteService;

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
        com.zeiss.pilot.dto.ClienteDTO cliente = clienteService.criar(clienteDeTeste("Cliente Teste A", "101.101.101-01"));
        ServicoDTO dto = novoServico("Cliente Teste A");
        dto.setClienteId(cliente.getId());

        ServicoDTO criado = servicoService.criarServico(dto);

        assertNotNull(criado.getCodigoOs());
        assertTrue(criado.getCodigoOs().matches("OS-\\d{4}-\\d{4}"),
                "código gerado (" + criado.getCodigoOs() + ") não bate com o padrão OS-AAAA-NNNN");
        assertTrue(criado.getCodigoOs().startsWith("OS-" + LocalDate.now().getYear() + "-"));
    }

    @Test
    void doisServicosCriadosEmSequenciaRecebemCodigosDiferentesEIncrementais() {
        com.zeiss.pilot.dto.ClienteDTO clienteB = clienteService.criar(clienteDeTeste("Cliente Teste B", "102.102.102-02"));
        com.zeiss.pilot.dto.ClienteDTO clienteC = clienteService.criar(clienteDeTeste("Cliente Teste C", "103.103.103-03"));

        ServicoDTO dtoPrimeiro = novoServico("Cliente Teste B");
        dtoPrimeiro.setClienteId(clienteB.getId());
        ServicoDTO dtoSegundo = novoServico("Cliente Teste C");
        dtoSegundo.setClienteId(clienteC.getId());

        ServicoDTO primeiro = servicoService.criarServico(dtoPrimeiro);
        ServicoDTO segundo = servicoService.criarServico(dtoSegundo);

        assertNotEquals(primeiro.getCodigoOs(), segundo.getCodigoOs());

        int sequenciaPrimeiro = Integer.parseInt(primeiro.getCodigoOs().substring(primeiro.getCodigoOs().length() - 4));
        int sequenciaSegundo = Integer.parseInt(segundo.getCodigoOs().substring(segundo.getCodigoOs().length() - 4));
        assertEquals(sequenciaPrimeiro + 1, sequenciaSegundo);
    }

    @Test
    void criarServicoSemClienteIdLancaExcecao() {
        ServicoDTO dto = novoServico("Cliente Sem Vinculo");

        assertThrows(RuntimeException.class, () -> servicoService.criarServico(dto));
    }

    @Test
    void criarServicoComClienteIdValidoRefleteOsDadosDoClienteNoDto() {
        com.zeiss.pilot.dto.ClienteDTO cliente = clienteService.criar(clienteDeTeste("Cliente Vinculado Teste", "121.212.121-21"));

        ServicoDTO dto = novoServico("ignorado");
        dto.setClienteId(cliente.getId());

        ServicoDTO criado = servicoService.criarServico(dto);

        assertEquals(cliente.getId(), criado.getClienteId());
        assertEquals("Cliente Vinculado Teste", criado.getClienteNome());
    }

    private com.zeiss.pilot.dto.ClienteDTO clienteDeTeste(String nome, String cpf) {
        com.zeiss.pilot.dto.ClienteDTO dto = new com.zeiss.pilot.dto.ClienteDTO();
        dto.setNome(nome);
        dto.setCpfOuCnpj(cpf);
        return dto;
    }
}
