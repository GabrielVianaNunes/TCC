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
 * Cobertura HTTP (via controller real) de POST /api/clientes — complementa o
 * assertThrows de ClienteServiceIntegrationTest, que testa a camada de service
 * isolada. Aqui a rota completa (autenticação, CSRF, serialização JSON,
 * GlobalExceptionHandler) é exercitada de ponta a ponta.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void criarClienteComCpfDuplicadoRetorna409ViaController() throws Exception {
        String primeiroCorpo = """
                {"nome":"Cliente Controller A","cpfOuCnpj":"171.717.171-71"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(primeiroCorpo))
                .andExpect(status().isOk());

        String segundoCorpo = """
                {"nome":"Cliente Controller B","cpfOuCnpj":"171.717.171-71"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(segundoCorpo))
                .andExpect(status().isConflict());
    }
}
