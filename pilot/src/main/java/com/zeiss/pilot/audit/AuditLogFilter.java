package com.zeiss.pilot.audit;

import java.io.IOException;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Registra, em log estruturado dedicado ("AUDIT"), toda requisição de escrita
 * sob {@code /api/**} — OWASP A09 (Security Logging and Monitoring Failures).
 *
 * <p>Posicionado em {@code SecurityConfig} com {@code addFilterBefore(...,
 * ExceptionTranslationFilter.class)} de propósito: como {@code
 * ExceptionTranslationFilter} intercepta tanto a negação grosseira do
 * {@code authorizeHttpRequests} quanto a negação fina de {@code
 * @PreAuthorize} lançada de dentro do controller, qualquer filtro
 * posicionado ANTES dele sempre vê {@code chain.doFilter} retornar
 * normalmente, com o status HTTP final já definido na resposta — sem
 * precisar de try/catch para os dois casos de 403.
 */
public class AuditLogFilter extends OncePerRequestFilter {

    private static final Logger AUDIT = LoggerFactory.getLogger("AUDIT");

    private static final Set<String> METODOS_AUDITADOS = Set.of("POST", "PUT", "PATCH", "DELETE");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        filterChain.doFilter(request, response);

        if (deveAuditar(request)) {
            AUDIT.info("usuario={} metodo={} caminho={} status={}",
                    usuarioAutenticado(), request.getMethod(), request.getRequestURI(), response.getStatus());
        }
    }

    static boolean deveAuditar(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/api/") && METODOS_AUDITADOS.contains(request.getMethod());
    }

    private static String usuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return "anonimo";
        }
        return auth.getName();
    }
}
