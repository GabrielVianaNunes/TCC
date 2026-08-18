package com.zeiss.pilot.security;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;
import com.zeiss.pilot.service.BackupService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BackupService backupService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Long salvarUsuario(String email, String cargo, String role) {
        Usuario u = new Usuario();
        u.setNome("Fixture " + email);
        u.setEmail(email);
        u.setSenha("x");
        u.setCargo(cargo);
        u.setRole(role);
        return usuarioRepository.save(u).getId();
    }

    @Test
    void usuariosSemAutenticacaoRedirecionaParaLogin() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login")));
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void usuariosAutenticadoSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void usuariosAutenticadoComRoleAdminRetorna200() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk());
    }

    /**
     * OWASP A05 / FO-358 da GETIN: sem CSP, um script injetado (XSS refletido,
     * ou uma dependência comprometida) pode carregar recursos de qualquer
     * origem externa. object-src 'none' e frame-ancestors 'none' bloqueiam
     * embed/clickjacking mesmo sem afetar os <script>/style="" inline que o
     * app usa em todas as páginas hoje (por isso script-src e style-src
     * ainda precisam de 'unsafe-inline' — restringi-los exigiria reescrever
     * todas as templates com nonce, fora do escopo de baixo custo).
     */
    @Test
    void respostaContemContentSecurityPolicy() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")))
                .andExpect(header().string("Content-Security-Policy", containsString("object-src 'none'")))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")));
    }

    @Test
    void fontesSemAutenticacaoRetorna200() throws Exception {
        // A tela de login usa @font-face para a fonte Inter servida localmente
        // (ver css/inter.css) — sem sessão, essa requisição precisa funcionar,
        // senão o navegador nunca carrega a fonte na própria tela de login.
        mockMvc.perform(get("/fonts/inter-latin.woff2"))
                .andExpect(status().isOk());
    }

    @Test
    void avaliacaoSemAutenticacaoRetorna200() throws Exception {
        mockMvc.perform(get("/avaliacao"))
                .andExpect(status().isOk());
    }

    @Test
    void qrcodeAvaliacaoSemAutenticacaoRetorna200() throws Exception {
        mockMvc.perform(get("/qrcode-avaliacao"))
                .andExpect(status().isOk());
    }

    @Test
    void postAvaliacoesSemAutenticacaoComCsrfValidoRetorna200() throws Exception {
        mockMvc.perform(post("/api/avaliacoes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void projetosSemAutenticacaoRedirecionaParaLogin() throws Exception {
        mockMvc.perform(get("/api/projetos"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login")));
    }

    @Test
    void backupSemAutenticacaoRedirecionaParaLogin() throws Exception {
        mockMvc.perform(post("/api/backup/executar").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login")));
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void backupAutenticadoSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(post("/api/backup/executar").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void backupAutenticadoComRoleAdminNaoBloqueiaAcessoDeSeguranca() throws Exception {
        mockMvc.perform(post("/api/backup/executar").with(csrf()))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @WithMockUser(username = "gestor.sct@zeiss.com", roles = "GESTOR")
    void gestorConsegueCriarUsuarioComCargoEstagiario() throws Exception {
        salvarUsuario("gestor.sct@zeiss.com", "GESTOR", "GESTOR");

        mockMvc.perform(post("/api/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Novo Estagiário\",\"email\":\"novo.estagiario.sct@zeiss.com\",\"senha\":\"senha123\",\"cargo\":\"ESTAGIARIO\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "gestor2.sct@zeiss.com", roles = "GESTOR")
    void gestorRecebe403AoTentarCriarUsuarioComCargoGestor() throws Exception {
        salvarUsuario("gestor2.sct@zeiss.com", "GESTOR", "GESTOR");

        mockMvc.perform(post("/api/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Outro Gestor\",\"email\":\"outro.gestor.sct@zeiss.com\",\"senha\":\"senha123\",\"cargo\":\"GESTOR\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "gestor3.sct@zeiss.com", roles = "GESTOR")
    void gestorConsegueEditarUsuarioQueJaEEstagiario() throws Exception {
        salvarUsuario("gestor3.sct@zeiss.com", "GESTOR", "GESTOR");
        Long alvoId = salvarUsuario("estagiario.alvo.sct@zeiss.com", "ESTAGIARIO", "ESTAGIARIO");

        mockMvc.perform(put("/api/usuarios/" + alvoId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Estagiário Editado\",\"email\":\"estagiario.alvo.sct@zeiss.com\",\"cargo\":\"ESTAGIARIO\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "gestor4.sct@zeiss.com", roles = "GESTOR")
    void gestorRecebe403AoTentarEditarUsuarioQueJaEAdmin() throws Exception {
        salvarUsuario("gestor4.sct@zeiss.com", "GESTOR", "GESTOR");
        Long alvoId = salvarUsuario("admin.alvo.sct@zeiss.com", "DIRETOR_CEM", "ADMIN");

        mockMvc.perform(put("/api/usuarios/" + alvoId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Tentativa\",\"email\":\"admin.alvo.sct@zeiss.com\",\"cargo\":\"DIRETOR_CEM\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "gestor5.sct@zeiss.com", roles = "GESTOR")
    void gestorConsegueExcluirUsuarioQueJaEEstagiario() throws Exception {
        salvarUsuario("gestor5.sct@zeiss.com", "GESTOR", "GESTOR");
        Long alvoId = salvarUsuario("estagiario.excluir.sct@zeiss.com", "ESTAGIARIO", "ESTAGIARIO");

        mockMvc.perform(delete("/api/usuarios/" + alvoId).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "gestor6.sct@zeiss.com", roles = "GESTOR")
    void gestorRecebe403AoTentarExcluirUsuarioQueJaEAdmin() throws Exception {
        salvarUsuario("gestor6.sct@zeiss.com", "GESTOR", "GESTOR");
        Long alvoId = salvarUsuario("admin.excluir.sct@zeiss.com", "DIRETOR_CEM", "ADMIN");

        mockMvc.perform(delete("/api/usuarios/" + alvoId).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void usuariosPostAutenticadoSemRoleAdminOuGestorRetorna403() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"X\",\"email\":\"x.sct@zeiss.com\",\"senha\":\"senha123\",\"cargo\":\"ESTAGIARIO\"}"))
                .andExpect(status().isForbidden());
    }
}
