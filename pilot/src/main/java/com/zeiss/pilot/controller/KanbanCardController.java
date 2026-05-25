package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.KanbanCardDTO;
import com.zeiss.pilot.service.KanbanCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanban-cards")
public class KanbanCardController {

    @Autowired
    private KanbanCardService service;

    @GetMapping
    public ResponseEntity<List<KanbanCardDTO>> listar(
            @RequestParam(required = false) Long estagiariaId) {
        if (estagiariaId != null) {
            return ResponseEntity.ok(service.listarPorEstagiaria(estagiariaId));
        }
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<KanbanCardDTO> criar(@RequestBody KanbanCardDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<KanbanCardDTO> atualizar(@PathVariable Long id, @RequestBody KanbanCardDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
