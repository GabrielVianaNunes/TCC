package com.zeiss.pilot.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
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

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.slf4j.LoggerFactory;

/**
 * Prova, com uma requisição HTTP real via MockMvc (não uma suposição sobre
 * ordem de filtro), que {@link AuditLogFilter} captura o status final tanto
 * de uma negação grosseira do {@code SecurityConfig} (sem @PreAuthorize
 * nenhum envolvido) quanto de uma negação fina de {@code @PreAuthorize}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuditLogIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private ListAppender<ILoggingEvent> appender;

    @BeforeEach
    void ligarCapturaDeLog() {
        appender = new ListAppender<>();
        appender.start();
        ((Logger) LoggerFactory.getLogger("AUDIT")).addAppender(appender);
    }

    @AfterEach
    void desligarCapturaDeLog() {
        ((Logger) LoggerFactory.getLogger("AUDIT")).detachAppender(appender);
    }

    private String ultimaLinha() {
        List<ILoggingEvent> eventos = appender.list;
        assertFalse(eventos.isEmpty(), "esperava pelo menos uma linha de auditoria");
        return eventos.get(eventos.size() - 1).getFormattedMessage();
    }

    @Test
    @WithMockUser(username = "auditor.sct@zeiss.com", roles = "CLIENTE")
    void negacaoGrosseiraDoSecurityConfigEAuditada() throws Exception {
        // /api/backup/executar exige ADMIN via authorizeHttpRequests, sem
        // nenhum @PreAuthorize envolvido — testa o caminho de negação mais cedo no chain.
        mockMvc.perform(post("/api/backup/executar").with(csrf()));

        String linha = ultimaLinha();
        assertTrue(linha.contains("usuario=auditor.sct@zeiss.com"));
        assertTrue(linha.contains("metodo=POST"));
        assertTrue(linha.contains("caminho=/api/backup/executar"));
        assertTrue(linha.contains("status=403"));
    }

    @Test
    @WithMockUser(username = "auditor2.sct@zeiss.com", roles = "GESTOR")
    void negacaoFinaDoPreAuthorizeEAuditada() throws Exception {
        // GET /api/documentos exige ADMIN via @PreAuthorize dentro do controller,
        // não via authorizeHttpRequests — testa o caminho de negação mais tardio.
        // GET não é auditado por padrão, então usamos DELETE (auditado) num id
        // inexistente: o que importa aqui é confirmar que o 403 do @PreAuthorize
        // chega à resposta antes do filtro de auditoria rodar.
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/api/documentos/999999").with(csrf()));

        String linha = ultimaLinha();
        assertTrue(linha.contains("usuario=auditor2.sct@zeiss.com"));
        assertTrue(linha.contains("status=403"));
    }

    @Test
    void requisicaoAnonimaAuditadaComoAnonimo() throws Exception {
        mockMvc.perform(post("/api/avaliacoes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"));

        String linha = ultimaLinha();
        assertTrue(linha.contains("usuario=anonimo"));
        assertTrue(linha.contains("caminho=/api/avaliacoes"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void requisicaoGetNaoEAuditada() throws Exception {
        mockMvc.perform(get("/api/usuarios"));
        assertTrue(appender.list.isEmpty(), "GET não deveria gerar linha de auditoria");
    }
}
