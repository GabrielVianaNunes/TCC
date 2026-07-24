package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BackupServiceIntegrationTest {

    @Autowired
    private BackupService backupService;

    private Path arquivoGerado;

    @AfterEach
    void tearDown() throws IOException {
        if (arquivoGerado != null) {
            Files.deleteIfExists(arquivoGerado);
            Files.deleteIfExists(arquivoGerado.getParent());
        }
    }

    @Test
    void criarDumpLocalGeraArquivoValidoDeFormatoCustom() throws Exception {
        arquivoGerado = backupService.criarDumpLocal();

        assertTrue(Files.exists(arquivoGerado));
        assertTrue(Files.size(arquivoGerado) > 0);

        byte[] assinatura = new byte[5];
        try (InputStream in = Files.newInputStream(arquivoGerado)) {
            int lidos = in.read(assinatura);
            assertTrue(lidos == 5);
        }
        assertArrayEquals("PGDMP".getBytes(), assinatura);
    }
}
