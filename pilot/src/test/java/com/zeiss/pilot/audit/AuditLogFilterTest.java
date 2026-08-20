package com.zeiss.pilot.audit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class AuditLogFilterTest {

    @Mock
    private HttpServletRequest request;

    @Test
    void postSobApiDeveSerAuditado() {
        when(request.getRequestURI()).thenReturn("/api/servicos");
        when(request.getMethod()).thenReturn("POST");
        assertTrue(AuditLogFilter.deveAuditar(request));
    }

    @Test
    void deleteSobApiDeveSerAuditado() {
        when(request.getRequestURI()).thenReturn("/api/amostras/5");
        when(request.getMethod()).thenReturn("DELETE");
        assertTrue(AuditLogFilter.deveAuditar(request));
    }

    @Test
    void getSobApiNaoDeveSerAuditado() {
        when(request.getRequestURI()).thenReturn("/api/servicos");
        when(request.getMethod()).thenReturn("GET");
        assertFalse(AuditLogFilter.deveAuditar(request));
    }

    @Test
    void postForaDeApiNaoDeveSerAuditado() {
        // curto-circuito do && em deveAuditar: URI fora de /api/ já decide
        // sozinha, getMethod() nunca chega a ser chamado.
        when(request.getRequestURI()).thenReturn("/login");
        assertFalse(AuditLogFilter.deveAuditar(request));
    }
}
