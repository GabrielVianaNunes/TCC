package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.junit.jupiter.api.Test;

import software.amazon.awssdk.services.s3.model.S3Object;

class BackupServiceTest {

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
}
