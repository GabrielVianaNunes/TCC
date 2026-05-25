package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.AvaliacaoDTO;
import com.zeiss.pilot.service.AvaliacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService service;

    @GetMapping
    public ResponseEntity<List<AvaliacaoDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<AvaliacaoDTO> criar(@RequestBody AvaliacaoDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }
}
