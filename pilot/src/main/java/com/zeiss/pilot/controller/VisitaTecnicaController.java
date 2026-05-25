package com.zeiss.pilot.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.VisitaTecnicaDTO;
import com.zeiss.pilot.entity.VisitaTecnica;
import com.zeiss.pilot.service.VisitaTecnicaService;

@RestController
@RequestMapping("/api/visitas-tecnicas")
public class VisitaTecnicaController {

    private final VisitaTecnicaService service;

    public VisitaTecnicaController(VisitaTecnicaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<VisitaTecnicaDTO>> getAllVisitas() {
        List<VisitaTecnica> visitas = service.listarVisitas();
        List<VisitaTecnicaDTO> dtos = visitas.stream()
                                             .map(VisitaTecnicaDTO::fromEntity)
                                             .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<VisitaTecnicaDTO> salvarVisita(@RequestBody VisitaTecnicaDTO dto) {
        VisitaTecnica entidade = dto.toEntity();
        VisitaTecnica salvo = service.salvarVisita(entidade);
        return ResponseEntity.ok(VisitaTecnicaDTO.fromEntity(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitaTecnicaDTO> atualizarVisita(@PathVariable Long id, @RequestBody VisitaTecnicaDTO dto) {
        VisitaTecnica entidade = dto.toEntity();
        entidade.setId(id);
        VisitaTecnica atualizado = service.salvarVisita(entidade);
        return ResponseEntity.ok(VisitaTecnicaDTO.fromEntity(atualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVisita(@PathVariable Long id) {
        service.deletarVisita(id);
        return ResponseEntity.noContent().build();
    }
}
