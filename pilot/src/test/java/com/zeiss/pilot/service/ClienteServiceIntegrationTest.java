package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.exception.ClienteConflitoException;
import com.zeiss.pilot.repository.ServicoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ClienteServiceIntegrationTest {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private ServicoService servicoService;

    private ClienteDTO novoCliente(String nome, String cpf) {
        ClienteDTO dto = new ClienteDTO();
        dto.setNome(nome);
        dto.setCpfOuCnpj(cpf);
        return dto;
    }

    @Test
    void criaClienteEDevolveOsDadosEmTextoClaro() {
        ClienteDTO criado = clienteService.criar(novoCliente("Cliente Teste A", "111.111.111-11"));

        assertEquals("Cliente Teste A", criado.getNome());
        assertEquals("111.111.111-11", criado.getCpfOuCnpj());
        assertEquals(LocalDate.now(), criado.getDataCadastro());
    }

    @Test
    void criarComCpfJaExistenteLancaConflito() {
        clienteService.criar(novoCliente("Cliente Teste B", "222.222.222-22"));

        assertThrows(ClienteConflitoException.class,
                () -> clienteService.criar(novoCliente("Outro Nome", "222.222.222-22")));
    }

    @Test
    void criarComCpfIgualMasMascaraDiferenteAindaAssimEDetectadoComoDuplicata() {
        clienteService.criar(novoCliente("Cliente Teste C", "333.333.333-33"));

        assertThrows(ClienteConflitoException.class,
                () -> clienteService.criar(novoCliente("Outro Nome", "33333333333")));
    }

    @Test
    void atualizarMantendoOMesmoCpfNaoDisparaFalsoConflito() {
        ClienteDTO criado = clienteService.criar(novoCliente("Cliente Teste D", "444.444.444-44"));

        ClienteDTO atualizado = clienteService.atualizar(criado.getId(), novoCliente("Nome Corrigido", "444.444.444-44"));

        assertEquals("Nome Corrigido", atualizado.getNome());
    }

    @Test
    void atualizarParaCpfDeOutroClienteLancaConflito() {
        clienteService.criar(novoCliente("Cliente Teste E1", "555.555.555-55"));
        ClienteDTO clienteE2 = clienteService.criar(novoCliente("Cliente Teste E2", "666.666.666-66"));

        assertThrows(ClienteConflitoException.class,
                () -> clienteService.atualizar(clienteE2.getId(), novoCliente("Cliente Teste E2", "555.555.555-55")));
    }

    @Test
    void listarDevolveClientesCriados() {
        clienteService.criar(novoCliente("Cliente Teste F", "777.777.777-77"));

        List<ClienteDTO> lista = clienteService.listar();

        assertTrue(lista.stream().anyMatch(c -> "Cliente Teste F".equals(c.getNome())));
    }

    @Test
    void excluirClienteSemOsVinculadaFunciona() {
        ClienteDTO criado = clienteService.criar(novoCliente("Cliente Teste G", "888.888.888-88"));

        clienteService.excluir(criado.getId());

        assertThrows(RuntimeException.class, () -> clienteService.buscarPorId(criado.getId()));
    }

    @Test
    void excluirClienteComOsVinculadaLancaConflito() {
        ClienteDTO cliente = clienteService.criar(novoCliente("Cliente Teste H", "999.999.999-99"));

        com.zeiss.pilot.dto.ServicoDTO servico = new com.zeiss.pilot.dto.ServicoDTO();
        servico.setClienteId(cliente.getId());
        servico.setSolicitacao("Calibração");
        servico.setQuantidade(1);
        servico.setStatus("1º Contato");
        servico.setValor(new java.math.BigDecimal("100.00"));
        servico.setDataCriacao(LocalDate.now());
        servicoService.criarServico(servico);

        assertThrows(ClienteConflitoException.class, () -> clienteService.excluir(cliente.getId()));
    }
}
