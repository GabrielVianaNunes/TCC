package com.zeiss.pilot.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.ProjetoDTO;
import com.zeiss.pilot.service.ProjetoService;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    private final ProjetoService projetoService;

    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @GetMapping
    public ResponseEntity<List<ProjetoDTO>> listarProjetos() {
        return ResponseEntity.ok(projetoService.listarProjetos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetoDTO> buscarPorId(@PathVariable Long id) {
        Optional<ProjetoDTO> projeto = projetoService.buscarPorId(id);
        return projeto.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjetoDTO> criarProjeto(@RequestBody ProjetoDTO dto) {
        return ResponseEntity.ok(projetoService.criarProjeto(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjetoDTO> atualizarProjeto(@PathVariable Long id, @RequestBody ProjetoDTO dto) {
        ProjetoDTO atualizado = projetoService.atualizarProjeto(id, dto);
        return (atualizado != null) ? ResponseEntity.ok(atualizado) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProjeto(@PathVariable Long id) {
        return projetoService.excluirProjeto(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
