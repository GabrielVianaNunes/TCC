package com.zeiss.pilot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.EventoRelatorioDTO;
import com.zeiss.pilot.dto.RelatorioMensalDTO;
import com.zeiss.pilot.service.EventoService;
import com.zeiss.pilot.service.ServicoService;

@RestController
public class RelatorioController {

    private final EventoService eventoService;
    private final ServicoService servicoService;

    public RelatorioController(EventoService eventoService, ServicoService servicoService) {
        this.eventoService = eventoService;
        this.servicoService = servicoService;
    }

    @GetMapping("/eventos/relatorios")
    public ResponseEntity<EventoRelatorioDTO> getRelatoriosEventos() {
        return ResponseEntity.ok(eventoService.getRelatoriosEventos());
    }

    @GetMapping("/servicos/relatorio-servicos/api")
    public ResponseEntity<List<RelatorioMensalDTO>> getRelatorioServicos() {
        return ResponseEntity.ok(servicoService.obterRelatorioMensal());
    }
}
