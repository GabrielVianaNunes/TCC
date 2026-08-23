package com.zeiss.pilot.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class NomeValidatorTest {

    private final NomeValidator validator = new NomeValidator();

    @Test
    void aceitaNomeDePessoaSimples() {
        assertTrue(validator.isValid("João da Silva", null));
    }

    @Test
    void aceitaNomeComAcentoHifenEApostrofo() {
        assertTrue(validator.isValid("José D'Ávila Souza-Lima", null));
    }

    @Test
    void aceitaRazaoSocialComPontoEE_comercial() {
        assertTrue(validator.isValid("Silva & Filhos Comércio e Indústria Ltda.", null));
    }

    @Test
    void rejeitaDigito() {
        assertFalse(validator.isValid("99 Tecnologia", null));
    }

    @Test
    void rejeitaSimboloForaDaListaPermitida() {
        assertFalse(validator.isValid("João#Silva", null));
        assertFalse(validator.isValid("Empresa@Teste", null));
    }

    @Test
    void aceitaNuloEVazioPorqueObrigatoriedadeENaoAquiEQueEValidada() {
        assertTrue(validator.isValid(null, null));
        assertTrue(validator.isValid("", null));
        assertTrue(validator.isValid("   ", null));
    }
}
