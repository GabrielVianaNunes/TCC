package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.DocumentoMaquinaDTO;
import com.zeiss.pilot.service.DocumentoMaquinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/maquinas/{maquinaId}/documentos")
public class DocumentoMaquinaController {

    @Autowired
    private DocumentoMaquinaService service;

    @GetMapping
    public ResponseEntity<List<DocumentoMaquinaDTO>> listar(@PathVariable Long maquinaId) {
        return ResponseEntity.ok(service.listar(maquinaId));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentoMaquinaDTO> upload(
            @PathVariable Long maquinaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "tipoDocumento", required = false) String tipoDocumento,
            @RequestParam(value = "dataExpiracao", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataExpiracao
    ) throws IOException {
        return ResponseEntity.ok(service.upload(arquivo, maquinaId, dataExpiracao, tipoDocumento));
    }

    @GetMapping("/{docId}/abrir")
    public ResponseEntity<Resource> abrir(@PathVariable Long maquinaId, @PathVariable Long docId) {
        return service.abrir(docId);
    }

    @DeleteMapping("/{docId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long maquinaId, @PathVariable Long docId) {
        service.remover(docId);
        return ResponseEntity.noContent().build();
    }
}
