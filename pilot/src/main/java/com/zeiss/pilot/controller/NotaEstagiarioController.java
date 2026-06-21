package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.NotaEstagiarioDTO;
import com.zeiss.pilot.service.NotaEstagiarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-estagiarios")
public class NotaEstagiarioController {

    private final NotaEstagiarioService service;

    public NotaEstagiarioController(NotaEstagiarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotaEstagiarioDTO>> listar(
            @RequestParam(required = false) Long estagiariaId) {
        if (estagiariaId != null) {
            return ResponseEntity.ok(service.listarPorEstagiaria(estagiariaId));
        }
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<NotaEstagiarioDTO> criar(@RequestBody NotaEstagiarioDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }
}
