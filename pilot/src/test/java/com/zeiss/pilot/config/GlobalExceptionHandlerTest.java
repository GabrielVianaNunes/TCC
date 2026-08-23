package com.zeiss.pilot.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesRegex;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.entity.TipoServico;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.TipoServicoRepository;
import com.zeiss.pilot.service.ClienteService;

import java.util.Map;

/**
 * Garante que a resposta de erro da API nunca devolve detalhe interno ao
 * cliente. Exigência do FO-358 da GETIN ("as páginas de erro devem ser
 * personalizadas e genéricas, com a finalidade de impossibilitar que os
 * atacantes obtenham informações sensíveis") e do OWASP A05.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private MaquinaRepository maquinaRepository;

    @Autowired
    private TipoServicoRepository tipoServicoRepository;

    /**
     * Uma violação de restrição do banco chega ao handler como
     * DataIntegrityViolationException, que é uma RuntimeException. Este caso é uma
     * violação de CHECK constraint (status fora do domínio permitido) — não tem
     * nada a ver com duplicata de CPF/CNPJ, então o handler dedicado (restrito a
     * idx_clientes_cpf_hash) não entra em ação, e a exceção cai no tratamento
     * genérico: 500 Internal Server Error com mensagem genérica, sem expor nome
     * de tabela, restrição, colunas ou SQL. A mensagem do driver vai para o log
     * do servidor apenas.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void erroDeBancoNaoVazaEstruturaInternaParaOCliente() throws Exception {
        ClienteDTO clienteDto = new ClienteDTO();
        clienteDto.setNome("Cliente Teste Handler");
        clienteDto.setCpfOuCnpj("321.321.321-21");
        Long clienteId = clienteService.criar(clienteDto).getId();

        Maquina maquina = new Maquina();
        maquina.setNome("Maquina Teste Handler");
        maquina.setTipoMedida("Medição por Coordenadas (CMM)");
        Long maquinaId = maquinaRepository.save(maquina).getId();

        TipoServico tipoServico = new TipoServico();
        tipoServico.setCategoria("Medição por Coordenadas (CMM)");
        tipoServico.setDescricao("Servico de teste handler");
        Long tipoServicoId = tipoServicoRepository.save(tipoServico).getId();

        // 'status' fora do CHECK servicos_status_check -> violação no INSERT
        String corpo = """
                {"cliente":"Cliente Teste Handler","clienteId":%d,"maquinaId":%d,"tipoServicoId":%d,"solicitacao":"Teste",
                 "quantidade":1,"status":"STATUS_QUE_NAO_EXISTE",
                 "valor":100.00,"dataCriacao":"2026-08-18"}
                """.formatted(clienteId, maquinaId, tipoServicoId);

        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value(not(allOf(
                        containsString("servicos"),          // nome da tabela
                        containsString("insert into"),       // o SQL
                        containsString("codigo_os")))))      // nome de coluna
                // e deve trazer um identificador para correlacionar com o log
                .andExpect(jsonPath("$.referencia").value(matchesRegex("[0-9a-f]{8}")));
    }

    /**
     * A mensagem de "não encontrado" é lançada pelos nossos próprios services,
     * com texto controlado, e o frontend depende do 404. Esse comportamento
     * precisa sobreviver à correção.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void recursoInexistenteContinuaRetornando404() throws Exception {
        mockMvc.perform(get("/api/servicos/99999999"))
                .andExpect(status().isNotFound());
    }

    /**
     * ServicoService lança IllegalArgumentException quando clienteId não é
     * informado (mensagem escrita por nós, sem detalhe de infraestrutura). O
     * handler dedicado deve devolver 400 Bad Request — é erro do chamador,
     * não uma falha do servidor.
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    void clienteIdAusenteRetorna400() throws Exception {
        String corpo = """
                {"cliente":"Cliente Sem ClienteId","solicitacao":"Teste",
                 "quantidade":1,"status":"1º Contato",
                 "valor":100.00,"dataCriacao":"2026-08-18"}
                """;

        mockMvc.perform(post("/api/servicos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("clienteId é obrigatório para criar uma Ordem de Serviço."));
    }

    /**
     * Violações da UNIQUE index de CPF/CNPJ (idx_clientes_cpf_hash, criada em
     * V7__cria_clientes.sql) chegam como DataIntegrityViolationException. Quando
     * dois clientes concorrentes passam pela verificação de aplicação e ambos
     * tentam salvar, o perdedor bate na restrição do banco. O handler deve
     * retornar 409 Conflict com uma mensagem genérica — nunca expondo nome de
     * tabela, nome de restrição ou SQL. Este é o ÚNICO caso que o handler trata
     * como duplicata — a causa raiz precisa nomear especificamente essa index.
     */
    @Test
    void violacaoDeIntegridadeRetorna409ComMensagemGenerica() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        // Simula uma violação da UNIQUE index de CPF/CNPJ no banco
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement; SQL [insert into clientes (cpf_ou_cnpj_hash, ...) values (?, ...)]; " +
                "constraint [idx_clientes_cpf_hash] violated: unique constraint or index violation",
                new RuntimeException(
                        "duplicate key value violates unique constraint \"idx_clientes_cpf_hash\""));

        ResponseEntity<Map<String, String>> response = handler.handleDataIntegrityViolation(ex);

        // Assert: status 409 Conflict
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());

        // Assert: mensagem genérica, sem expor detalhe interno
        String msg = response.getBody().get("message");
        assertEquals("Conflito ao salvar: um registro com os mesmos dados já existe.", msg);

        // Assert: tem referência para correlacionar no log
        String ref = response.getBody().get("referencia");
        assertTrue(ref != null && ref.length() == 8, "Referência deve ter 8 caracteres");

        // Assert: NÃO expõe estrutura interna do banco
        assertFalse(msg.contains("clientes"), "Mensagem não deve mencionar nome de tabela");
        assertFalse(msg.contains("constraint"), "Mensagem não deve mencionar restrição");
        assertFalse(msg.contains("SQL"), "Mensagem não deve mencionar SQL");
    }

    /**
     * DocumentoMaquinaService.buscarDocumento lança IllegalArgumentException com
     * mensagem "Documento não encontrado: <id>" quando o id não existe. Antes da
     * correção, esse ponto de chamada regredia de 404 para 400 porque
     * IllegalArgumentException é mais específica que RuntimeException e passou a
     * ser roteada para o novo handler, que devolvia 400 incondicionalmente. O
     * carve-out de "não encontrado" precisa se comportar igual ao de
     * handleRuntime.
     *
     * <p>Nota: DocumentoMaquinaService.buscarMaquina usa a mensagem "Máquina não
     * encontrada" (forma feminina) — que não contém a substring "não
     * encontrado" (masculina) e por isso não é coberta por este carve-out, nem
     * era coberta pelo handleRuntime original antes desta correção existir. É
     * uma divergência de gênero gramatical pré-existente no próprio
     * handleRuntime, fora do escopo deste fix, que espelha o padrão exatamente
     * como está.
     */
    @Test
    void illegalArgumentComNaoEncontradoRetorna404() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        IllegalArgumentException ex = new IllegalArgumentException("Documento não encontrado: 456");

        ResponseEntity<Map<String, String>> response = handler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Documento não encontrado: 456", response.getBody().get("message"));
    }

    /**
     * Mensagens de IllegalArgumentException que não são "não encontrado" (ex.:
     * validação de entrada do ServicoService) continuam devolvendo 400, como
     * pretendido pela correção original.
     */
    @Test
    void illegalArgumentSemNaoEncontradoRetorna400() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        IllegalArgumentException ex = new IllegalArgumentException(
                "clienteId é obrigatório para criar uma Ordem de Serviço.");

        ResponseEntity<Map<String, String>> response = handler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("clienteId é obrigatório para criar uma Ordem de Serviço.", response.getBody().get("message"));
    }

    /**
     * MethodArgumentNotValidException carrega um BindingResult com um
     * FieldError por campo que falhou — o handler precisa juntar todos numa
     * mensagem só, com o nome do campo e a mensagem da própria anotação
     * (não uma mensagem genérica de "dado inválido").
     */
    @Test
    void erroDeValidacaoBeanRetorna400ComMensagensDosCamposQueFalharam() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "objeto");
        bindingResult.addError(new FieldError("objeto", "nome", "deve conter apenas letras, espaço, hífen, apóstrofo, ponto ou &"));
        bindingResult.addError(new FieldError("objeto", "telefone", "telefone inválido"));

        MethodArgumentNotValidException ex = Mockito.mock(MethodArgumentNotValidException.class);
        Mockito.when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationErrors(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        String msg = response.getBody().get("message");
        assertTrue(msg.contains("nome"));
        assertTrue(msg.contains("deve conter apenas letras"));
        assertTrue(msg.contains("telefone"));
        assertTrue(msg.contains("telefone inválido"));
    }

    /**
     * "typeMismatch" (produzido pelo Spring quando o binding de tipo falha)
     * carrega o valor recebido e o tipo esperado na própria mensagem padrão —
     * o mesmo detalhe de infraestrutura que handleTypeMismatch já evita.
     */
    @Test
    void erroDeValidacaoComTypeMismatchNaoVazaValorNemTipo() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "objeto");
        FieldError erroDeTipo = new FieldError("objeto", "dataPrevista", "abc-invalido", false,
                new String[]{"typeMismatch"}, null,
                "Failed to convert property value of type 'java.lang.String' to required type 'java.time.LocalDate' for property 'dataPrevista'");
        bindingResult.addError(erroDeTipo);

        MethodArgumentNotValidException ex = Mockito.mock(MethodArgumentNotValidException.class);
        Mockito.when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationErrors(ex);

        String msg = response.getBody().get("message");
        assertFalse(msg.contains("abc-invalido"), "não deveria vazar o valor recebido");
        assertFalse(msg.contains("LocalDate"), "não deveria vazar o tipo esperado");
        assertFalse(msg.contains("java.lang"), "não deveria vazar o tipo Java");
    }
}
