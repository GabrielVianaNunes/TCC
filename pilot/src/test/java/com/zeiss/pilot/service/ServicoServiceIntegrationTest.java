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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.dto.ServicoDTO;
import com.zeiss.pilot.entity.Servico;
import com.zeiss.pilot.repository.ServicoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ServicoServiceIntegrationTest {

    @Autowired
    private ServicoService servicoService;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ServicoRepository servicoRepository;

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

    /**
     * Servico.cliente é gravado uma vez, na criação/atualização da OS, e nunca
     * mais atualizado se o nome do Cliente vinculado for corrigido depois via
     * /clientes. ServicoRepository.search precisa usar o nome ao vivo da
     * relação (clienteEntidade.nome), com fallback para o campo legado
     * congelado só para OS órfã sem cliente vinculado.
     */
    @Test
    void renomearClienteAtualizaBuscaDeOsPeloNomeNovo() {
        ClienteDTO cliente = clienteService.criar(clienteDeTeste("Cliente Renome Teste", "151.515.151-51"));

        ServicoDTO dto = novoServico("ignorado");
        dto.setClienteId(cliente.getId());
        ServicoDTO criado = servicoService.criarServico(dto);

        clienteService.atualizar(cliente.getId(), clienteDeTeste("Cliente Renomeado XYZ", "151.515.151-51"));

        Page<Servico> resultado = servicoRepository.search("Renomeado XYZ", null, PageRequest.of(0, 10));

        assertTrue(resultado.getContent().stream().anyMatch(s -> s.getId().equals(criado.getId())),
                "Busca pelo nome novo do cliente deveria encontrar a OS vinculada");
    }

    /**
     * search() navegava s.clienteEntidade.nome como implicit path expression
     * dentro do WHERE/COALESCE — Hibernate renderiza isso como um INNER JOIN
     * hoisted para o FROM, independente do ramo do OR/COALESCE que realmente
     * precisa dele. Resultado: toda Servico com cliente_id NULL (OS legada,
     * anterior à V7__cria_clientes.sql, ou cujo CPF/CNPJ não bateu na migração)
     * some da listagem inteira — inclusive de "listar tudo" (query = null),
     * não só da busca por nome. O fix troca para um LEFT JOIN explícito.
     */
    @Test
    void searchListaOsOrfaSemClienteVinculadoTantoNaListagemGeralQuantoPorNomeLegado() {
        String nomeLegado = "Cliente Orfao Sem Vinculo XYZ";
        Long servicoOrfaoId = inserirServicoOrfaoSemClienteId("OS-ORFA-0001", nomeLegado);

        Page<Servico> listagemGeral = servicoRepository.search(null, null, PageRequest.of(0, 200));
        assertTrue(listagemGeral.getContent().stream().anyMatch(s -> s.getId().equals(servicoOrfaoId)),
                "Servico com cliente_id NULL deveria aparecer na listagem geral (query=null) — "
                        + "um INNER JOIN implícito no path clienteEntidade.nome o excluiria silenciosamente");

        Page<Servico> buscaPorNomeLegado = servicoRepository.search("Orfao Sem Vinculo", null, PageRequest.of(0, 50));
        assertTrue(buscaPorNomeLegado.getContent().stream().anyMatch(s -> s.getId().equals(servicoOrfaoId)),
                "Busca pelo nome legado (fallback do COALESCE) deveria encontrar a OS órfã");
    }

    private Long inserirServicoOrfaoSemClienteId(String codigoOs, String nomeCliente) {
        jdbcTemplate.update(
                "INSERT INTO servicos (codigo_os, cliente, solicitacao, quantidade, status, valor, data_criacao) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                codigoOs, nomeCliente, "Calibração", 1, "1º Contato", new BigDecimal("100.00"),
                LocalDate.now());
        return jdbcTemplate.queryForObject("SELECT id FROM servicos WHERE codigo_os = ?", Long.class, codigoOs);
    }

    private com.zeiss.pilot.dto.ClienteDTO clienteDeTeste(String nome, String cpf) {
        com.zeiss.pilot.dto.ClienteDTO dto = new com.zeiss.pilot.dto.ClienteDTO();
        dto.setNome(nome);
        dto.setCpfOuCnpj(cpf);
        return dto;
    }
}
