package com.zeiss.pilot.service;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;

/**
 * Backup automatizado do banco de dados e dos documentos anexados.
 *
 * <p>Duas exigências do FO-307 da GETIN (hospedagem em nuvem pública) moldam
 * este serviço: a cópia deve cobrir "banco de dados, anexos, arquivos de
 * configurações e outros que se fazem necessários" — daí o backup incluir
 * também o diretório de documentos, não só o `pg_dump` — e "a cópia deve ser
 * criptografada", daí todo arquivo ser cifrado com AES-256-GCM antes do envio.
 */
@Service
public class BackupService {

    private static final String BACKUP_PREFIX = "senai_zeiss-backup-";
    private static final String DOCS_BACKUP_PREFIX = "senai_zeiss-docs-backup-";

    @Value("${backup.pg-dump-path}")
    private String pgDumpPath;

    @Value("${backup.encryption-key:}")
    private String encryptionKeyBase64;

    @Value("${storage.pdf.base-path:C:/PDFs}")
    private String pdfBasePath;

    @Value("${backup.s3.endpoint}")
    private String s3Endpoint;

    @Value("${backup.s3.bucket}")
    private String s3Bucket;

    @Value("${backup.s3.access-key}")
    private String s3AccessKey;

    @Value("${backup.s3.secret-key}")
    private String s3SecretKey;

    @Value("${backup.s3.region}")
    private String s3Region;

    @Value("${backup.retention-days}")
    private int retentionDays;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @Scheduled(cron = "${backup.cron}")
    public void executarBackupAgendado() {
        executarBackup();
    }

    public String executarBackup() {
        if (!s3Configurado()) {
            System.out.println("[BACKUP] Desabilitado: variáveis BACKUP_S3_* não configuradas.");
            return null;
        }

        Path dump = null, dumpCifrado = null, docs = null, docsCifrado = null;
        try {
            byte[] chave = chaveDeCriptografia();

            dump = criarDumpLocal();
            dumpCifrado = criptografarArquivo(dump, chave);
            String chaveS3Dump = enviarParaS3(dumpCifrado);

            docs = compactarDocumentos();
            docsCifrado = criptografarArquivo(docs, chave);
            enviarParaS3(docsCifrado);

            aplicarRetencao(BACKUP_PREFIX);
            aplicarRetencao(DOCS_BACKUP_PREFIX);
            return chaveS3Dump;
        } catch (IOException | InterruptedException | GeneralSecurityException e) {
            throw new RuntimeException("Falha ao executar backup: " + e.getMessage(), e);
        } finally {
            limparTemp(dump);
            limparTemp(dumpCifrado);
            limparTemp(docs);
            limparTemp(docsCifrado);
        }
    }

    private void limparTemp(Path arquivo) {
        if (arquivo == null) {
            return;
        }
        try {
            Files.deleteIfExists(arquivo);
            Files.deleteIfExists(arquivo.getParent());
        } catch (IOException ignored) {
            // arquivo temporário já removido ou inacessível — não impede o resultado do backup
        }
    }

    Path criarDumpLocal() throws IOException, InterruptedException {
        String nomeArquivo = BACKUP_PREFIX
                + DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(LocalDateTime.now())
                + ".dump";
        Path destino = Files.createTempDirectory("zeiss-backup").resolve(nomeArquivo);

        String semEsquema = datasourceUrl.replaceFirst("^jdbc:postgresql://", "");
        String hostPorta = semEsquema.substring(0, semEsquema.indexOf('/'));
        String dbName = semEsquema.substring(semEsquema.indexOf('/') + 1);
        String host = hostPorta.contains(":") ? hostPorta.substring(0, hostPorta.indexOf(':')) : hostPorta;
        String porta = hostPorta.contains(":") ? hostPorta.substring(hostPorta.indexOf(':') + 1) : "5432";

        ProcessBuilder pb = new ProcessBuilder(
                pgDumpPath, "-Fc",
                "-h", host, "-p", porta,
                "-U", datasourceUsername,
                "-d", dbName,
                "-f", destino.toString()
        );
        pb.environment().put("PGPASSWORD", datasourcePassword);
        pb.redirectErrorStream(true);

        Process processo = pb.start();
        String saida = new String(processo.getInputStream().readAllBytes());
        int codigo = processo.waitFor();
        if (codigo != 0) {
            throw new RuntimeException("pg_dump falhou (código " + codigo + "): " + saida);
        }
        return destino;
    }

    /** Compacta o diretório configurado em {@code storage.pdf.base-path}. */
    Path compactarDocumentos() throws IOException {
        String nomeArquivo = DOCS_BACKUP_PREFIX
                + DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").format(LocalDateTime.now())
                + ".zip";
        Path destino = Files.createTempDirectory("zeiss-backup-docs").resolve(nomeArquivo);
        compactarEm(Paths.get(pdfBasePath), destino);
        return destino;
    }

    /**
     * Versão testável sem Spring: compacta {@code origem} num zip novo em
     * diretório temporário próprio. Se {@code origem} não existir (ambiente
     * que nunca recebeu upload de documento), gera um zip vazio em vez de
     * falhar — backup do banco não deve ser bloqueado por isso.
     */
    static Path compactarDiretorio(Path origem) throws IOException {
        Path destino = Files.createTempDirectory("zeiss-backup-docs-test").resolve("documentos.zip");
        compactarEm(origem, destino);
        return destino;
    }

    private static void compactarEm(Path origem, Path destinoZip) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(destinoZip))) {
            if (!Files.isDirectory(origem)) {
                return;
            }
            try (Stream<Path> arquivos = Files.walk(origem)) {
                List<Path> regulares = arquivos.filter(Files::isRegularFile).collect(Collectors.toList());
                for (Path arquivo : regulares) {
                    String nomeEntrada = origem.relativize(arquivo).toString().replace('\\', '/');
                    zos.putNextEntry(new ZipEntry(nomeEntrada));
                    Files.copy(arquivo, zos);
                    zos.closeEntry();
                }
            }
        }
    }

    // ── Criptografia (AES-256-GCM) ──────────────────────────────────────────

    private byte[] chaveDeCriptografia() {
        if (encryptionKeyBase64 == null || encryptionKeyBase64.isBlank()) {
            throw new IllegalStateException(
                    "BACKUP_ENCRYPTION_KEY não configurada. O backup só é enviado ao S3 criptografado "
                    + "(exigência do FO-307 da GETIN) — sem a chave, o backup não roda. "
                    + "Gere uma chave com: openssl rand -base64 32");
        }
        byte[] chave;
        try {
            chave = Base64.getDecoder().decode(encryptionKeyBase64);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("BACKUP_ENCRYPTION_KEY não é Base64 válido.", e);
        }
        if (chave.length != 32) {
            throw new IllegalStateException(
                    "BACKUP_ENCRYPTION_KEY inválida: decodificou para " + chave.length
                    + " bytes, mas AES-256 exige exatamente 32. Gere com: openssl rand -base64 32");
        }
        return chave;
    }

    private Path criptografarArquivo(Path origem, byte[] chave) throws IOException, GeneralSecurityException {
        byte[] cifrado = criptografar(Files.readAllBytes(origem), chave);
        Path destino = origem.resolveSibling(origem.getFileName() + ".enc");
        Files.write(destino, cifrado);
        return destino;
    }

    /**
     * AES-256-GCM com nonce aleatório de 12 bytes, prefixado ao texto cifrado
     * (padrão comum — o nonce não é segredo, só precisa ser único por chave).
     * O modo GCM autentica o conteúdo: qualquer alteração ou chave errada faz
     * {@link #descriptografar} lançar {@link GeneralSecurityException} em vez
     * de devolver dado corrompido silenciosamente.
     */
    static byte[] criptografar(byte[] dados, byte[] chave) throws GeneralSecurityException {
        if (chave.length != 32) {
            throw new IllegalArgumentException("Chave precisa ter 32 bytes (AES-256), recebeu " + chave.length);
        }
        byte[] nonce = new byte[12];
        new SecureRandom().nextBytes(nonce);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(chave, "AES"), new GCMParameterSpec(128, nonce));
        byte[] textoCifrado = cipher.doFinal(dados);

        byte[] resultado = new byte[nonce.length + textoCifrado.length];
        System.arraycopy(nonce, 0, resultado, 0, nonce.length);
        System.arraycopy(textoCifrado, 0, resultado, nonce.length, textoCifrado.length);
        return resultado;
    }

    static byte[] descriptografar(byte[] dadosComNonce, byte[] chave) throws GeneralSecurityException {
        byte[] nonce = new byte[12];
        byte[] textoCifrado = new byte[dadosComNonce.length - 12];
        System.arraycopy(dadosComNonce, 0, nonce, 0, 12);
        System.arraycopy(dadosComNonce, 12, textoCifrado, 0, textoCifrado.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(chave, "AES"), new GCMParameterSpec(128, nonce));
        return cipher.doFinal(textoCifrado);
    }

    // ── S3 ───────────────────────────────────────────────────────────────────

    String enviarParaS3(Path arquivo) throws IOException {
        try (S3Client cliente = criarClienteS3()) {
            String chave = arquivo.getFileName().toString();
            cliente.putObject(
                    PutObjectRequest.builder().bucket(s3Bucket).key(chave).build(),
                    RequestBody.fromFile(arquivo));
            return chave;
        }
    }

    void aplicarRetencao(String prefixo) {
        try (S3Client cliente = criarClienteS3()) {
            ListObjectsV2Response resposta = cliente.listObjectsV2(
                    ListObjectsV2Request.builder().bucket(s3Bucket).prefix(prefixo).build());

            Instant limite = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
            for (String chave : chavesExpiradas(resposta.contents(), limite)) {
                cliente.deleteObject(DeleteObjectRequest.builder().bucket(s3Bucket).key(chave).build());
            }
        }
    }

    static List<String> chavesExpiradas(List<S3Object> objetos, Instant limite) {
        return objetos.stream()
                .filter(o -> o.lastModified().isBefore(limite))
                .map(S3Object::key)
                .collect(Collectors.toList());
    }

    private S3Client criarClienteS3() {
        return S3Client.builder()
                .endpointOverride(URI.create(s3Endpoint))
                .region(Region.of(s3Region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(s3AccessKey, s3SecretKey)))
                .forcePathStyle(true)
                .build();
    }

    private boolean s3Configurado() {
        return s3Endpoint != null && !s3Endpoint.isBlank()
                && s3Bucket != null && !s3Bucket.isBlank();
    }
}
