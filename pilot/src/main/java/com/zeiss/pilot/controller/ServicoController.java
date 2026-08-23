package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.ServicoDTO;
import com.zeiss.pilot.service.ServicoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public ResponseEntity<Page<ServicoDTO>> listarServicos(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false)    String query,
            @RequestParam(required = false)    String status) {
        return ResponseEntity.ok(servicoService.listarPaginado(page, size, query, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ServicoDTO> criarServico(@Valid @RequestBody ServicoDTO dto) {
        return ResponseEntity.ok(servicoService.criarServico(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicoDTO> atualizarServico(@PathVariable Long id, @Valid @RequestBody ServicoDTO dto) {
        return ResponseEntity.ok(servicoService.atualizarServico(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirServico(@PathVariable Long id) {
        servicoService.excluirServico(id);
        return ResponseEntity.noContent().build();
    }
}
