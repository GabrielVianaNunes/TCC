package com.zeiss.pilot.security;

import java.security.GeneralSecurityException;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * AES-256-GCM com nonce aleatório de 12 bytes, prefixado ao texto cifrado —
 * mesmo esquema usado em {@code BackupService} para os arquivos de backup.
 * O modo GCM autentica o conteúdo: chave errada ou dado adulterado faz
 * {@link #descriptografar} lançar {@link GeneralSecurityException} em vez de
 * devolver dado corrompido silenciosamente.
 */
public final class AesGcmUtil {

    private static final int TAMANHO_NONCE = 12;
    private static final int TAMANHO_CHAVE = 32;

    private AesGcmUtil() {}

    public static byte[] criptografar(byte[] dados, byte[] chave) throws GeneralSecurityException {
        exigirChaveValida(chave);
        byte[] nonce = new byte[TAMANHO_NONCE];
        new SecureRandom().nextBytes(nonce);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(chave, "AES"), new GCMParameterSpec(128, nonce));
        byte[] textoCifrado = cipher.doFinal(dados);

        byte[] resultado = new byte[nonce.length + textoCifrado.length];
        System.arraycopy(nonce, 0, resultado, 0, nonce.length);
        System.arraycopy(textoCifrado, 0, resultado, nonce.length, textoCifrado.length);
        return resultado;
    }

    public static byte[] descriptografar(byte[] dadosComNonce, byte[] chave) throws GeneralSecurityException {
        exigirChaveValida(chave);
        byte[] nonce = new byte[TAMANHO_NONCE];
        byte[] textoCifrado = new byte[dadosComNonce.length - TAMANHO_NONCE];
        System.arraycopy(dadosComNonce, 0, nonce, 0, TAMANHO_NONCE);
        System.arraycopy(dadosComNonce, TAMANHO_NONCE, textoCifrado, 0, textoCifrado.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(chave, "AES"), new GCMParameterSpec(128, nonce));
        return cipher.doFinal(textoCifrado);
    }

    private static void exigirChaveValida(byte[] chave) {
        if (chave == null || chave.length != TAMANHO_CHAVE) {
            throw new IllegalArgumentException(
                    "Chave precisa ter " + TAMANHO_CHAVE + " bytes (AES-256), recebeu "
                    + (chave == null ? "null" : chave.length));
        }
    }
}
