package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.AvaliacaoDTO;
import com.zeiss.pilot.service.AvaliacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AvaliacaoDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<AvaliacaoDTO> criar(@RequestBody AvaliacaoDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }
}
