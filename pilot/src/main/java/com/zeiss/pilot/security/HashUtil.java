package com.zeiss.pilot.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Hash determinístico (SHA-256) para permitir checagem de duplicata sobre um
 * valor que está criptografado no banco — a coluna cifrada em si nunca pode
 * ter UNIQUE, porque o nonce aleatório do AES-GCM faz o mesmo valor gerar
 * texto cifrado diferente a cada vez. Não é criptografia (não usa chave, não
 * é reversível) — é um "índice cego": permite confirmar se um valor já
 * cadastrado bate com um novo, sem guardá-lo em texto claro.
 */
public final class HashUtil {

    private HashUtil() {}

    public static String sha256Hex(String valor) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(valor.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível na JVM", e);
        }
    }

    /** Remove tudo que não é dígito, para o hash não variar por causa de máscara (com ou sem pontuação). */
    public static String normalizarDocumento(String cpfOuCnpj) {
        return cpfOuCnpj == null ? "" : cpfOuCnpj.replaceAll("[^0-9]", "");
    }
}
