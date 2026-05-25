package com.zeiss.pilot.controller;

import com.zeiss.pilot.dto.DashboardEstagiarioDTO;
import com.zeiss.pilot.service.DashboardEstagiarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard-estagiarios")
public class DashboardEstagiarioController {

    @Autowired
    private DashboardEstagiarioService service;

    @GetMapping
    public ResponseEntity<DashboardEstagiarioDTO> getDashboard() {
        return ResponseEntity.ok(service.getDashboard());
    }
}
