package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import software.amazon.awssdk.services.s3.model.S3Object;

class BackupServiceTest {

    private static byte[] chaveAleatoria() {
        byte[] chave = new byte[32];
        new SecureRandom().nextBytes(chave);
        return chave;
    }

    @Test
    void chavesExpiradasRetornaSoAsMaisAntigasQueOLimite() {
        Instant agora = Instant.now();
        S3Object antigo = S3Object.builder()
                .key("senai_zeiss-backup-antigo.dump")
                .lastModified(agora.minus(40, ChronoUnit.DAYS))
                .build();
        S3Object recente = S3Object.builder()
                .key("senai_zeiss-backup-recente.dump")
                .lastModified(agora.minus(5, ChronoUnit.DAYS))
                .build();

        Instant limite = agora.minus(30, ChronoUnit.DAYS);
        List<String> expiradas = BackupService.chavesExpiradas(List.of(antigo, recente), limite);

        assertEquals(1, expiradas.size());
        assertTrue(expiradas.contains("senai_zeiss-backup-antigo.dump"));
    }

    @Test
    void chavesExpiradasRetornaVazioQuandoNenhumPassouDoLimite() {
        Instant agora = Instant.now();
        S3Object recente = S3Object.builder()
                .key("senai_zeiss-backup-recente.dump")
                .lastModified(agora.minus(2, ChronoUnit.DAYS))
                .build();

        Instant limite = agora.minus(30, ChronoUnit.DAYS);
        List<String> expiradas = BackupService.chavesExpiradas(List.of(recente), limite);

        assertTrue(expiradas.isEmpty());
    }

    /**
     * FO-307 da GETIN (nuvem pública) exige que "a cópia [de backup] deve ser
     * criptografada". A ida e volta precisa devolver exatamente os bytes
     * originais, e o texto cifrado precisa ser diferente do original (senão
     * "criptografado" seria só um rótulo).
     */
    @Test
    void criptografarEDescriptografarDevolveOsBytesOriginais() throws GeneralSecurityException {
        byte[] chave = chaveAleatoria();
        byte[] original = "conteúdo de teste do backup, incluindo acentuação".getBytes(StandardCharsets.UTF_8);

        byte[] cifrado = BackupService.criptografar(original, chave);
        byte[] decifrado = BackupService.descriptografar(cifrado, chave);

        assertNotEquals(new String(original, StandardCharsets.UTF_8),
                new String(cifrado, StandardCharsets.UTF_8));
        assertArrayEquals(original, decifrado);
    }

    @Test
    void descriptografarComChaveErradaFalha() throws GeneralSecurityException {
        byte[] original = "dado sensível".getBytes(StandardCharsets.UTF_8);
        byte[] cifrado = BackupService.criptografar(original, chaveAleatoria());

        assertThrows(GeneralSecurityException.class,
                () -> BackupService.descriptografar(cifrado, chaveAleatoria()));
    }

    @Test
    void chaveComTamanhoDiferenteDe32BytesEhRejeitada() {
        byte[] original = "x".getBytes(StandardCharsets.UTF_8);
        byte[] chaveCurta = new byte[16]; // AES-128, não o AES-256 exigido

        assertThrows(IllegalArgumentException.class,
                () -> BackupService.criptografar(original, chaveCurta));
    }

    /**
     * Documentos anexados (certificado, laudo) precisam entrar no backup — o
     * FO-307 exige cobrir "banco de dados, anexos, arquivos de configurações
     * e outros que se fazem necessários", não só o banco.
     */
    @Test
    void compactarDiretorioIncluiArquivosEmSubpastas(@TempDir Path origem) throws IOException {
        Path usuario1 = origem.resolve("Usuario1");
        Files.createDirectories(usuario1);
        Files.writeString(usuario1.resolve("certificado.pdf"), "conteúdo do certificado");
        Path maquina2 = origem.resolve("Maquina2");
        Files.createDirectories(maquina2);
        Files.writeString(maquina2.resolve("laudo.pdf"), "conteúdo do laudo");

        Path zip = BackupService.compactarDiretorio(origem);

        try {
            List<String> entradas = new java.util.ArrayList<>();
            try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zip))) {
                ZipEntry entrada;
                while ((entrada = zis.getNextEntry()) != null) {
                    entradas.add(entrada.getName().replace('\\', '/'));
                }
            }
            assertTrue(entradas.contains("Usuario1/certificado.pdf"));
            assertTrue(entradas.contains("Maquina2/laudo.pdf"));
        } finally {
            Files.deleteIfExists(zip);
            Files.deleteIfExists(zip.getParent());
        }
    }

    @Test
    void compactarDiretorioInexistenteGeraZipVazioSemFalhar(@TempDir Path pai) throws IOException {
        Path inexistente = pai.resolve("nao-existe");

        Path zip = BackupService.compactarDiretorio(inexistente);

        try {
            assertTrue(Files.exists(zip));
        } finally {
            Files.deleteIfExists(zip);
            Files.deleteIfExists(zip.getParent());
        }
    }
}
