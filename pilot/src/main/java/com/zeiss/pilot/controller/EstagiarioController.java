package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.EstagiarioDTO;
import com.zeiss.pilot.service.EstagiarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estagiarios")
public class EstagiarioController {

    @Autowired
    private EstagiarioService service;

    @GetMapping
    public ResponseEntity<List<EstagiarioDTO>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean apenasAtivos) {
        if (apenasAtivos) {
            return ResponseEntity.ok(service.listarAtivos());
        }
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstagiarioDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EstagiarioDTO> criar(@RequestBody EstagiarioDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EstagiarioDTO> atualizar(@PathVariable Long id, @RequestBody EstagiarioDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
