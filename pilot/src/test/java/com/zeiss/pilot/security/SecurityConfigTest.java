package com.zeiss.pilot.security;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
    @WithMockUser(username = "tecnico.me.sct@zeiss.com", roles = "TECNICO")
    void meRetornaODadoDoProprioUsuarioAutenticado() throws Exception {
        salvarUsuario("tecnico.me.sct@zeiss.com", "TECNICO", "TECNICO");

        mockMvc.perform(get("/api/usuarios/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("tecnico.me.sct@zeiss.com"))
                .andExpect(jsonPath("$.role").value("TECNICO"));
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void documentosGeraisSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(get("/api/documentos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TECNICO")
    void documentosGeraisTecnicoNaoTemAcesso() throws Exception {
        mockMvc.perform(get("/api/documentos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void documentosGeraisEstagiarioNaoTemAcesso() throws Exception {
        mockMvc.perform(get("/api/documentos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void documentosGeraisComRoleAdminRetorna200() throws Exception {
        mockMvc.perform(get("/api/documentos"))
                .andExpect(status().isOk());
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

    // ── Cobertura sistemática de autorização por papel (OWASP A01) ──────────
    // Cada teste abaixo cobre uma regra já declarada em SecurityConfig ou via
    // @PreAuthorize que ainda não tinha nenhum teste — não são regras novas.

    @Test
    @WithMockUser(roles = "GESTOR")
    void usuariosAdminsExigeAdminMesmoParaGestorQueTemAcessoAoRestoDeApiUsuarios() throws Exception {
        // /api/usuarios/admins tem uma regra hasRole(ADMIN) própria, mais
        // restrita que o hasAnyRole(ADMIN, GESTOR) do resto de /api/usuarios/**
        // — precisa vir ANTES da regra genérica em SecurityConfig, senão essa
        // rota ficaria acessível a Gestor por engano.
        mockMvc.perform(get("/api/usuarios/admins"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void usuariosAdminsComRoleAdminRetorna200() throws Exception {
        mockMvc.perform(get("/api/usuarios/admins"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void uploadDocumentoGeralSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .multipart("/api/documentos/upload")
                        .file(new org.springframework.mock.web.MockMultipartFile(
                                "arquivo", "teste.pdf", "application/pdf", "conteudo".getBytes()))
                        .param("dataExpiracao", "2027-01-01")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void editarExpiracaoDocumentoGeralSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(put("/api/documentos/1/expiracao")
                        .param("data", "2027-01-01")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void removerDocumentoGeralSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(delete("/api/documentos/1").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void criarEventoSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(post("/api/eventos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Evento Teste\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void criarEventoComRoleAdminRetorna200() throws Exception {
        // "horario" incluído desde V10__vincula_responsavel_cliente.sql
        // (eventos.horario virou NOT NULL) — sem relação com o que este
        // teste verifica (autorização por role), só evita 500 por
        // violação de constraint antes que EventoDTO tenha @NotBlank
        // próprio no campo (adicionado numa task posterior do mesmo plano).
        mockMvc.perform(post("/api/eventos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Evento Teste\",\"horario\":\"10:00\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void uploadDocumentoDeMaquinaSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .multipart("/api/maquinas/1/documentos/upload")
                        .file(new org.springframework.mock.web.MockMultipartFile(
                                "arquivo", "teste.pdf", "application/pdf", "conteudo".getBytes()))
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "GESTOR")
    void removerDocumentoDeMaquinaSemRoleAdminRetorna403() throws Exception {
        mockMvc.perform(delete("/api/maquinas/1/documentos/1").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void listarDocumentosDeMaquinaNaoExigePapelEspecifico() throws Exception {
        // Diferente dos documentos gerais do laboratório, documentos por
        // máquina são abertos a quem já tem acesso à máquina — sem
        // @PreAuthorize no GET, só a regra genérica "autenticado".
        mockMvc.perform(get("/api/maquinas/1/documentos"))
                .andExpect(status().isOk());
    }

    @Test
    void clientesSemAutenticacaoRedirecionaParaLogin() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login")));
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void clientesAutenticadoComQualquerPapelRetorna200() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk());
    }

    /**
     * /clientes/relatorio (ranking de receita por cliente) fica sob um prefixo
     * de URL diferente de /api/clientes — protegido só pela regra catch-all
     * anyRequest().authenticated() do SecurityConfig, sem regra própria. Mesma
     * cobertura de dupla ponta (anônimo x autenticado) já existente para
     * /api/clientes.
     */
    @Test
    void clientesRelatorioSemAutenticacaoRedirecionaParaLogin() throws Exception {
        mockMvc.perform(get("/clientes/relatorio"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", endsWith("/login")));
    }

    @Test
    @WithMockUser(roles = "ESTAGIARIO")
    void clientesRelatorioAutenticadoComQualquerPapelRetorna200() throws Exception {
        mockMvc.perform(get("/clientes/relatorio"))
                .andExpect(status().isOk());
    }
}
