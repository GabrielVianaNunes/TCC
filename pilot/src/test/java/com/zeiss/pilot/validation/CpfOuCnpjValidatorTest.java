package com.zeiss.pilot.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class CpfOuCnpjValidatorTest {

    private final CpfOuCnpjValidator validator = new CpfOuCnpjValidator();

    @Test
    void aceitaCpfValidoComMascara() {
        assertTrue(validator.isValid("123.456.789-09", null));
    }

    @Test
    void aceitaCnpjValidoComMascara() {
        assertTrue(validator.isValid("11.222.333/0001-81", null));
    }

    @Test
    void rejeitaLetra() {
        assertFalse(validator.isValid("123.456.78A-09", null));
    }

    @Test
    void rejeitaSimboloForaDaMascara() {
        assertFalse(validator.isValid("123 456 789 09", null));
    }

    @Test
    void rejeitaDigitoVerificadorErrado() {
        assertFalse(validator.isValid("123.456.789-00", null));
    }

    @Test
    void aceitaNuloEVazio() {
        assertTrue(validator.isValid(null, null));
        assertTrue(validator.isValid("  ", null));
    }
}
