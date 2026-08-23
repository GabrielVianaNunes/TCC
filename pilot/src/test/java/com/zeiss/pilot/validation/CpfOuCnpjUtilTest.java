package com.zeiss.pilot.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class CpfOuCnpjUtilTest {

    @Test
    void aceitaCpfValidoComMascara() {
        assertTrue(CpfOuCnpjUtil.valido("123.456.789-09"));
    }

    @Test
    void aceitaCpfValidoSemMascara() {
        assertTrue(CpfOuCnpjUtil.valido("12345678909"));
    }

    @Test
    void aceitaCnpjValidoComMascara() {
        assertTrue(CpfOuCnpjUtil.valido("11.222.333/0001-81"));
    }

    @Test
    void aceitaCnpjValidoSemMascara() {
        assertTrue(CpfOuCnpjUtil.valido("11222333000181"));
    }

    @Test
    void rejeitaCpfComDigitoVerificadorErrado() {
        assertFalse(CpfOuCnpjUtil.valido("123.456.789-00"));
    }

    @Test
    void rejeitaCnpjComDigitoVerificadorErrado() {
        assertFalse(CpfOuCnpjUtil.valido("11.222.333/0001-00"));
    }

    /**
     * 111.111.111-11 passa no cálculo mod-11 puro (o dígito verificador
     * "bate" matematicamente) — é um CPF conhecido como inválido só por causa
     * da regra extra de rejeitar sequência de dígitos repetidos. Sem essa
     * regra, este teste falharia mesmo com o mod-11 implementado certinho.
     */
    @Test
    void rejeitaCpfComTodosOsDigitosIguais() {
        assertFalse(CpfOuCnpjUtil.valido("111.111.111-11"));
        assertFalse(CpfOuCnpjUtil.valido("000.000.000-00"));
    }

    @Test
    void rejeitaCnpjComTodosOsDigitosIguais() {
        assertFalse(CpfOuCnpjUtil.valido("11.111.111/1111-11"));
    }

    @Test
    void rejeitaQuantidadeDeDigitosDiferenteDe11Ou14() {
        assertFalse(CpfOuCnpjUtil.valido("123456"));
        assertFalse(CpfOuCnpjUtil.valido("123456789012345"));
    }

    @Test
    void rejeitaNulo() {
        assertFalse(CpfOuCnpjUtil.valido(null));
    }
}
