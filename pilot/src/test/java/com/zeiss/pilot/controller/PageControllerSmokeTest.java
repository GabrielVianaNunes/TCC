package com.zeiss.pilot.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PageControllerSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest
    @ValueSource(strings = {
            "/index",
            "/projetos",
            "/usuarios",
            "/documentos",
            "/lista-eventos",
            "/dashboardEventos",
            "/servicos",
            "/dashboardServicos",
            "/visitasTecnicas",
            "/lista-editais",
            "/detalhes-edital",
            "/almoxarifado",
            "/amostras",
            "/dashboard-avaliacao",
            "/maquinas",
            "/verificacao-ambiental",
            "/kanban-estagiarios",
            "/dashboard-estagiarios"
    })
    @WithMockUser(roles = "ADMIN")
    void paginaAutenticadaRendorizaComSucesso(String rota) throws Exception {
        mockMvc.perform(get(rota)).andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/avaliacao", "/qrcode-avaliacao"})
    void paginaPublicaRendorizaComSucesso(String rota) throws Exception {
        mockMvc.perform(get(rota)).andExpect(status().isOk());
    }

    @org.junit.jupiter.api.Test
    @WithMockUser(roles = "ADMIN")
    void detalhesEditalComIdRendorizaComSucesso() throws Exception {
        mockMvc.perform(get("/editais/1")).andExpect(status().isOk());
    }
}
