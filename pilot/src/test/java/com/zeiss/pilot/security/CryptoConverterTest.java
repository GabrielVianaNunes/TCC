package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.security.SecureRandom;
import java.util.Base64;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class CryptoConverterTest {

    private static CryptoConverter converterComChave() {
        byte[] chave = new byte[32];
        new SecureRandom().nextBytes(chave);
        CryptoConverter converter = new CryptoConverter();
        ReflectionTestUtils.setField(converter, "chaveBase64", Base64.getEncoder().encodeToString(chave));
        return converter;
    }

    @Test
    void nuloVaiENuloVolta() {
        CryptoConverter converter = converterComChave();
        assertNull(converter.convertToDatabaseColumn(null));
        assertNull(converter.convertToEntityAttribute(null));
    }

    @Test
    void cifraEDecifraDevolveOValorOriginal() {
        CryptoConverter converter = converterComChave();
        String original = "123.456.789-00";

        String noBanco = converter.convertToDatabaseColumn(original);
        String derivado = converter.convertToEntityAttribute(noBanco);

        assertEquals(original, derivado);
    }

    @Test
    void valorGravadoNoBancoComecaComOPrefixoDeVersao() {
        CryptoConverter converter = converterComChave();
        String noBanco = converter.convertToDatabaseColumn("Rua Exemplo, 123");
        assertTrue(noBanco.startsWith("enc:v1:"));
    }

    @Test
    void leituraDeValorLegadoSemPrefixoDevolveOValorComoEsta() {
        CryptoConverter converter = converterComChave();
        String legado = "12.345.678/0001-99";

        assertEquals(legado, converter.convertToEntityAttribute(legado));
    }

    @Test
    void semChaveConfiguradaLancaExcecaoAoCifrar() {
        CryptoConverter converter = new CryptoConverter();
        ReflectionTestUtils.setField(converter, "chaveBase64", "");

        assertThrows(IllegalStateException.class, () -> converter.convertToDatabaseColumn("qualquer valor"));
    }
}
