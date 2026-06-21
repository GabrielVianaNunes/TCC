package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.ItemAlmoxarifadoDTO;
import com.zeiss.pilot.dto.MovimentacaoAlmoxarifadoDTO;
import com.zeiss.pilot.service.AlmoxarifadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/almoxarifado")
public class AlmoxarifadoController {

    private final AlmoxarifadoService service;

    public AlmoxarifadoController(AlmoxarifadoService service) {
        this.service = service;
    }

    @GetMapping("/itens")
    public ResponseEntity<List<ItemAlmoxarifadoDTO>> listarItens() {
        return ResponseEntity.ok(service.listarItens());
    }

    @PostMapping("/itens")
    public ResponseEntity<ItemAlmoxarifadoDTO> criarItem(@RequestBody ItemAlmoxarifadoDTO dto) {
        return ResponseEntity.ok(service.salvarItem(dto));
    }

    @PutMapping("/itens/{id}")
    public ResponseEntity<ItemAlmoxarifadoDTO> atualizarItem(@PathVariable Long id,
                                                              @RequestBody ItemAlmoxarifadoDTO dto) {
        return ResponseEntity.ok(service.atualizarItem(id, dto));
    }

    @DeleteMapping("/itens/{id}")
    public ResponseEntity<Void> deletarItem(@PathVariable Long id) {
        service.deletarItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoAlmoxarifadoDTO>> listarMovimentacoes(
            @RequestParam(required = false) Long itemId) {
        if (itemId != null) {
            return ResponseEntity.ok(service.listarMovimentacoesPorItem(itemId));
        }
        return ResponseEntity.ok(service.listarMovimentacoes());
    }

    @PostMapping("/movimentacoes")
    public ResponseEntity<MovimentacaoAlmoxarifadoDTO> registrarMovimentacao(
            @RequestBody MovimentacaoAlmoxarifadoDTO dto) {
        return ResponseEntity.ok(service.registrarMovimentacao(dto));
    }
}
