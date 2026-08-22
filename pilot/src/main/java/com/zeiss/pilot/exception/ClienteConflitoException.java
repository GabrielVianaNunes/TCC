package com.zeiss.pilot.exception;

/** Erro de negócio que deve virar 409 Conflict, nunca 500 — ver GlobalExceptionHandler. */
public class ClienteConflitoException extends RuntimeException {
    public ClienteConflitoException(String mensagem) {
        super(mensagem);
    }
}
