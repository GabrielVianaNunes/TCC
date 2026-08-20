package com.zeiss.pilot.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.ExceptionTranslationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.zeiss.pilot.audit.AuditLogFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final LoginAttemptService loginAttemptService;

    public SecurityConfig(LoginAttemptService loginAttemptService) {
        this.loginAttemptService = loginAttemptService;
    }

    /**
     * FO-358 da GETIN + OWASP A05: sem CSP, um script injetado (XSS
     * refletido, dependência comprometida) pode carregar recursos de
     * qualquer origem. script-src e style-src ainda precisam de
     * 'unsafe-inline' porque todas as páginas hoje usam <script> e
     * style="" inline — removê-lo exigiria reescrever as templates com
     * nonce, fora do escopo desta correção.
     */
    private static final String CSP = "default-src 'self'; "
            + "script-src 'self' 'unsafe-inline'; "
            + "style-src 'self' 'unsafe-inline'; "
            + "img-src 'self' data:; "
            + "font-src 'self'; "
            + "connect-src 'self'; "
            + "object-src 'none'; "
            + "base-uri 'self'; "
            + "form-action 'self'; "
            + "frame-ancestors 'none'";

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives(CSP))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/login", "/css/**", "/img/**", "/js/**", "/fonts/**",
                    "/avaliacao", "/qrcode-avaliacao"
                ).permitAll()
                // Qualquer usuário autenticado precisa saber quem é (papel/nome
                // próprios) para a UI se adaptar ao papel — não é gestão de
                // outros usuários, por isso fica fora da regra ADMIN/GESTOR abaixo.
                .requestMatchers("/api/usuarios/me").authenticated()
                .requestMatchers("/api/usuarios/admins").hasRole("ADMIN")
                .requestMatchers("/api/usuarios/**").hasAnyRole("ADMIN", "GESTOR")
                .requestMatchers(HttpMethod.POST, "/api/avaliacoes").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/documentos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/eventos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/backup/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(new LoginRateLimitFilter(loginAttemptService), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new AuditLogFilter(), ExceptionTranslationFilter.class)
            .formLogin(form -> form
                .loginPage("/login")
                .successHandler((request, response, authentication) -> {
                    loginAttemptService.resetar(authentication.getName());
                    response.sendRedirect(request.getContextPath() + "/index");
                })
                .failureHandler((request, response, exception) -> {
                    loginAttemptService.registrarFalha(request.getParameter("username"));
                    response.sendRedirect(request.getContextPath() + "/login?error");
                })
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
