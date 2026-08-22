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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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
     * DataIntegrityViolationException, que é uma RuntimeException. O handler dedicado
     * retorna 409 Conflict com uma mensagem genérica sem expor nome de tabela, restrição,
     * colunas ou SQL. A mensagem do driver vai para o log do servidor apenas.
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
                .andExpect(status().isConflict())
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

    /**
     * Violações de restrição do banco (como UNIQUE constraints) chegam como
     * DataIntegrityViolationException. Quando dois clientes concorrentes passam
     * pela verificação de aplicação e ambos tentam salvar, o perdedor bate na
     * restrição do banco. O handler deve retornar 409 Conflict com uma mensagem
     * genérica — nunca expondo nome de tabela, nome de restrição ou SQL.
     */
    @Test
    void violacaoDeIntegridadeRetorna409ComMensagemGenerica() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        // Simula uma violação de restrição UNIQUE no banco (ex: cpf_ou_cnpj_hash duplicado)
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement; SQL [insert into clientes (cpf_ou_cnpj_hash, ...) values (?, ...)]; " +
                "constraint [UK_clientes_cpf_ou_cnpj_hash] violated: unique constraint or index violation");

        ResponseEntity<Map<String, String>> response = handler.handleDataIntegrityViolation(ex);

        // Assert: status 409 Conflict
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());

        // Assert: mensagem genérica, sem expor detalhe interno
        String msg = response.getBody().get("message");
        assertEquals("Conflito ao salvar: um registro com os mesmos dados já existe.", msg);

        // Assert: tem referência para correlacionar no log
        String ref = response.getBody().get("referencia");
        assertTrue(ref != null && ref.length() == 8, "Referência deve ter 8 caracteres");

        // Assert: NÃO expõe estrutura interna do banco
        assertFalse(msg.contains("clientes"), "Mensagem não deve mencionar nome de tabela");
        assertFalse(msg.contains("constraint"), "Mensagem não deve mencionar restrição");
        assertFalse(msg.contains("SQL"), "Mensagem não deve mencionar SQL");
    }
}
