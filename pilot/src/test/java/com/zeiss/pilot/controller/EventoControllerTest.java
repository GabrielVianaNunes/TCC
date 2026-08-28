package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.entity.Evento;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.EventoRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

/**
 * Cobertura HTTP (via controller real) de POST/PUT /api/eventos — antes
 * desta feature, EventoDTO não tinha nenhuma anotação de validação e o
 * controller não usava @Valid; confirma agora que horário é obrigatório
 * e que responsavelId ausente ou de cargo não permitido (só Gestor) é
 * rejeitado.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EventoControllerTest {

    private static final String ENDPOINT = "/api/eventos";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Long usuarioComCargo(String cargo, String email) {
        Usuario u = new Usuario();
        u.setNome("Usuario Teste Evento");
        u.setEmail(email);
        u.setSenha("senha123");
        u.setCargo(cargo);
        u.setRole(cargo);
        return usuarioRepository.save(u).getId();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void criarEventoSemHorarioRetorna400() throws Exception {
        Long gestorId = usuarioComCargo("GESTOR", "gestor.evento.teste1@zeiss.com");
        String corpo = String.format("""
                {"titulo":"Feira de Metrologia","data":"2026-09-10","local":"Auditório","responsavelId":%d,"numeroParticipantes":30}
                """, gestorId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void criarEventoSemResponsavelIdRetorna400() throws Exception {
        String corpo = """
                {"titulo":"Feira de Metrologia","data":"2026-09-10","horario":"14:00","local":"Auditório","numeroParticipantes":30}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void criarEventoComResponsavelDeCargoNaoPermitidoRetorna400() throws Exception {
        Long tecnicoId = usuarioComCargo("TECNICO", "tecnico.evento.teste@zeiss.com");
        String corpo = String.format("""
                {"titulo":"Feira de Metrologia","data":"2026-09-10","horario":"14:00","local":"Auditório","responsavelId":%d,"numeroParticipantes":30}
                """, tecnicoId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void criarEventoComPayloadValidoRetorna200() throws Exception {
        Long gestorId = usuarioComCargo("GESTOR", "gestor.evento.teste2@zeiss.com");
        String corpo = String.format("""
                {"titulo":"Feira de Metrologia","data":"2026-09-10","horario":"14:00","local":"Auditório","responsavelId":%d,"numeroParticipantes":30}
                """, gestorId);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void atualizarEventoSemHorarioRetorna400() throws Exception {
        Evento existente = new Evento();
        existente.setNome("Evento Existente");
        existente.setTipo("Geral");
        existente.setDataEvento(java.time.LocalDate.now());
        existente.setNumeroConvidados(10);
        existente.setNumeroPresentes(0);
        existente.setHorario("09:00");
        Long id = eventoRepository.save(existente).getId();

        Long gestorId = usuarioComCargo("GESTOR", "gestor.evento.teste3@zeiss.com");
        String corpo = String.format("""
                {"titulo":"Evento Existente","data":"2026-09-10","local":"Auditório","responsavelId":%d,"numeroParticipantes":30}
                """, gestorId);
        mockMvc.perform(put(ENDPOINT + "/" + id).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void atualizarEventoInexistenteRetorna404() throws Exception {
        // Cobertura que faltava (Fix 3 da revisão final): garante que o
        // carve-out de "não encontrad*" em GlobalExceptionHandler continua
        // roteando para 404 mesmo com a mensagem já usando a forma
        // masculina "Evento não encontrado" — esse gap de teste (PUT-404
        // ausente) foi o que deixou passar o bug equivalente em
        // VisitaTecnicaService (mensagem feminina "não encontrada").
        Long gestorId = usuarioComCargo("GESTOR", "gestor.evento.404.teste@zeiss.com");
        String corpo = String.format("""
                {"titulo":"Evento Inexistente","data":"2026-09-10","horario":"14:00","local":"Auditório","responsavelId":%d,"numeroParticipantes":30}
                """, gestorId);
        mockMvc.perform(put(ENDPOINT + "/999999").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isNotFound());
    }
}
