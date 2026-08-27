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
import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.entity.TipoServico;
import com.zeiss.pilot.exception.ClienteConflitoException;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.TipoServicoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ClienteServiceIntegrationTest {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ServicoService servicoService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MaquinaRepository maquinaRepository;

    @Autowired
    private TipoServicoRepository tipoServicoRepository;

    private ClienteDTO novoCliente(String nome, String cpf) {
        ClienteDTO dto = new ClienteDTO();
        dto.setNome(nome);
        dto.setCpfOuCnpj(cpf);
        return dto;
    }

    private String colunaBruta(Long id, String coluna) {
        return jdbcTemplate.queryForObject("SELECT " + coluna + " FROM clientes WHERE id = ?", String.class, id);
    }

    private Long maquinaDeTeste() {
        Maquina m = new Maquina();
        m.setNome("Maquina Teste");
        m.setTipoMedida("Medição por Coordenadas (CMM)");
        return maquinaRepository.save(m).getId();
    }

    private Long tipoServicoDeTeste() {
        TipoServico t = new TipoServico();
        t.setCategoria("Medição por Coordenadas (CMM)");
        t.setDescricao("Serviço de teste");
        return tipoServicoRepository.save(t).getId();
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

        ClienteConflitoException ex = assertThrows(ClienteConflitoException.class,
                () -> clienteService.criar(novoCliente("Outro Nome", "222.222.222-22")));
        assertEquals("Já existe um cliente cadastrado com este CPF/CNPJ.", ex.getMessage());
    }

    @Test
    void criarComCpfIgualMasMascaraDiferenteAindaAssimEDetectadoComoDuplicata() {
        clienteService.criar(novoCliente("Cliente Teste C", "333.333.333-33"));

        ClienteConflitoException ex = assertThrows(ClienteConflitoException.class,
                () -> clienteService.criar(novoCliente("Outro Nome", "33333333333")));
        assertEquals("Já existe um cliente cadastrado com este CPF/CNPJ.", ex.getMessage());
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

        ClienteConflitoException ex = assertThrows(ClienteConflitoException.class,
                () -> clienteService.atualizar(clienteE2.getId(), novoCliente("Cliente Teste E2", "555.555.555-55")));
        assertEquals("Já existe um cliente cadastrado com este CPF/CNPJ.", ex.getMessage());
    }

    @Test
    void criarComCpfNuloLancaIllegalArgumentException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> clienteService.criar(novoCliente("Cliente Sem CPF", null)));
        assertEquals("CPF/CNPJ é obrigatório.", ex.getMessage());
    }

    @Test
    void criarComCpfSomenteCaracteresNaoNumericosLancaIllegalArgumentException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> clienteService.criar(novoCliente("Cliente CPF Invalido", "abc")));
        assertEquals("CPF/CNPJ é obrigatório.", ex.getMessage());
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

        RuntimeException ex = assertThrows(RuntimeException.class, () -> clienteService.buscarPorId(criado.getId()));
        assertTrue(ex.getMessage().contains("não encontrado"));
    }

    /**
     * @Convert torna a criptografia transparente na camada de service — um
     * round-trip que passa não prova, por si só, que a coluna no banco está
     * cifrada. Este teste lê a coluna bruta via JdbcTemplate (contornando o
     * AttributeConverter) e confirma o prefixo "enc:v1:" do CryptoConverter.
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
        servico.setMaquinaId(maquinaDeTeste());
        servico.setTipoServicoId(tipoServicoDeTeste());
        servico.setSolicitacao("Calibração");
        servico.setQuantidade(1);
        servico.setStatus("1º Contato");
        servico.setValor(new java.math.BigDecimal("100.00"));
        servico.setDataCriacao(LocalDate.now());
        servicoService.criarServico(servico);

        ClienteConflitoException ex = assertThrows(ClienteConflitoException.class, () -> clienteService.excluir(cliente.getId()));
        assertEquals("Não é possível excluir um cliente com Ordens de Serviço vinculadas.", ex.getMessage());
    }

    @Test
    void rankingDeReceitaSomaOsDoMesEDoAnoPorCliente() {
        ClienteDTO cliente = clienteService.criar(novoCliente("Cliente Ranking Teste", "131.313.131-31"));
        Long maquinaId = maquinaDeTeste();
        Long tipoServicoId = tipoServicoDeTeste();

        com.zeiss.pilot.dto.ServicoDTO servico1 = new com.zeiss.pilot.dto.ServicoDTO();
        servico1.setClienteId(cliente.getId());
        servico1.setMaquinaId(maquinaId);
        servico1.setTipoServicoId(tipoServicoId);
        servico1.setSolicitacao("Calibração");
        servico1.setQuantidade(1);
        servico1.setStatus("Venda finalizada");
        servico1.setValor(new java.math.BigDecimal("500.00"));
        servico1.setDataCriacao(LocalDate.now());
        servicoService.criarServico(servico1);

        com.zeiss.pilot.dto.ServicoDTO servico2 = new com.zeiss.pilot.dto.ServicoDTO();
        servico2.setClienteId(cliente.getId());
        servico2.setMaquinaId(maquinaId);
        servico2.setTipoServicoId(tipoServicoId);
        servico2.setSolicitacao("Digitalização");
        servico2.setQuantidade(1);
        servico2.setStatus("Venda finalizada");
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

    @Test
    void rankingDeReceitaIgnoraOsQueNaoSaoVendaFinalizada() {
        ClienteDTO cliente = clienteService.criar(novoCliente("Cliente Pipeline Aberto", "151.515.151-51"));
        Long maquinaId = maquinaDeTeste();
        Long tipoServicoId = tipoServicoDeTeste();

        com.zeiss.pilot.dto.ServicoDTO servico = new com.zeiss.pilot.dto.ServicoDTO();
        servico.setClienteId(cliente.getId());
        servico.setMaquinaId(maquinaId);
        servico.setTipoServicoId(tipoServicoId);
        servico.setSolicitacao("Calibração");
        servico.setQuantidade(1);
        servico.setStatus("Negociação");
        servico.setValor(new java.math.BigDecimal("999.00"));
        servico.setDataCriacao(LocalDate.now());
        servicoService.criarServico(servico);

        List<com.zeiss.pilot.dto.ClienteReceitaDTO> ranking = clienteService.obterRankingReceita();

        com.zeiss.pilot.dto.ClienteReceitaDTO linha = ranking.stream()
                .filter(r -> r.getClienteId().equals(cliente.getId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Cliente deveria aparecer no ranking (com receita zero)"));

        assertEquals(0, java.math.BigDecimal.ZERO.compareTo(linha.getReceitaMes()));
        assertEquals(0, linha.getQtdOsMes());
        assertEquals(0, java.math.BigDecimal.ZERO.compareTo(linha.getReceitaAno()));
        assertEquals(0, linha.getQtdOsAno());
    }

    @Test
    void receitaMensalDetalhadaAgrupaPorClienteAnoEMes() {
        ClienteDTO cliente = clienteService.criar(novoCliente("Cliente Mensal Teste", "161.616.161-61"));
        Long maquinaId = maquinaDeTeste();
        Long tipoServicoId = tipoServicoDeTeste();

        com.zeiss.pilot.dto.ServicoDTO vendaFechada = new com.zeiss.pilot.dto.ServicoDTO();
        vendaFechada.setClienteId(cliente.getId());
        vendaFechada.setMaquinaId(maquinaId);
        vendaFechada.setTipoServicoId(tipoServicoId);
        vendaFechada.setSolicitacao("Calibração");
        vendaFechada.setQuantidade(1);
        vendaFechada.setStatus("Venda finalizada");
        vendaFechada.setValor(new java.math.BigDecimal("1200.00"));
        vendaFechada.setDataCriacao(LocalDate.of(2024, 3, 15));
        servicoService.criarServico(vendaFechada);

        com.zeiss.pilot.dto.ServicoDTO emNegociacao = new com.zeiss.pilot.dto.ServicoDTO();
        emNegociacao.setClienteId(cliente.getId());
        emNegociacao.setMaquinaId(maquinaId);
        emNegociacao.setTipoServicoId(tipoServicoId);
        emNegociacao.setSolicitacao("Digitalização");
        emNegociacao.setQuantidade(1);
        emNegociacao.setStatus("Negociação");
        emNegociacao.setValor(new java.math.BigDecimal("5000.00"));
        emNegociacao.setDataCriacao(LocalDate.of(2024, 3, 20));
        servicoService.criarServico(emNegociacao);

        List<com.zeiss.pilot.dto.ClienteReceitaMensalDTO> detalhado = clienteService.obterReceitaMensalDetalhada();

        List<com.zeiss.pilot.dto.ClienteReceitaMensalDTO> linhasDoCliente = detalhado.stream()
                .filter(r -> r.getClienteId().equals(cliente.getId()))
                .toList();

        assertEquals(1, linhasDoCliente.size(),
                "Só a linha de março/2024 (Venda finalizada) deveria existir — a de Negociação não conta");
        com.zeiss.pilot.dto.ClienteReceitaMensalDTO linha = linhasDoCliente.get(0);
        assertEquals(2024, linha.getAno());
        assertEquals(3, linha.getMes());
        assertEquals(0, new java.math.BigDecimal("1200.00").compareTo(linha.getReceita()));
        assertEquals(1, linha.getQtdOs());
    }
}
