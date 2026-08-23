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
 * Cobertura HTTP (via controller real) de POST /api/editais — confirma que
 * @Valid dispara em EditalDTO na Fase 3a (nomeEdital, instituicaoFornecedora,
 * status, valor).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EditalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String ENDPOINT = "/api/editais";

    @Test
    @WithMockUser
    void criarEditalSemNomeRetorna400() throws Exception {
        String corpo = """
                {"status":"Aguardando aprovação","instituicaoFornecedora":"FINEP","valor":10000.00}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarEditalSemStatusRetorna400() throws Exception {
        String corpo = """
                {"nomeEdital":"Edital Teste","instituicaoFornecedora":"FINEP","valor":10000.00}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarEditalSemInstituicaoFornecedoraRetorna400() throws Exception {
        String corpo = """
                {"nomeEdital":"Edital Teste","status":"Aguardando aprovação","valor":10000.00}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarEditalSemValorRetorna400() throws Exception {
        String corpo = """
                {"nomeEdital":"Edital Teste","status":"Aguardando aprovação","instituicaoFornecedora":"FINEP"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarEditalComValorZeroRetorna400() throws Exception {
        String corpo = """
                {"nomeEdital":"Edital Teste","status":"Aguardando aprovação","instituicaoFornecedora":"FINEP","valor":0}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarEditalComInstituicaoFornecedoraContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {"nomeEdital":"Edital Teste","status":"Aguardando aprovação","instituicaoFornecedora":"FINEP99","valor":10000.00}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarEditalComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"nomeEdital":"Edital de Fomento 2027","status":"Aguardando aprovação","instituicaoFornecedora":"FINEP","instituicaoParceira":"SENAI Nacional","valor":150000.00,"observacao":"Teste"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }
}
