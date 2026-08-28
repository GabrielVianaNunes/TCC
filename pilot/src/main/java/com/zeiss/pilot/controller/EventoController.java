package com.zeiss.pilot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.EventoDTO;
import com.zeiss.pilot.dto.EventoRelatorioDTO;
import com.zeiss.pilot.service.EventoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public ResponseEntity<List<EventoDTO>> getAllEventos() {
        return ResponseEntity.ok(eventoService.getAllEventos());
    }

    @GetMapping("/relatorios")
    public ResponseEntity<EventoRelatorioDTO> getRelatorios() {
        return ResponseEntity.ok(eventoService.getRelatoriosEventos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> getEventoById(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.getEventoById(id));
    }

    @PostMapping
    public ResponseEntity<EventoDTO> createEvento(@Valid @RequestBody EventoDTO eventoDTO) {
        return ResponseEntity.ok(eventoService.createEvento(eventoDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> updateEvento(@PathVariable Long id, @Valid @RequestBody EventoDTO eventoDTO) {
        return ResponseEntity.ok(eventoService.updateEvento(id, eventoDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable Long id) {
        eventoService.deleteEvento(id);
        return ResponseEntity.noContent().build();
    }
}
