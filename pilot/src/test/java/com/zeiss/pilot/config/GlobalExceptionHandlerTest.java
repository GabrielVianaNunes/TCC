package com.zeiss.pilot.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesRegex;
import static org.hamcrest.Matchers.not;

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
 * Garante que a resposta de erro da API nunca devolve detalhe interno ao
 * cliente. Exigência do FO-358 da GETIN ("as páginas de erro devem ser
 * personalizadas e genéricas, com a finalidade de impossibilitar que os
 * atacantes obtenham informações sensíveis") e do OWASP A05.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Uma violação de restrição do banco chega ao handler como
     * DataIntegrityViolationException, que é uma RuntimeException. Antes desta
     * correção, a mensagem do driver ia inteira para o cliente, expondo nome de
     * tabela, nome da restrição, a lista completa de colunas e o SQL.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void erroDeBancoNaoVazaEstruturaInternaParaOCliente() throws Exception {
        // 'status' fora do CHECK servicos_status_check -> violação no INSERT
        String corpo = """
                {"cliente":"Cliente Teste Handler","solicitacao":"Teste",
                 "quantidade":1,"status":"STATUS_QUE_NAO_EXISTE",
                 "valor":100.00,"dataCriacao":"2026-08-18"}
                """;

        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value(not(allOf(
                        containsString("servicos"),          // nome da tabela
                        containsString("insert into"),       // o SQL
                        containsString("codigo_os")))))      // nome de coluna
                // e deve trazer um identificador para correlacionar com o log
                .andExpect(jsonPath("$.referencia").value(matchesRegex("[0-9a-f]{8}")));
    }

    /**
     * A mensagem de "não encontrado" é lançada pelos nossos próprios services,
     * com texto controlado, e o frontend depende do 404. Esse comportamento
     * precisa sobreviver à correção.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void recursoInexistenteContinuaRetornando404() throws Exception {
        mockMvc.perform(get("/api/servicos/99999999"))
                .andExpect(status().isNotFound());
    }
}
