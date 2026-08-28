package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

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
import com.zeiss.pilot.entity.VisitaTecnica;
import com.zeiss.pilot.repository.UsuarioRepository;
import com.zeiss.pilot.repository.VisitaTecnicaRepository;

/**
 * Cobertura HTTP (via controller real) de POST/PUT /api/visitas-tecnicas —
 * confirma que @Valid dispara em VisitaTecnicaDTO (dataSolicitada,
 * localVisita, quantidadeVisitantes, telefones, visitaRealizada) e que o
 * service rejeita responsavelId ausente ou de cargo não permitido
 * (Gestor/Técnico apenas) e clienteId ausente numa visita não interna.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VisitaTecnicaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VisitaTecnicaRepository visitaTecnicaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final String ENDPOINT = "/api/visitas-tecnicas";

    private Long usuarioComCargo(String cargo, String emailUnico) {
        Usuario u = new Usuario();
        u.setNome("Usuario Teste");
        u.setEmail(emailUnico);
        u.setSenha("senha123");
        u.setCargo(cargo);
        u.setRole(cargo);
        return usuarioRepository.save(u).getId();
    }

    private Long usuarioComCargoNulo(String emailUnico) {
        Usuario u = new Usuario();
        u.setNome("Usuario Sem Cargo");
        u.setEmail(emailUnico);
        u.setSenha("senha123");
        // cargo propositalmente não definido (fica null) — reproduz o admin
        // bootstrap do AdminInitializer, que nunca seta cargo.
        u.setRole("ADMIN");
        return usuarioRepository.save(u).getId();
    }

    @Test
    @WithMockUser
    void criarVisitaSemResponsavelIdRetorna400() throws Exception {
        String corpo = """
                {"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComResponsavelDeCargoNaoPermitidoRetorna400() throws Exception {
        Long estagiarioId = usuarioComCargo("ESTAGIARIO", "estagiario.visita.teste@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, estagiarioId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComPayloadCompletoEValidoRetorna200() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste1@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void criarVisitaNaoInternaSemClienteIdRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste2@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":false,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemDataSolicitadaRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste3@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemLocalVisitaRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste4@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemQuantidadeVisitantesRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste5@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemTelefonesRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste6@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaSemVisitaRealizadaRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste7@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000"}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComQuantidadeZeroRetorna400() throws Exception {
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste8@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":0,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void atualizarVisitaComTelefonesEmBrancoRetorna400() throws Exception {
        VisitaTecnica existente = new VisitaTecnica();
        existente.setResponsavel("Maria Souza");
        existente.setEmpresaInstituicao("CEM SENAI Zeiss");
        existente.setDataSolicitada(LocalDate.now());
        existente.setLocalVisita("Sala 3");
        existente.setQuantidadeVisitantes(15);
        existente.setTelefones("(48) 99999-0000");
        existente.setVisitaRealizada(false);
        Long id = visitaTecnicaRepository.save(existente).getId();

        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.teste9@zeiss.com");
        String corpoAtualizacao = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(put(ENDPOINT + "/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoAtualizacao))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarVisitaComResponsavelDeCargoNuloRetorna400EmVezDe500() throws Exception {
        // Fix 2 da revisão final: usuarios.cargo é nullable no schema real
        // (V1__baseline.sql) — Set.of(...).contains(null) lançava NPE (500)
        // em vez do 400 esperado antes da checagem de null explícita.
        Long semCargoId = usuarioComCargoNulo("sem.cargo.visita.teste@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, semCargoId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void atualizarVisitaInexistenteRetorna404() throws Exception {
        // Fix 3 da revisão final: VisitaTecnicaService lança "Visita técnica
        // não encontrada" (feminino) — GlobalExceptionHandler antes só
        // reconhecia o radical masculino "não encontrado" e isso caía no
        // 500 genérico em vez do 404 esperado pelo frontend.
        Long responsavelId = usuarioComCargo("GESTOR", "gestor.visita.404.teste@zeiss.com");
        String corpo = String.format("""
                {"responsavelId":%d,"visitaInterna":true,"dataSolicitada":"2026-09-01","localVisita":"Sala 3","quantidadeVisitantes":15,"telefones":"(48) 99999-0000","visitaRealizada":false}
                """, responsavelId);
        mockMvc.perform(put(ENDPOINT + "/999999").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isNotFound());
    }
}
