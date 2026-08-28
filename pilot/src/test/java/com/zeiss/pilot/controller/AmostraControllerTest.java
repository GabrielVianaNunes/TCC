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

import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.entity.Amostra;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.AmostraRepository;
import com.zeiss.pilot.repository.UsuarioRepository;
import com.zeiss.pilot.service.ClienteService;

/**
 * Cobertura HTTP (via controller real) de POST/PUT /api/amostras —
 * confirma que @Valid dispara em AmostraDTO: obrigatoriedade dos campos
 * do Passo 1, @Pattern nos 27 campos de seleção fechada, e que o service
 * rejeita responsavelId/clienteId ausentes ou de cargo não permitido
 * (Gestor, Técnico ou Estagiário) mesmo sem anotação @NotNull no DTO.
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

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteService clienteService;

    private Long amostraId;
    private Long responsavelIdValido;
    private Long clienteIdValido;

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

        Usuario u = new Usuario();
        u.setNome("Gestor Amostra Teste");
        u.setEmail("gestor.amostra.teste@zeiss.com");
        u.setSenha("senha123");
        u.setCargo("GESTOR");
        u.setRole("GESTOR");
        responsavelIdValido = usuarioRepository.save(u).getId();

        ClienteDTO clienteDto = new ClienteDTO();
        clienteDto.setNome("Cliente Amostra Teste");
        clienteDto.setCpfOuCnpj("111.222.333-44");
        clienteIdValido = clienteService.criar(clienteDto).getId();
    }

    // ── Obrigatoriedade (Passo 1) ──

    @Test
    @WithMockUser
    void criarSemDataEntradaRetorna400() throws Exception {
        String corpo = String.format("""
                {"horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemHorarioRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemResponsavelIdRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemClienteIdRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """, responsavelIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemDescricaoRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "quantidade":1,"unidade":"un"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarComQuantidadeZeroRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":0,"unidade":"un"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarSemUnidadeRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── responsavelId com cargo não permitido ──

    @Test
    @WithMockUser
    void criarComResponsavelDeCargoNaoPermitidoRetorna400() throws Exception {
        Usuario admin = new Usuario();
        admin.setNome("Admin Amostra Teste");
        admin.setEmail("admin.amostra.teste@zeiss.com");
        admin.setSenha("senha123");
        admin.setCargo("DIRETOR_CEM");
        admin.setRole("ADMIN");
        Long adminId = usuarioRepository.save(admin).getId();

        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """, adminId, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── Payload válido (só o Passo 1, caso mais comum hoje) ──

    @Test
    @WithMockUser
    void criarComPayloadCompletoEValidoRetorna200() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    // ── PUT ──

    @Test
    @WithMockUser
    void atualizarSemClienteIdRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-20","horario":"09:30","responsavelId":%d,
                 "descricao":"Peças usinadas para medição dimensional","quantidade":5,"unidade":"un"}
                """, responsavelIdValido);
        mockMvc.perform(put(ENDPOINT + "/" + amostraId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    // ── Caracterização do bug de status (fix é no JS, não no backend) ──

    @Test
    @WithMockUser
    void atualizarSemStatusResetaParaEmCustodia() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-20","horario":"09:30","responsavelId":%d,
                 "clienteId":%d,"descricao":"Peças usinadas para medição dimensional",
                 "quantidade":5,"unidade":"un"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(put(ENDPOINT + "/" + amostraId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());

        Amostra atualizada = amostraRepository.findById(amostraId).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("Em custódia", atualizada.getStatus());
    }

    // ── @Pattern em seleção fechada (Task 2) ──

    @Test
    @WithMockUser
    void criarComFormaRecebimentoInvalidaRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un",
                 "formaRecebimento":"Drone"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarComCondicaoContendoValorInvalidoRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un",
                 "condicao":{"pecaConforme":"TALVEZ"}}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarComFotoContendoValorInvalidoRetorna400() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un",
                 "fotos":{"embalagem":"TALVEZ"}}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarComCondicaoVaziaRetorna200() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un",
                 "condicao":{"pecaConforme":"","quantidadeCorreta":"SIM"},
                 "fotos":{"embalagem":""}}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void criarComTodasSecoesPreenchidasRetorna200() throws Exception {
        String corpo = String.format("""
                {"dataEntrada":"2026-08-24","horario":"10:00","responsavelId":%d,"clienteId":%d,
                 "descricao":"Peça de teste","quantidade":1,"unidade":"un",
                 "formaRecebimento":"Correios",
                 "condicao":{"pecaConforme":"SIM","quantidadeCorreta":"SIM","embalagemIntegra":"SIM",
                             "semDanoTransporte":"SIM","pecaLimpa":"SIM","semContaminacao":"SIM",
                             "identificacao":"SIM","documentos":"N/A","permiteExecucao":"SIM"},
                 "fotos":{"embalagem":"SIM","pecaAntes":"SIM","etiqueta":"NÃO","danos":"NÃO"},
                 "condicaoAmbiental":"Sim","houveDivergencia":"Não","tipoDivergencia":"Outro",
                 "impactoTecnico":"Não","decisaoTecnica":"Aceito normalmente","abrirNC":"Não",
                 "clienteComunicado":"Sim","formaComunicacao":"E-mail","autorizouRessalva":"N/A",
                 "classificacao":"Aceito","seraDevolvida":"Sim","seraRetida":"Não",
                 "formaDevolucao":"Correios"}
                """, responsavelIdValido, clienteIdValido);
        mockMvc.perform(post(ENDPOINT).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk());
    }
}
