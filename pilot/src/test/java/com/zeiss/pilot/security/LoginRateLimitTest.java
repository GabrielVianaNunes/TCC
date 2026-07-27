package com.zeiss.pilot.security;

import static org.hamcrest.Matchers.endsWith;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class LoginRateLimitTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LoginAttemptService loginAttemptService;

    private void criarUsuario(String email, String senhaPlana) {
        Usuario u = new Usuario();
        u.setNome("Fixture " + email);
        u.setEmail(email);
        u.setSenha(passwordEncoder.encode(senhaPlana));
        u.setRole("ADMIN");
        usuarioRepository.save(u);
    }

    @Test
    void quintaTentativaFalhaAindaProcessaESextaEBloqueada() throws Exception {
        String email = "ratelimit1.teste@zeiss.com";
        criarUsuario(email, "senhaCorreta123");
        loginAttemptService.resetar(email);

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/login")
                            .with(csrf())
                            .param("username", email)
                            .param("password", "senhaErrada"))
                    .andExpect(status().is3xxRedirection())
                    .andExpect(header().string("Location", endsWith("/login?error")));
        }

        mockMvc.perform(post("/login")
                        .with(csrf())
                        .param("username", email)
                        .param("password", "senhaErrada"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login?bloqueado")));
    }

    @Test
    void emailDiferenteNaoEAfetadoPeloBloqueioDeOutro() throws Exception {
        String emailBloqueado = "ratelimit2.teste@zeiss.com";
        String emailLivre = "ratelimit3.teste@zeiss.com";
        criarUsuario(emailBloqueado, "senhaCorreta123");
        criarUsuario(emailLivre, "senhaCorreta123");
        loginAttemptService.resetar(emailBloqueado);
        loginAttemptService.resetar(emailLivre);

        for (int i = 0; i < 6; i++) {
            mockMvc.perform(post("/login")
                    .with(csrf())
                    .param("username", emailBloqueado)
                    .param("password", "senhaErrada"));
        }

        mockMvc.perform(post("/login")
                        .with(csrf())
                        .param("username", emailLivre)
                        .param("password", "senhaErrada"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login?error")));
    }

    @Test
    void loginBemSucedidoResetaContadorDeFalhas() throws Exception {
        String email = "ratelimit4.teste@zeiss.com";
        criarUsuario(email, "senhaCorreta123");
        loginAttemptService.resetar(email);

        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/login")
                    .with(csrf())
                    .param("username", email)
                    .param("password", "senhaErrada"));
        }

        mockMvc.perform(post("/login")
                        .with(csrf())
                        .param("username", email)
                        .param("password", "senhaCorreta123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/index")));

        mockMvc.perform(post("/login")
                        .with(csrf())
                        .param("username", email)
                        .param("password", "senhaErrada"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login?error")));
    }
}
