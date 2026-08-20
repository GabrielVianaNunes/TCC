package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;

import org.junit.jupiter.api.Test;

class AesGcmUtilTest {

    private static byte[] chaveAleatoria() {
        byte[] chave = new byte[32];
        new SecureRandom().nextBytes(chave);
        return chave;
    }

    @Test
    void cifrarEDescifrarDevolveOTextoOriginal() throws GeneralSecurityException {
        byte[] chave = chaveAleatoria();
        byte[] original = "123.456.789-00".getBytes(StandardCharsets.UTF_8);

        byte[] cifrado = AesGcmUtil.criptografar(original, chave);
        byte[] decifrado = AesGcmUtil.descriptografar(cifrado, chave);

        assertArrayEquals(original, decifrado);
    }

    @Test
    void duasCriptografiasDoMesmoValorGeramSaidasDiferentes() throws GeneralSecurityException {
        byte[] chave = chaveAleatoria();
        byte[] original = "123.456.789-00".getBytes(StandardCharsets.UTF_8);

        byte[] cifrado1 = AesGcmUtil.criptografar(original, chave);
        byte[] cifrado2 = AesGcmUtil.criptografar(original, chave);

        assertNotEquals(new String(cifrado1, StandardCharsets.ISO_8859_1), new String(cifrado2, StandardCharsets.ISO_8859_1));
    }

    @Test
    void descriptografarComChaveErradaLancaExcecao() throws GeneralSecurityException {
        byte[] chaveCerta = chaveAleatoria();
        byte[] chaveErrada = chaveAleatoria();
        byte[] cifrado = AesGcmUtil.criptografar("dado sensível".getBytes(StandardCharsets.UTF_8), chaveCerta);

        assertThrows(GeneralSecurityException.class, () -> AesGcmUtil.descriptografar(cifrado, chaveErrada));
    }

    @Test
    void chaveComTamanhoErradoLancaExcecao() {
        byte[] chaveCurta = new byte[16];
        assertThrows(IllegalArgumentException.class,
                () -> AesGcmUtil.criptografar("x".getBytes(StandardCharsets.UTF_8), chaveCurta));
    }
}
