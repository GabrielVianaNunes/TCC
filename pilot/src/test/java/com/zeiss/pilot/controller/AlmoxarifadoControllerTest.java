package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.entity.ItemAlmoxarifado;
import com.zeiss.pilot.repository.ItemAlmoxarifadoRepository;

/**
 * Cobertura HTTP (via controller real) de POST/PUT /api/almoxarifado/** —
 * confirma que @Valid dispara em ItemAlmoxarifadoDTO (nome, categoria,
 * unidade, quantidadeAtual, estoqueMinimo) e MovimentacaoAlmoxarifadoDTO
 * (itemId, tipo, quantidade, responsavel) na Fase 3b.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AlmoxarifadoControllerTest {

    private static final String ENDPOINT_ITENS = "/api/almoxarifado/itens";
    private static final String ENDPOINT_MOVIMENTACOES = "/api/almoxarifado/movimentacoes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ItemAlmoxarifadoRepository itemAlmoxarifadoRepository;

    private Long itemId;

    @BeforeEach
    void setUp() {
        ItemAlmoxarifado item = new ItemAlmoxarifado();
        item.setNome("Ponteira Ruby 1mm");
        item.setCategoria("Ponteiras");
        item.setUnidade("un");
        item.setQuantidadeAtual(10);
        item.setEstoqueMinimo(2);
        itemId = itemAlmoxarifadoRepository.save(item).getId();
    }

    @Test
    @WithMockUser
    void criarItemSemNomeRetorna400() throws Exception {
        String corpo = """
                {"categoria":"Ponteiras","unidade":"un","quantidadeAtual":10,"estoqueMinimo":2}
                """;
        mockMvc.perform(post(ENDPOINT_ITENS).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarItemSemCategoriaRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cabo USB-C 2m","unidade":"un","quantidadeAtual":10,"estoqueMinimo":2}
                """;
        mockMvc.perform(post(ENDPOINT_ITENS).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarItemSemUnidadeRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cabo USB-C 2m","categoria":"Ferramentas","quantidadeAtual":10,"estoqueMinimo":2}
                """;
        mockMvc.perform(post(ENDPOINT_ITENS).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarItemComQuantidadeAtualNegativaRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cabo USB-C 2m","categoria":"Ferramentas","unidade":"un","quantidadeAtual":-1,"estoqueMinimo":2}
                """;
        mockMvc.perform(post(ENDPOINT_ITENS).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarItemComEstoqueMinimoNegativoRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cabo USB-C 2m","categoria":"Ferramentas","unidade":"un","quantidadeAtual":10,"estoqueMinimo":-1}
                """;
        mockMvc.perform(post(ENDPOINT_ITENS).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarItemComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"nome":"Cabo USB-C 2m","categoria":"Ferramentas","unidade":"un","quantidadeAtual":10,"estoqueMinimo":2}
                """;
        mockMvc.perform(post(ENDPOINT_ITENS).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void atualizarItemSemCategoriaRetorna400() throws Exception {
        String corpo = """
                {"nome":"Ponteira Ruby 1mm","unidade":"un","quantidadeAtual":10,"estoqueMinimo":2}
                """;
        mockMvc.perform(put(ENDPOINT_ITENS + "/" + itemId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoSemTipoRetorna400() throws Exception {
        String corpo = """
                {"itemId": %d, "quantidade": 5, "responsavel": "Maria Souza"}
                """.formatted(itemId);
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoComTipoInvalidoRetorna400() throws Exception {
        String corpo = """
                {"itemId": %d, "tipo": "invalido", "quantidade": 5, "responsavel": "Maria Souza"}
                """.formatted(itemId);
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoComQuantidadeZeroRetorna400() throws Exception {
        String corpo = """
                {"itemId": %d, "tipo": "entrada", "quantidade": 0, "responsavel": "Maria Souza"}
                """.formatted(itemId);
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoSemResponsavelRetorna400() throws Exception {
        String corpo = """
                {"itemId": %d, "tipo": "entrada", "quantidade": 5}
                """.formatted(itemId);
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoComResponsavelContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {"itemId": %d, "tipo": "entrada", "quantidade": 5, "responsavel": "Tecnico99"}
                """.formatted(itemId);
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoSemItemIdRetorna400() throws Exception {
        String corpo = """
                {"tipo": "entrada", "quantidade": 5, "responsavel": "Maria Souza"}
                """;
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarMovimentacaoComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"itemId": %d, "tipo": "entrada", "quantidade": 5, "responsavel": "Maria Souza"}
                """.formatted(itemId);
        mockMvc.perform(post(ENDPOINT_MOVIMENTACOES).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }
}
