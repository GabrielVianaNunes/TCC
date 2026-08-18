package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

/**
 * FO-358 da GETIN (dados pessoais) e boas práticas de sessão exigem que o
 * cookie de sessão só seja enviado por HTTPS. Como o app roda atrás de um
 * proxy (Caddy) que fala HTTP com o container, o Tomcat não consegue inferir
 * isso sozinho — precisa da flag {@code server.servlet.session.cookie.secure}
 * explícita, e não do valor dinâmico padrão baseado no esquema da requisição.
 *
 * <p>Usa uma porta real (não MockMvc) porque {@code MockHttpServletResponse}
 * não simula a geração do cabeçalho {@code Set-Cookie} do JSESSIONID feita
 * pelo container real.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT,
        properties = "server.servlet.session.cookie.secure=true")
@ActiveProfiles("test")
class SessionCookieSecurityTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void cookieDeSessaoTemFlagSecureQuandoConfigurado() {
        ResponseEntity<String> resposta = restTemplate.getForEntity("/login", String.class);

        List<String> cookies = resposta.getHeaders().get(HttpHeaders.SET_COOKIE);

        assertNotNull(cookies, "esperava um cookie de sessão (JSESSIONID) na resposta de /login");
        assertTrue(cookies.stream().anyMatch(c -> c.contains("JSESSIONID") && c.contains("Secure")),
                "esperava JSESSIONID com atributo Secure, recebi: " + cookies);
    }
}
