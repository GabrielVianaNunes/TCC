package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.VerificacaoAmbientalDTO;
import com.zeiss.pilot.service.VerificacaoAmbientalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/verificacoes-ambientais")
public class VerificacaoAmbientalController {

    @Autowired
    private VerificacaoAmbientalService service;

    @GetMapping
    public ResponseEntity<List<VerificacaoAmbientalDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<VerificacaoAmbientalDTO> criar(@RequestBody VerificacaoAmbientalDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }
}
