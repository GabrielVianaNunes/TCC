package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.zeiss.pilot.entity.AgendamentoMaquina;
import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.entity.ManutencaoMaquina;
import com.zeiss.pilot.entity.SessaoMaquina;
import com.zeiss.pilot.repository.AgendamentoMaquinaRepository;
import com.zeiss.pilot.repository.ManutencaoMaquinaRepository;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.SessaoMaquinaRepository;

/**
 * Cobertura HTTP (via controller real) de POST/PATCH /api/maquinas/{id}/{sessoes,manutencoes,agendamentos} —
 * confirma que @Valid dispara em SessaoMaquinaDTO (usuario, dataLigada),
 * ManutencaoMaquinaDTO (tipo, responsavel, data, status quando preenchido) e
 * AgendamentoMaquinaDTO (usuario, dataInicio, dataFim) na Fase 3c.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MaquinaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MaquinaRepository maquinaRepository;

    @Autowired
    private SessaoMaquinaRepository sessaoMaquinaRepository;

    @Autowired
    private ManutencaoMaquinaRepository manutencaoMaquinaRepository;

    @Autowired
    private AgendamentoMaquinaRepository agendamentoMaquinaRepository;

    private Long maquinaId;
    private Long sessaoId;
    private Long manutencaoId;
    private Long agendamentoId;

    private String sessoesEndpoint() {
        return "/api/maquinas/" + maquinaId + "/sessoes";
    }

    private String manutencoesEndpoint() {
        return "/api/maquinas/" + maquinaId + "/manutencoes";
    }

    private String agendamentosEndpoint() {
        return "/api/maquinas/" + maquinaId + "/agendamentos";
    }

    @BeforeEach
    void setUp() {
        Maquina maquina = new Maquina();
        maquina.setNome("CMM Zeiss Contura G2");
        maquinaId = maquinaRepository.save(maquina).getId();

        SessaoMaquina sessao = new SessaoMaquina();
        sessao.setMaquina(maquina);
        sessao.setUsuario("João Pereira");
        sessao.setDataLigada(LocalDateTime.of(2026, 8, 20, 9, 0));
        sessaoId = sessaoMaquinaRepository.save(sessao).getId();

        ManutencaoMaquina manutencao = new ManutencaoMaquina();
        manutencao.setMaquina(maquina);
        manutencao.setTipo("Limpeza");
        manutencao.setResponsavel("Carlos Souza");
        manutencao.setData(LocalDate.of(2026, 8, 20));
        manutencaoId = manutencaoMaquinaRepository.save(manutencao).getId();

        AgendamentoMaquina agendamento = new AgendamentoMaquina();
        agendamento.setMaquina(maquina);
        agendamento.setUsuario("Ana Lima");
        agendamento.setDataInicio(LocalDateTime.of(2026, 8, 25, 10, 0));
        agendamento.setDataFim(LocalDateTime.of(2026, 8, 25, 11, 0));
        agendamentoId = agendamentoMaquinaRepository.save(agendamento).getId();
    }

    // ── Sessão/Uso ──

    @Test
    @WithMockUser
    void criarSessaoSemUsuarioRetorna400() throws Exception {
        String corpo = """
                {"dataLigada": "2026-08-23T09:00:00"}
                """;
        mockMvc.perform(post(sessoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSessaoSemDataLigadaRetorna400() throws Exception {
        String corpo = """
                {"usuario": "Maria Souza"}
                """;
        mockMvc.perform(post(sessoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSessaoComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"usuario": "Maria Souza", "dataLigada": "2026-08-23T09:00:00"}
                """;
        mockMvc.perform(post(sessoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void atualizarSessaoSemUsuarioRetorna400() throws Exception {
        String corpo = """
                {"dataLigada": "2026-08-20T09:00:00"}
                """;
        mockMvc.perform(patch(sessoesEndpoint() + "/" + sessaoId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── Manutenção ──

    @Test
    @WithMockUser
    void criarManutencaoSemTipoRetorna400() throws Exception {
        String corpo = """
                {"responsavel": "Carlos Souza", "data": "2026-08-23"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarManutencaoComTipoInvalidoRetorna400() throws Exception {
        String corpo = """
                {"tipo": "Troca de óleo", "responsavel": "Carlos Souza", "data": "2026-08-23"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarManutencaoSemResponsavelRetorna400() throws Exception {
        String corpo = """
                {"tipo": "Limpeza", "data": "2026-08-23"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarManutencaoSemDataRetorna400() throws Exception {
        String corpo = """
                {"tipo": "Limpeza", "responsavel": "Carlos Souza"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarManutencaoComStatusInvalidoRetorna400() throws Exception {
        String corpo = """
                {"tipo": "Limpeza", "responsavel": "Carlos Souza", "data": "2026-08-23", "status": "Cancelada"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarManutencaoSemStatusRetorna200() throws Exception {
        String corpo = """
                {"tipo": "Limpeza", "responsavel": "Carlos Souza", "data": "2026-08-23"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void criarManutencaoComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"tipo": "Revisão Geral", "responsavel": "Carlos Souza", "data": "2026-08-23", "status": "Concluída"}
                """;
        mockMvc.perform(post(manutencoesEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void atualizarManutencaoSemTipoRetorna400() throws Exception {
        String corpo = """
                {"responsavel": "Carlos Souza", "data": "2026-08-20"}
                """;
        mockMvc.perform(patch(manutencoesEndpoint() + "/" + manutencaoId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── Agendamento ──

    @Test
    @WithMockUser
    void criarAgendamentoSemUsuarioRetorna400() throws Exception {
        String corpo = """
                {"dataInicio": "2026-08-25T10:00:00", "dataFim": "2026-08-25T11:00:00"}
                """;
        mockMvc.perform(post(agendamentosEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarAgendamentoSemDataInicioRetorna400() throws Exception {
        String corpo = """
                {"usuario": "Ana Lima", "dataFim": "2026-08-25T11:00:00"}
                """;
        mockMvc.perform(post(agendamentosEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarAgendamentoSemDataFimRetorna400() throws Exception {
        String corpo = """
                {"usuario": "Ana Lima", "dataInicio": "2026-08-25T10:00:00"}
                """;
        mockMvc.perform(post(agendamentosEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarAgendamentoComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"usuario": "Ana Lima", "dataInicio": "2026-08-25T10:00:00", "dataFim": "2026-08-25T11:00:00"}
                """;
        mockMvc.perform(post(agendamentosEndpoint()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void atualizarAgendamentoSemUsuarioRetorna400() throws Exception {
        String corpo = """
                {"dataInicio": "2026-08-25T10:00:00", "dataFim": "2026-08-25T11:00:00"}
                """;
        mockMvc.perform(patch(agendamentosEndpoint() + "/" + agendamentoId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }
}
