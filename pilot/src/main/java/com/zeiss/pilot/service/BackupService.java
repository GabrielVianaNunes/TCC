package com.zeiss.pilot.service;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

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

@Service
public class BackupService {

    private static final String BACKUP_PREFIX = "senai_zeiss-backup-";

    @Value("${backup.pg-dump-path}")
    private String pgDumpPath;

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

        Path arquivoLocal = null;
        try {
            arquivoLocal = criarDumpLocal();
            String chave = enviarParaS3(arquivoLocal);
            aplicarRetencao();
            return chave;
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Falha ao executar backup: " + e.getMessage(), e);
        } finally {
            if (arquivoLocal != null) {
                try {
                    Files.deleteIfExists(arquivoLocal);
                    Files.deleteIfExists(arquivoLocal.getParent());
                } catch (IOException ignored) {
                    // arquivo temporário já removido ou inacessível — não impede o resultado do backup
                }
            }
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

    String enviarParaS3(Path arquivo) throws IOException {
        try (S3Client cliente = criarClienteS3()) {
            String chave = arquivo.getFileName().toString();
            cliente.putObject(
                    PutObjectRequest.builder().bucket(s3Bucket).key(chave).build(),
                    RequestBody.fromFile(arquivo));
            return chave;
        }
    }

    void aplicarRetencao() {
        try (S3Client cliente = criarClienteS3()) {
            ListObjectsV2Response resposta = cliente.listObjectsV2(
                    ListObjectsV2Request.builder().bucket(s3Bucket).prefix(BACKUP_PREFIX).build());

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
