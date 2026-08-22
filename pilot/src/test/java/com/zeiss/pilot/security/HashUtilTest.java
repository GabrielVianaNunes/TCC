package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class HashUtilTest {

    @Test
    void mesmoValorGeraSempreOMesmoHash() {
        assertEquals(HashUtil.sha256Hex("12345678900"), HashUtil.sha256Hex("12345678900"));
    }

    @Test
    void valoresDiferentesGeramHashesDiferentes() {
        assertNotEquals(HashUtil.sha256Hex("12345678900"), HashUtil.sha256Hex("12345678901"));
    }

    @Test
    void hashTemSempre64CaracteresHex() {
        String hash = HashUtil.sha256Hex("12345678900");
        assertEquals(64, hash.length());
        assertEquals(hash, hash.toLowerCase());
    }

    @Test
    void normalizarDocumentoRemoveMascaraMantendoSoDigitos() {
        assertEquals("12345678900", HashUtil.normalizarDocumento("123.456.789-00"));
        assertEquals("12345678000199", HashUtil.normalizarDocumento("12.345.678/0001-99"));
    }

    @Test
    void normalizarDocumentoDeValorNuloDevolveStringVazia() {
        assertEquals("", HashUtil.normalizarDocumento(null));
    }

    @Test
    void mascaraDiferenteDoMesmoDocumentoGeraOMesmoHashDepoisDeNormalizado() {
        String hash1 = HashUtil.sha256Hex(HashUtil.normalizarDocumento("123.456.789-00"));
        String hash2 = HashUtil.sha256Hex(HashUtil.normalizarDocumento("12345678900"));
        assertEquals(hash1, hash2);
    }
}
