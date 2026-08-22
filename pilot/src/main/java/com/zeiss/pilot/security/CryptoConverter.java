package com.zeiss.pilot.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Criptografa campos de dado pessoal no banco (CPF/CNPJ, endereço) —
 * exigência da GETIN (FO-307/FO-358: "mascaramento e/ou criptografia e/ou
 * tokenização" de dado pessoal). AES-256-GCM, mesma técnica do backup.
 *
 * <p>Leitura tolerante a dado legado: um valor sem o prefixo {@link #PREFIXO}
 * é devolvido como está, em vez de falhar a descriptografia — é assim que
 * dado gravado antes desta conversão existir aparece, até a próxima escrita
 * do registro, que sempre grava já cifrado.
 */
@Converter
@Component
public class CryptoConverter implements AttributeConverter<String, String> {

    static final String PREFIXO = "enc:v1:";

    @Value("${security.field-encryption-key:}")
    private String chaveBase64;

    @Override
    public String convertToDatabaseColumn(String valorClaro) {
        if (valorClaro == null) {
            return null;
        }
        try {
            byte[] cifrado = AesGcmUtil.criptografar(valorClaro.getBytes(StandardCharsets.UTF_8), chave());
            return PREFIXO + Base64.getEncoder().encodeToString(cifrado);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao criptografar campo: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertToEntityAttribute(String valorBanco) {
        if (valorBanco == null) {
            return null;
        }
        if (!valorBanco.startsWith(PREFIXO)) {
            return valorBanco;
        }
        try {
            byte[] cifrado = Base64.getDecoder().decode(valorBanco.substring(PREFIXO.length()));
            byte[] claro = AesGcmUtil.descriptografar(cifrado, chave());
            return new String(claro, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao descriptografar campo: " + e.getMessage(), e);
        }
    }

    private byte[] chave() {
        if (chaveBase64 == null || chaveBase64.isBlank()) {
            throw new IllegalStateException(
                    "FIELD_ENCRYPTION_KEY não configurada. Campos de dado pessoal (CPF/CNPJ, endereço) só são "
                    + "gravados criptografados (exigência do FO-307/FO-358 da GETIN) — sem a chave, a operação falha "
                    + "em vez de gravar em texto claro. Gere uma chave com: openssl rand -base64 32");
        }
        byte[] chave;
        try {
            chave = Base64.getDecoder().decode(chaveBase64);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("FIELD_ENCRYPTION_KEY não é Base64 válido.", e);
        }
        if (chave.length != 32) {
            throw new IllegalStateException(
                    "FIELD_ENCRYPTION_KEY inválida: decodificou para " + chave.length
                    + " bytes, mas AES-256 exige exatamente 32. Gere com: openssl rand -base64 32");
        }
        return chave;
    }
}
