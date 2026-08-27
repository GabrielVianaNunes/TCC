package com.zeiss.pilot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.ClienteReceitaDTO;
import com.zeiss.pilot.dto.ClienteReceitaMensalDTO;
import com.zeiss.pilot.dto.EventoRelatorioDTO;
import com.zeiss.pilot.dto.RelatorioMensalDTO;
import com.zeiss.pilot.service.ClienteService;
import com.zeiss.pilot.service.EventoService;
import com.zeiss.pilot.service.ServicoService;

@RestController
public class RelatorioController {

    private final EventoService eventoService;
    private final ServicoService servicoService;
    private final ClienteService clienteService;

    public RelatorioController(EventoService eventoService, ServicoService servicoService, ClienteService clienteService) {
        this.eventoService = eventoService;
        this.servicoService = servicoService;
        this.clienteService = clienteService;
    }

    @GetMapping("/eventos/relatorios")
    public ResponseEntity<EventoRelatorioDTO> getRelatoriosEventos() {
        return ResponseEntity.ok(eventoService.getRelatoriosEventos());
    }

    @GetMapping("/servicos/relatorio-servicos/api")
    public ResponseEntity<List<RelatorioMensalDTO>> getRelatorioServicos() {
        return ResponseEntity.ok(servicoService.obterRelatorioMensal());
    }

    @GetMapping("/clientes/relatorio")
    public ResponseEntity<List<ClienteReceitaDTO>> getRelatorioClientes() {
        return ResponseEntity.ok(clienteService.obterRankingReceita());
    }

    @GetMapping("/clientes/dashboard/dados")
    public ResponseEntity<List<ClienteReceitaMensalDTO>> getReceitaMensalClientes() {
        return ResponseEntity.ok(clienteService.obterReceitaMensalDetalhada());
    }
}
