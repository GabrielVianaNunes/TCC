package com.zeiss.pilot.security;

import static org.hamcrest.Matchers.endsWith;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
}
