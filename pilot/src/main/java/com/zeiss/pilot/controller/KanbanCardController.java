package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.KanbanCardDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.service.KanbanCardService;
import com.zeiss.pilot.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanban-cards")
public class KanbanCardController {

    private final KanbanCardService service;
    private final UsuarioService usuarioService;

    public KanbanCardController(KanbanCardService service, UsuarioService usuarioService) {
        this.service = service;
        this.usuarioService = usuarioService;
    }

    private Usuario usuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return usuarioService.buscarPorEmail(auth.getName());
    }

    @GetMapping
    public ResponseEntity<List<KanbanCardDTO>> listar(
            @RequestParam(required = false) Long estagiariaId) {
        if (estagiariaId != null) {
            return ResponseEntity.ok(service.listarPorEstagiaria(estagiariaId));
        }
        return ResponseEntity.ok(service.listarVisiveisPara(usuarioLogado()));
    }

    @PostMapping
    public ResponseEntity<KanbanCardDTO> criar(@RequestBody KanbanCardDTO dto) {
        return ResponseEntity.ok(service.salvar(dto, usuarioLogado()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<KanbanCardDTO> atualizar(@PathVariable Long id, @RequestBody KanbanCardDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto, usuarioLogado()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id, usuarioLogado());
        return ResponseEntity.noContent().build();
    }
}
