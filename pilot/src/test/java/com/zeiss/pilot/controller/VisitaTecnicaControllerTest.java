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
 * Cobertura HTTP (via controller real) de POST /api/visitas-tecnicas —
 * confirma que @Valid dispara em VisitaTecnicaDTO na Fase 3a (responsavel,
 * empresaInstituicao, dataSolicitada, localVisita, quantidadeVisitantes,
 * telefones, visitaRealizada).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VisitaTecnicaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String ENDPOINT = "/api/visitas-tecnicas";

    @Test
    @WithMockUser
    void criarVisitaSemResponsavelRetorna400() throws Exception {
        String corpo = """
                {"empresaInstituicao":"Empresa Teste","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemEmpresaRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComResponsavelContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Tecnico99","empresaInstituicao":"Empresa Teste","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void criarVisitaSemDataSolicitadaRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemLocalVisitaRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","dataSolicitada":"2026-09-01","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemQuantidadeVisitantesRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","dataSolicitada":"2026-09-01","localVisita":"Sala 3","telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemTelefonesRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemVisitaRealizadaRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComQuantidadeZeroRetorna400() throws Exception {
        String corpo = """
                {"responsavel":"Maria Souza","empresaInstituicao":"Fundação Educacional Exemplo","dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":0,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }
}
