package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cobertura HTTP (via controller real) de POST /api/projetos — confirma
 * que @Valid dispara em ProjetoDTO na Fase 3a (nomeProjeto,
 * custoAnualPrevisto, retornoPrevisto).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProjetoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String ENDPOINT = "/api/projetos";

    @Test
    @WithMockUser
    void criarProjetoSemNomeRetorna400() throws Exception {
        String corpo = """
                {"status":"A iniciar","prioridade":"Alta"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarProjetoSemPrioridadeRetorna400() throws Exception {
        String corpo = """
                {"nomeProjeto":"Projeto Teste","status":"A iniciar"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarProjetoSemStatusRetorna400() throws Exception {
        String corpo = """
                {"nomeProjeto":"Projeto Teste","prioridade":"Alta"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarProjetoComCustoAnualPrevistoZeroRetorna400() throws Exception {
        String corpo = """
                {"nomeProjeto":"Projeto Teste","status":"A iniciar","prioridade":"Alta","custoAnualPrevisto":0}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarProjetoComRetornoPrevistoNegativoRetorna400() throws Exception {
        String corpo = """
                {"nomeProjeto":"Projeto Teste","status":"A iniciar","prioridade":"Alta","retornoPrevisto":-500.00}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarProjetoComNomeContendoNumeroRetorna200() throws Exception {
        String corpo = """
                {"nomeProjeto":"Projeto 4.0","status":"A iniciar","prioridade":"Alta"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void criarProjetoComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"nomeProjeto":"Projeto Modernização Laboratorial","objetivo":"Atualizar equipamentos","status":"A iniciar","prioridade":"Alta","custoAnualPrevisto":50000.00,"retornoPrevisto":120000.00}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }
}
