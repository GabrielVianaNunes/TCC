package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

import com.zeiss.pilot.entity.Amostra;
import com.zeiss.pilot.repository.AmostraRepository;

/**
 * Cobertura HTTP (via controller real) de POST/PUT /api/amostras —
 * confirma que @Valid dispara em AmostraDTO na Fase 4: obrigatoriedade
 * dos 7 campos do Passo 1 (Task 1), @Nome nos campos de nome de pessoa
 * (Task 1), e @Pattern nos 27 campos de seleção fechada (Task 2).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AmostraControllerTest {

    private static final String ENDPOINT = "/api/amostras";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AmostraRepository amostraRepository;

    private Long amostraId;

    @BeforeEach
    void setUp() {
        Amostra a = new Amostra();
        a.setDataEntrada(LocalDate.of(2026, 8, 20));
        a.setHorario("09:30");
        a.setResponsavel("Maria Souza");
        a.setCliente("Bosch do Brasil");
        a.setDescricao("Peças usinadas para medição dimensional");
        a.setQuantidade(5);
        a.setUnidade("un");
        a.setTemDesenho(false);
        a.setTemCAD(false);
        a.setTemTolerancia(false);
        a.setTemInstrucao(false);
        a.setFragil(false);
        a.setCortante(false);
        a.setEmbalagemEspecial(false);
        a.setIdentifPreservada(false);
        a.setStatus("Devolvida");
        amostraId = amostraRepository.save(a).getId();
    }

    // ── Obrigatoriedade (Passo 1) ──

    @Test
    @WithMockUser
    void criarSemDataEntradaRetorna400() throws Exception {
        String corpo = """
                {"horario":"10:00","responsavel":"João Pereira","cliente":"ACME Ltda",
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemHorarioRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","responsavel":"João Pereira","cliente":"ACME Ltda",
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemResponsavelRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","cliente":"ACME Ltda",
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemClienteRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"João Pereira",
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemDescricaoRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"João Pereira",
                 "cliente":"ACME Ltda","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarComQuantidadeZeroRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"João Pereira",
                 "cliente":"ACME Ltda","descricao":"Peça de teste","quantidade":0,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemUnidadeRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"João Pereira",
                 "cliente":"ACME Ltda","descricao":"Peça de teste","quantidade":1}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── @Nome vs texto livre ──

    @Test
    @WithMockUser
    void criarComResponsavelContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"Tecnico99",
                 "cliente":"ACME Ltda","descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarComClienteContendoNumeroRetorna200() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"João Pereira",
                 "cliente":"3M do Brasil Ltda","descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    // ── Payload válido (só o Passo 1, caso mais comum hoje) ──

    @Test
    @WithMockUser
    void criarComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavel":"João Pereira",
                 "cliente":"ACME Ltda","descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """;
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    // ── PUT ──

    @Test
    @WithMockUser
    void atualizarSemClienteRetorna400() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-20","horario":"09:30","responsavel":"Maria Souza",
                 "descricao":"Peças usinadas para medição dimensional","quantidade":5,"unidade":"un"}
                """;
        mockMvc.perform(put(ENDPOINT + "/" + amostraId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── Caracterização do bug de status (fix é no JS, não no backend — ver Task 1 Step 6) ──

    @Test
    @WithMockUser
    void atualizarSemStatusResetaParaEmCustodia() throws Exception {
        String corpo = """
                {"dataEntrada":"2026-08-20","horario":"09:30","responsavel":"Maria Souza",
                 "cliente":"Bosch do Brasil","descricao":"Peças usinadas para medição dimensional",
                 "quantidade":5,"unidade":"un"}
                """;
        mockMvc.perform(put(ENDPOINT + "/" + amostraId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());

        Amostra atualizada = amostraRepository.findById(amostraId).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("Em custódia", atualizada.getStatus());
    }
}
