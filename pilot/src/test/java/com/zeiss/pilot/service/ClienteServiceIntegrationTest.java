package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ClienteDTO novoCliente(String nome, String cpf) {
        ClienteDTO dto = new ClienteDTO();
        dto.setNome(nome);
        dto.setCpfOuCnpj(cpf);
        return dto;
    }

    private String colunaBruta(Long id, String coluna) {
        return jdbcTemplate.queryForObject("SELECT " + coluna + " FROM clientes WHERE id = ?", String.class, id);
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

    /**
     * @Convert torna a criptografia transparente na camada de service — um
     * round-trip que passa não prova, por si só, que a coluna no banco está
     * cifrada. Este teste lê a coluna bruta via JdbcTemplate (contornando o
     * AttributeConverter) e confirma o prefixo "enc:v1:" do CryptoConverter,
     * seguindo o mesmo padrão usado em FieldEncryptionMigrationRunnerIntegrationTest.
     */
    @Test
    void cpfEEnderecoFicamCriptografadosNoBancoMasEmTextoClaroViaService() {
        String cpfClaro = "123.456.789-01";
        String enderecoClaro = "Rua das Flores, 42";

        ClienteDTO dto = novoCliente("Cliente Teste Cripto", cpfClaro);
        dto.setEndereco(enderecoClaro);
        ClienteDTO criado = clienteService.criar(dto);

        // Via service, os dados continuam em texto claro (comportamento transparente do @Convert).
        assertEquals(cpfClaro, criado.getCpfOuCnpj());
        assertEquals(enderecoClaro, criado.getEndereco());

        // Via coluna bruta do banco, os dados devem estar cifrados.
        String cpfBruto = colunaBruta(criado.getId(), "cpf_ou_cnpj");
        String enderecoBruto = colunaBruta(criado.getId(), "endereco");

        assertTrue(cpfBruto.startsWith("enc:v1:"), "cpf_ou_cnpj deveria estar cifrado no banco");
        assertTrue(enderecoBruto.startsWith("enc:v1:"), "endereco deveria estar cifrado no banco");

        assertNotEquals(cpfClaro, cpfBruto);
        assertNotEquals(enderecoClaro, enderecoBruto);
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

    @Test
    void rankingDeReceitaSomaOsDoMesEDoAnoPorCliente() {
        ClienteDTO cliente = clienteService.criar(novoCliente("Cliente Ranking Teste", "131.313.131-31"));

        com.zeiss.pilot.dto.ServicoDTO servico1 = new com.zeiss.pilot.dto.ServicoDTO();
        servico1.setClienteId(cliente.getId());
        servico1.setSolicitacao("Calibração");
        servico1.setQuantidade(1);
        servico1.setStatus("1º Contato");
        servico1.setValor(new java.math.BigDecimal("500.00"));
        servico1.setDataCriacao(LocalDate.now());
        servicoService.criarServico(servico1);

        com.zeiss.pilot.dto.ServicoDTO servico2 = new com.zeiss.pilot.dto.ServicoDTO();
        servico2.setClienteId(cliente.getId());
        servico2.setSolicitacao("Digitalização");
        servico2.setQuantidade(1);
        servico2.setStatus("1º Contato");
        servico2.setValor(new java.math.BigDecimal("300.00"));
        servico2.setDataCriacao(LocalDate.now());
        servicoService.criarServico(servico2);

        List<com.zeiss.pilot.dto.ClienteReceitaDTO> ranking = clienteService.obterRankingReceita();

        com.zeiss.pilot.dto.ClienteReceitaDTO linhaDoCliente = ranking.stream()
                .filter(r -> r.getClienteId().equals(cliente.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cliente não apareceu no ranking"));

        assertEquals(0, new java.math.BigDecimal("800.00").compareTo(linhaDoCliente.getReceitaMes()));
        assertEquals(2, linhaDoCliente.getQtdOsMes());
        assertEquals(0, new java.math.BigDecimal("800.00").compareTo(linhaDoCliente.getReceitaAno()));
        assertEquals(2, linhaDoCliente.getQtdOsAno());
    }

    @Test
    void clienteSemOsApareceNoRankingComReceitaZero() {
        ClienteDTO cliente = clienteService.criar(novoCliente("Cliente Sem OS Teste", "141.414.141-41"));

        List<com.zeiss.pilot.dto.ClienteReceitaDTO> ranking = clienteService.obterRankingReceita();

        com.zeiss.pilot.dto.ClienteReceitaDTO linha = ranking.stream()
                .filter(r -> r.getClienteId().equals(cliente.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cliente sem OS deveria aparecer no ranking com zero"));

        assertEquals(0, java.math.BigDecimal.ZERO.compareTo(linha.getReceitaMes()));
        assertEquals(0, linha.getQtdOsMes());
    }
}
