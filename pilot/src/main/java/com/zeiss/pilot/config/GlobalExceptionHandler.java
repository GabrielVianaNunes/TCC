package com.zeiss.pilot.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;

import com.zeiss.pilot.exception.ClienteConflitoException;

import java.util.Map;
import java.util.UUID;

/**
 * Tratamento central de erro da API.
 *
 * <p>Regra que vale para todos os handlers: <b>detalhe interno nunca vai para o
 * cliente</b>. Mensagem de exceção de infraestrutura (driver do banco, ORM,
 * biblioteca) carrega nome de tabela, nome de restrição, lista de colunas e até
 * o SQL — informação que ajuda um atacante a mapear o sistema. O detalhe vai
 * para o log do servidor, e o cliente recebe uma mensagem genérica mais uma
 * referência curta que permite localizar aquele erro específico no log.
 *
 * <p>Exigência do FO-358 da GETIN (páginas de erro genéricas) e do OWASP A05.
 *
 * <p>O escopo é restrito às classes anotadas com {@code @RestController} — ou
 * seja, só à API. Sem essa restrição, o advice também capturava a navegação de
 * página: abrir uma URL inexistente devolvia JSON com status 500 em vez de a
 * página de erro 404. Com o escopo correto, requisição de página cai no
 * tratamento padrão do Spring, que renderiza {@code templates/error/404.html} e
 * {@code templates/error/500.html}.
 */
@RestControllerAdvice(annotations = RestController.class)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String MSG_GENERICA = "Erro interno do servidor.";

    /** Referência curta para casar a resposta do cliente com a linha do log. */
    private String registrarNoLog(String contexto, Exception ex) {
        String referencia = UUID.randomUUID().toString().substring(0, 8);
        log.error("[{}] {}", referencia, contexto, ex);
        return referencia;
    }

    private ResponseEntity<Map<String, String>> erroInterno(String contexto, Exception ex) {
        String referencia = registrarNoLog(contexto, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", MSG_GENERICA, "referencia", referencia));
    }

    /**
     * "não encontrado" é lançado pelos nossos próprios services, com texto que
     * escrevemos e que não expõe nada — por isso continua sendo devolvido, e o
     * frontend segue recebendo 404. Qualquer outra RuntimeException é tratada
     * como erro interno e tem a mensagem suprimida.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("não encontrado")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", msg));
        }
        return erroInterno("Erro inesperado ao processar a requisição", ex);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        // Mensagem de negação de acesso é definida por nós, não pela infraestrutura.
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Acesso negado."));
    }

    @ExceptionHandler(ClienteConflitoException.class)
    public ResponseEntity<Map<String, String>> handleClienteConflito(ClienteConflitoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    /**
     * Só a UNIQUE index de CPF/CNPJ ({@code idx_clientes_cpf_hash}, criada em
     * V7__cria_clientes.sql) vira 409 "duplicata" — é o único caso em que essa
     * mensagem faz sentido (dois clientes concorrentes passam pela checagem de
     * aplicação e o perdedor bate na restrição do banco). Qualquer outra
     * DataIntegrityViolationException (NOT NULL, FK, CHECK — ex.: um valor de
     * status fora do domínio em /api/servicos) é erro de dado inválido ou bug,
     * não duplicata, e cai no tratamento genérico (500), igual ao
     * comportamento antes deste handler existir.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String causaRaiz = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : null;
        if (causaRaiz != null && causaRaiz.contains("idx_clientes_cpf_hash")) {
            String referencia = registrarNoLog("Violação de integridade — duplicata de CPF/CNPJ", ex);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Conflito ao salvar: um registro com os mesmos dados já existe.",
                                 "referencia", referencia));
        }
        return erroInterno("Violação de integridade de dados", ex);
    }

    /**
     * Mensagem de validação de entrada é definida por nós, não pela
     * infraestrutura. Mas alguns services (ex.: DocumentoMaquinaService) usam
     * IllegalArgumentException também para "não encontrado" — mesmo carve-out
     * de handleRuntime precisa valer aqui, senão esses endpoints regridem de
     * 404 para 400 e o frontend, que depende do 404, quebra.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("não encontrado")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", msg));
        }
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        // Devolve só o NOME do parâmetro, nunca o valor recebido nem o tipo esperado.
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Parâmetro inválido: " + ex.getName()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Corpo da requisição inválido ou malformado."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return erroInterno("Erro não tratado", ex);
    }
}
