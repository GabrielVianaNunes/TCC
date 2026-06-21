package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.DashboardEstagiarioDTO;
import com.zeiss.pilot.service.DashboardEstagiarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard-estagiarios")
public class DashboardEstagiarioController {

    private final DashboardEstagiarioService service;

    public DashboardEstagiarioController(DashboardEstagiarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<DashboardEstagiarioDTO> getDashboard() {
        return ResponseEntity.ok(service.getDashboard());
    }
}
