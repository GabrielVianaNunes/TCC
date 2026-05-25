package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.AgendamentoMaquinaDTO;
import com.zeiss.pilot.dto.ManutencaoMaquinaDTO;
import com.zeiss.pilot.dto.MaquinaDTO;
import com.zeiss.pilot.dto.SessaoMaquinaDTO;
import com.zeiss.pilot.service.MaquinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maquinas")
public class MaquinaController {

    @Autowired
    private MaquinaService service;

    @GetMapping
    public ResponseEntity<List<MaquinaDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaquinaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MaquinaDTO> criar(@RequestBody MaquinaDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MaquinaDTO> atualizar(@PathVariable Long id, @RequestBody MaquinaDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // Sessões

    @GetMapping("/{maquinaId}/sessoes")
    public ResponseEntity<List<SessaoMaquinaDTO>> listarSessoes(@PathVariable Long maquinaId) {
        return ResponseEntity.ok(service.listarSessoes(maquinaId));
    }

    @PostMapping("/{maquinaId}/sessoes")
    public ResponseEntity<SessaoMaquinaDTO> criarSessao(@PathVariable Long maquinaId,
                                                         @RequestBody SessaoMaquinaDTO dto) {
        return ResponseEntity.ok(service.criarSessao(maquinaId, dto));
    }

    @PatchMapping("/{maquinaId}/sessoes/{id}")
    public ResponseEntity<SessaoMaquinaDTO> atualizarSessao(@PathVariable Long maquinaId,
                                                              @PathVariable Long id,
                                                              @RequestBody SessaoMaquinaDTO dto) {
        return ResponseEntity.ok(service.atualizarSessao(id, dto));
    }

    @DeleteMapping("/{maquinaId}/sessoes/{id}")
    public ResponseEntity<Void> deletarSessao(@PathVariable Long maquinaId, @PathVariable Long id) {
        service.deletarSessao(id);
        return ResponseEntity.noContent().build();
    }

    // Manutenções

    @GetMapping("/{maquinaId}/manutencoes")
    public ResponseEntity<List<ManutencaoMaquinaDTO>> listarManutencoes(@PathVariable Long maquinaId) {
        return ResponseEntity.ok(service.listarManutencoes(maquinaId));
    }

    @PostMapping("/{maquinaId}/manutencoes")
    public ResponseEntity<ManutencaoMaquinaDTO> criarManutencao(@PathVariable Long maquinaId,
                                                                  @RequestBody ManutencaoMaquinaDTO dto) {
        return ResponseEntity.ok(service.criarManutencao(maquinaId, dto));
    }

    @PatchMapping("/{maquinaId}/manutencoes/{id}")
    public ResponseEntity<ManutencaoMaquinaDTO> atualizarManutencao(@PathVariable Long maquinaId,
                                                                      @PathVariable Long id,
                                                                      @RequestBody ManutencaoMaquinaDTO dto) {
        return ResponseEntity.ok(service.atualizarManutencao(id, dto));
    }

    @DeleteMapping("/{maquinaId}/manutencoes/{id}")
    public ResponseEntity<Void> deletarManutencao(@PathVariable Long maquinaId, @PathVariable Long id) {
        service.deletarManutencao(id);
        return ResponseEntity.noContent().build();
    }

    // Agendamentos

    @GetMapping("/{maquinaId}/agendamentos")
    public ResponseEntity<List<AgendamentoMaquinaDTO>> listarAgendamentos(@PathVariable Long maquinaId) {
        return ResponseEntity.ok(service.listarAgendamentos(maquinaId));
    }

    @PostMapping("/{maquinaId}/agendamentos")
    public ResponseEntity<AgendamentoMaquinaDTO> criarAgendamento(@PathVariable Long maquinaId,
                                                                    @RequestBody AgendamentoMaquinaDTO dto) {
        return ResponseEntity.ok(service.criarAgendamento(maquinaId, dto));
    }

    @PatchMapping("/{maquinaId}/agendamentos/{id}")
    public ResponseEntity<AgendamentoMaquinaDTO> atualizarAgendamento(@PathVariable Long maquinaId,
                                                                        @PathVariable Long id,
                                                                        @RequestBody AgendamentoMaquinaDTO dto) {
        return ResponseEntity.ok(service.atualizarAgendamento(id, dto));
    }

    @DeleteMapping("/{maquinaId}/agendamentos/{id}")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long maquinaId, @PathVariable Long id) {
        service.deletarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
}
