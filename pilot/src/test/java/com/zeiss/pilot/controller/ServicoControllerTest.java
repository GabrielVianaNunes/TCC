package com.zeiss.pilot.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

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

import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.entity.TipoServico;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.TipoServicoRepository;

/**
 * Cobertura HTTP (via controller real) de POST /api/servicos — confirma que
 * @Valid dispara em ServicoDTO na Fase 2 (tecnicoResponsavel, valor,
 * quantidade, status, dataPrevista).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ServicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private MaquinaRepository maquinaRepository;

    @Autowired
    private TipoServicoRepository tipoServicoRepository;

    private Long clienteId;
    private Long maquinaId;
    private Long tipoServicoId;

    @BeforeEach
    void setUp() {
        Cliente cliente = new Cliente();
        cliente.setNome("Cliente Servico Controller");
        cliente.setCpfOuCnpj("123.456.789-09");
        cliente.setEndereco("Rua Teste, 10");
        cliente.setTelefone("(11) 90000-0000");
        cliente.setCpfOuCnpjHash("hash-servico-controller-test");
        cliente.setDataCadastro(LocalDate.now());
        clienteId = clienteRepository.save(cliente).getId();

        Maquina maquina = new Maquina();
        maquina.setNome("Máquina Teste Controller");
        maquinaId = maquinaRepository.save(maquina).getId();

        TipoServico tipoServico = new TipoServico();
        tipoServico.setCategoria("Dimensional");
        tipoServico.setDescricao("Calibração de teste");
        tipoServicoId = tipoServicoRepository.save(tipoServico).getId();
    }

    private String payloadValido() {
        return """
                {
                  "clienteId": %d,
                  "maquinaId": %d,
                  "tipoServicoId": %d,
                  "quantidade": 1,
                  "status": "1º Contato",
                  "tecnicoResponsavel": "Carlos Andrade",
                  "valor": 1500.00,
                  "dataPrevista": "%s"
                }
                """.formatted(clienteId, maquinaId, tipoServicoId, LocalDate.now().plusDays(7));
    }

    @Test
    @WithMockUser
    void criarServicoComPayloadCompletoEValidoRetorna200() throws Exception {
        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadValido()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void criarServicoSemValorRetorna400() throws Exception {
        String corpo = """
                {
                  "clienteId": %d,
                  "maquinaId": %d,
                  "tipoServicoId": %d,
                  "quantidade": 1,
                  "status": "1º Contato",
                  "tecnicoResponsavel": "Carlos Andrade",
                  "dataPrevista": "%s"
                }
                """.formatted(clienteId, maquinaId, tipoServicoId, LocalDate.now().plusDays(7));
        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarServicoComValorZeroRetorna400() throws Exception {
        String corpo = """
                {
                  "clienteId": %d,
                  "maquinaId": %d,
                  "tipoServicoId": %d,
                  "quantidade": 1,
                  "status": "1º Contato",
                  "tecnicoResponsavel": "Carlos Andrade",
                  "valor": 0,
                  "dataPrevista": "%s"
                }
                """.formatted(clienteId, maquinaId, tipoServicoId, LocalDate.now().plusDays(7));
        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarServicoComQuantidadeAcimaDoLimiteRetorna400() throws Exception {
        String corpo = """
                {
                  "clienteId": %d,
                  "maquinaId": %d,
                  "tipoServicoId": %d,
                  "quantidade": 100001,
                  "status": "1º Contato",
                  "tecnicoResponsavel": "Carlos Andrade",
                  "valor": 1500.00,
                  "dataPrevista": "%s"
                }
                """.formatted(clienteId, maquinaId, tipoServicoId, LocalDate.now().plusDays(7));
        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarServicoComTecnicoResponsavelContendoNumeroRetorna400() throws Exception {
        String corpo = """
                {
                  "clienteId": %d,
                  "maquinaId": %d,
                  "tipoServicoId": %d,
                  "quantidade": 1,
                  "status": "1º Contato",
                  "tecnicoResponsavel": "Tecnico99",
                  "valor": 1500.00,
                  "dataPrevista": "%s"
                }
                """.formatted(clienteId, maquinaId, tipoServicoId, LocalDate.now().plusDays(7));
        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void criarServicoSemDataPrevistaRetorna400() throws Exception {
        String corpo = """
                {
                  "clienteId": %d,
                  "maquinaId": %d,
                  "tipoServicoId": %d,
                  "quantidade": 1,
                  "status": "1º Contato",
                  "tecnicoResponsavel": "Carlos Andrade",
                  "valor": 1500.00
                }
                """.formatted(clienteId, maquinaId, tipoServicoId);
        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }
}
