package com.zeiss.pilot.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.service.BackupService;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @PostMapping("/executar")
    public ResponseEntity<Map<String, String>> executar() {
        String chave = backupService.executarBackup();
        if (chave == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "Backup desabilitado: variáveis BACKUP_S3_* não configuradas."));
        }
        return ResponseEntity.ok(Map.of("arquivo", chave));
    }
}
