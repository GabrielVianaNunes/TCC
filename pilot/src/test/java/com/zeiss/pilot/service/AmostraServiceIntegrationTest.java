package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.AmostraDTO;
import com.zeiss.pilot.repository.AmostraRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AmostraServiceIntegrationTest {

    @Autowired
    private AmostraService amostraService;

    @Autowired
    private AmostraRepository amostraRepository;

    private AmostraDTO criar(String cliente, String descricao, String servicoRef, String status,
                              LocalDate dataEntrada, LocalDate dataDevPrevista) {
        AmostraDTO dto = new AmostraDTO();
        dto.setCliente(cliente);
        dto.setDescricao(descricao);
        dto.setServicoRef(servicoRef);
        dto.setStatus(status);
        dto.setDataEntrada(dataEntrada);
        dto.setDataDevPrevista(dataDevPrevista);
        return amostraService.salvar(dto);
    }

    @Test
    void listarPaginadoSemFiltroRetornaOrdenadoPorDataEntradaDesc() {
        criar("Cliente A", "desc A", "OS-1", "Em custódia", LocalDate.now().minusDays(2), null);
        criar("Cliente B", "desc B", "OS-2", "Em custódia", LocalDate.now().minusDays(1), null);
        criar("Cliente C", "desc C", "OS-3", "Em custódia", LocalDate.now(), null);

        Page<AmostraDTO> pagina = amostraService.listarPaginado(0, 10, null, null);

        List<AmostraDTO> conteudo = pagina.getContent();
        assertEquals(3, conteudo.size());
        assertEquals("Cliente C", conteudo.get(0).getCliente());
        assertEquals("Cliente B", conteudo.get(1).getCliente());
        assertEquals("Cliente A", conteudo.get(2).getCliente());
    }

    @Test
    void listarPaginadoComQueryFiltraPorClienteCaseInsensitive() {
        criar("Cliente Alpha", "peça de teste", "OS-10", "Em custódia", LocalDate.now(), null);
        criar("Cliente Beta", "outra peça", "OS-11", "Em custódia", LocalDate.now(), null);

        Page<AmostraDTO> pagina = amostraService.listarPaginado(0, 10, "alpha", null);

        assertEquals(1, pagina.getTotalElements());
        assertEquals("Cliente Alpha", pagina.getContent().get(0).getCliente());
    }

    @Test
    void listarPaginadoComStatusVencendoUsaCaminhoDeVencimento() {
        criar("Cliente Vencida", "peça vencida", "OS-20", "Em custódia", LocalDate.now(), LocalDate.now().minusDays(1));
        criar("Cliente Nao Vencida", "peça no prazo", "OS-21", "Em custódia", LocalDate.now(), LocalDate.now().plusDays(10));

        Page<AmostraDTO> pagina = amostraService.listarPaginado(0, 10, null, "Vencendo");

        assertEquals(1, pagina.getTotalElements());
        assertEquals("Cliente Vencida", pagina.getContent().get(0).getCliente());
    }

    @Test
    void getKpisContaCorretamentePorStatusEVencimento() {
        criar("Cliente 1", "d1", "OS-30", "Em custódia", LocalDate.now(), LocalDate.now().minusDays(1));
        criar("Cliente 2", "d2", "OS-31", "Em custódia", LocalDate.now(), LocalDate.now().plusDays(10));
        criar("Cliente 3", "d3", "OS-32", "Devolvida", LocalDate.now(), LocalDate.now().minusDays(5));

        Map<String, Long> kpis = amostraService.getKpis();

        assertEquals(3L, kpis.get("total"));
        assertEquals(2L, kpis.get("custodia"));
        assertEquals(1L, kpis.get("vencendo"));
        assertEquals(1L, kpis.get("devolvidas"));
    }

    @Test
    void buscarPorIdEncontradoRetornaDto() {
        AmostraDTO criada = criar("Cliente X", "desc X", "OS-40", "Em custódia", LocalDate.now(), null);

        AmostraDTO encontrada = amostraService.buscarPorId(criada.getId());

        assertEquals("Cliente X", encontrada.getCliente());
    }

    @Test
    void buscarPorIdNaoEncontradoLancaExcecao() {
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> amostraService.buscarPorId(999999L));
        assertTrue(ex.getMessage().contains("Amostra não encontrada"));
    }

    @Test
    void atualizarEncontradoAtualizaCampos() {
        AmostraDTO criada = criar("Cliente Y", "desc original", "OS-50", "Em custódia", LocalDate.now(), null);

        AmostraDTO novosDados = new AmostraDTO();
        novosDados.setCliente("Cliente Y Atualizado");
        novosDados.setDescricao("desc atualizada");
        novosDados.setStatus("Devolvida");

        AmostraDTO atualizada = amostraService.atualizar(criada.getId(), novosDados);

        assertEquals("Cliente Y Atualizado", atualizada.getCliente());
        assertEquals("desc atualizada", atualizada.getDescricao());
        assertEquals("Devolvida", atualizada.getStatus());
    }

    @Test
    void atualizarNaoEncontradoLancaExcecao() {
        AmostraDTO novosDados = new AmostraDTO();
        novosDados.setCliente("Não importa");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> amostraService.atualizar(999999L, novosDados));
        assertTrue(ex.getMessage().contains("Amostra não encontrada"));
    }

    @Test
    void deletarRemoveRegistro() {
        AmostraDTO criada = criar("Cliente Z", "desc Z", "OS-60", "Em custódia", LocalDate.now(), null);

        amostraService.deletar(criada.getId());

        assertTrue(amostraRepository.findById(criada.getId()).isEmpty());
    }
}
