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
                {"nome":"Cliente Controller A","cpfOuCnpj":"123.456.789-09","telefone":"(11) 98888-7777","endereco":"Rua Teste, 1"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(primeiroCorpo))
                .andExpect(status().isOk());

        String segundoCorpo = """
                {"nome":"Cliente Controller B","cpfOuCnpj":"123.456.789-09","telefone":"(11) 97777-6666","endereco":"Rua Teste, 2"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(segundoCorpo))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void criarClienteSemTelefoneRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cliente Sem Telefone","cpfOuCnpj":"529.982.247-25","endereco":"Rua Teste, 3"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void criarClienteComCpfInvalidoRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cliente CPF Ruim","cpfOuCnpj":"111.111.111-11","telefone":"(11) 90000-0000","endereco":"Rua Teste, 4"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void criarClienteComNomeContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {"nome":"Cliente123","cpfOuCnpj":"111.444.777-35","telefone":"(11) 90000-1111","endereco":"Rua Teste, 5"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void criarClienteComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"nome":"Indústria Completa Ltda.","cpfOuCnpj":"11.222.333/0001-81","telefone":"(41) 3055-1234","endereco":"Av. Brasil, 900","email":"contato@industriacompleta.com.br"}
                """;
        mockMvc.perform(post("/api/clientes").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }
}
