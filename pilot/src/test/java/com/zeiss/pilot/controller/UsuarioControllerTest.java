package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

/**
 * Cobertura HTTP (via controller real) de POST /api/usuarios — confirma que
 * @Valid dispara na entidade Usuario anotada na Fase 2, incluindo o achado
 * do cargo em branco virando ADMIN->CLIENTE silencioso (UsuarioService.
 * derivarRole), que essa validação fecha.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UsuarioControllerTest {

    private static final String ADMIN_EMAIL = "admin.fase2.sct@zeiss.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void criarAdminChamador() {
        Usuario admin = new Usuario();
        admin.setNome("Admin Fase 2 Controller Test");
        admin.setEmail(ADMIN_EMAIL);
        admin.setSenha("x");
        admin.setRole("ADMIN");
        usuarioRepository.save(admin);
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void criarUsuarioSemCargoRetorna400() throws Exception {
        String corpo = """
                {"nome":"Usuario Sem Cargo","email":"semcargo@zeiss.com","senha":"senha123"}
                """;
        mockMvc.perform(post("/api/usuarios").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void criarUsuarioComSenhaCurtaRetorna400() throws Exception {
        String corpo = """
                {"nome":"Usuario Senha Curta","email":"senhacurta@zeiss.com","cargo":"TECNICO","senha":"123"}
                """;
        mockMvc.perform(post("/api/usuarios").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void criarUsuarioComNomeContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {"nome":"Tecnico99","email":"tecnico99@zeiss.com","cargo":"TECNICO","senha":"senha123"}
                """;
        mockMvc.perform(post("/api/usuarios").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void criarUsuarioComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"nome":"Usuario Completo Silva","email":"completo@zeiss.com","cargo":"TECNICO","senha":"senha123"}
                """;
        mockMvc.perform(post("/api/usuarios").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }
}
