package com.zeiss.pilot.controller;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.PastaDocumentoDTO;
import com.zeiss.pilot.entity.PastaDocumento;
import com.zeiss.pilot.service.PastaDocumentoService;

@RestController
@RequestMapping("/api/pastas")
public class PastaDocumentoController {

    @Autowired
    private PastaDocumentoService service;

    private PastaDocumentoDTO toDTO(PastaDocumento p) {
        PastaDocumentoDTO dto = new PastaDocumentoDTO();
        dto.setId(p.getId());
        dto.setNome(p.getNome());
        dto.setTipoAcesso(p.getTipoAcesso());
        dto.setPastaPaiId(p.getPastaPai() != null ? p.getPastaPai().getId() : null);
        return dto;
    }

    // LISTAR pastas raiz
    @GetMapping
    public List<PastaDocumentoDTO> listarPastasRaiz() {
        return service.listarRaiz().stream().map(this::toDTO).collect(Collectors.toList());
    }

    // LISTAR subpastas de um pai
    @GetMapping("/{id}/subpastas")
    public List<PastaDocumentoDTO> listarSubpastas(@PathVariable Long id) {
        return service.listarSubpastas(id).stream().map(this::toDTO).collect(Collectors.toList());
    }

    // OBTER por id
    @GetMapping("/{id}")
    public ResponseEntity<PastaDocumentoDTO> obter(@PathVariable Long id) {
        PastaDocumento p = service.obter(id);
        return ResponseEntity.ok(toDTO(p));
    }

    // CRIAR pasta (raiz ou subpasta se enviar pastaPaiId)
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody PastaDocumentoDTO dto) {
        try {
            PastaDocumento p = service.criarPasta(dto.getNome(), dto.getTipoAcesso(), dto.getPastaPaiId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(p));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // ATUALIZAR pasta/subpasta
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody PastaDocumentoDTO dto) {
        try {
            PastaDocumento p = service.atualizar(id, dto.getNome(), dto.getTipoAcesso());
            return ResponseEntity.ok(toDTO(p));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // EXCLUIR (bloqueia se tiver subpastas ou documentos)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            service.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // (Opcional) MOVER pasta/subpasta
    @PutMapping("/{id}/mover/{novoPaiId}")
    public ResponseEntity<?> mover(@PathVariable Long id, @PathVariable(required = false) Long novoPaiId) {
        try {
            PastaDocumento p = service.mover(id, novoPaiId);
            return ResponseEntity.ok(toDTO(p));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}

