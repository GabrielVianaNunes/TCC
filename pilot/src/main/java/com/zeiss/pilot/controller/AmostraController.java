package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.AmostraDTO;
import com.zeiss.pilot.service.AmostraService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/amostras")
public class AmostraController {

    private final AmostraService service;

    public AmostraController(AmostraService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<AmostraDTO>> listar(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    String query,
            @RequestParam(required = false)    String status) {
        return ResponseEntity.ok(service.listarPaginado(page, size, query, status));
    }

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Long>> kpis() {
        return ResponseEntity.ok(service.getKpis());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmostraDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AmostraDTO> criar(@RequestBody AmostraDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmostraDTO> atualizar(@PathVariable Long id, @RequestBody AmostraDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
