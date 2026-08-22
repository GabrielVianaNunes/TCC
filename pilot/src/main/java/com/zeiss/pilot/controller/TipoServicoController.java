package com.zeiss.pilot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.TipoServicoDTO;
import com.zeiss.pilot.service.TipoServicoService;

@RestController
@RequestMapping("/api/tipos-servico")
public class TipoServicoController {

    private final TipoServicoService tipoServicoService;

    public TipoServicoController(TipoServicoService tipoServicoService) {
        this.tipoServicoService = tipoServicoService;
    }

    @GetMapping
    public ResponseEntity<List<TipoServicoDTO>> listar() {
        return ResponseEntity.ok(tipoServicoService.listar());
    }
}
