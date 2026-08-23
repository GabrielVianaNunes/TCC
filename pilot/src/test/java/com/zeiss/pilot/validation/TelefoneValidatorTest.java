package com.zeiss.pilot.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class TelefoneValidatorTest {

    private final TelefoneValidator validator = new TelefoneValidator();

    @Test
    void aceitaCelularComMascaraCompleta() {
        assertTrue(validator.isValid("(11) 98765-4321", null));
    }

    @Test
    void aceitaFixoComMascaraCompleta() {
        assertTrue(validator.isValid("(11) 3456-7890", null));
    }

    @Test
    void aceitaSomenteDigitos() {
        assertTrue(validator.isValid("11987654321", null));
        assertTrue(validator.isValid("1134567890", null));
    }

    @Test
    void rejeitaQuantidadeDeDigitosErrada() {
        assertFalse(validator.isValid("123", null));
        assertFalse(validator.isValid("119876543210", null));
    }

    @Test
    void rejeitaLetra() {
        assertFalse(validator.isValid("(11) 9ABCD-4321", null));
    }

    @Test
    void aceitaNuloEVazio() {
        assertTrue(validator.isValid(null, null));
        assertTrue(validator.isValid("", null));
    }
}
