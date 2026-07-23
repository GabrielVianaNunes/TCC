package com.zeiss.pilot.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.zeiss.pilot.repository.UsuarioRepository;

@Controller
public class PageController {

    private final UsuarioRepository usuarioRepository;

    public PageController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping({"/", "/index"})
    public String paginaInicial() {
        return "index";
    }

    @GetMapping("/projetos")
    public String paginaProjetos() {
        return "projetos";
    }

    @GetMapping("/usuarios")
    public String paginaUsuarios() {
        return "usuarios";
    }

    @GetMapping("/documentos")
    public String paginaDocumentos(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        usuarioRepository.findByEmail(userDetails.getUsername())
                .ifPresent(u -> model.addAttribute("usuarioId", u.getId()));
        return "documentos";
    }

    // Eventos — sidebar usa /eventos/listar
    @GetMapping({"/lista-eventos", "/eventos/listar"})
    public String paginaListaEventos() {
        return "lista-eventos";
    }

    // Dashboard Eventos — sidebar usa /eventos/dashboard
    @GetMapping({"/dashboardEventos", "/eventos/dashboard"})
    public String paginaDashboardEventos() {
        return "dashboardEventos";
    }

    @GetMapping("/servicos")
    public String paginaServicos() {
        return "servicos";
    }

    // Dashboard Serviços — sidebar usa /servicos/relatorio-servicos
    @GetMapping({"/dashboardServicos", "/servicos/relatorio-servicos"})
    public String paginaDashboardServicos() {
        return "dashboardServicos";
    }

    // Visitas Técnicas — sidebar usa /visitas-tecnicas
    @GetMapping({"/visitasTecnicas", "/visitas-tecnicas"})
    public String paginaVisitasTecnicas() {
        return "visitasTecnicas";
    }

    // Editais — sidebar usa /editais/lista
    @GetMapping({"/lista-editais", "/editais/lista"})
    public String paginaListaEditais() {
        return "lista-editais";
    }

    @GetMapping({"/detalhes-edital", "/editais/{id}"})
    public String paginaDetalhesEdital(@PathVariable(required = false) Long id, Model model) {
        java.util.Map<String, Object> edital = new java.util.HashMap<>();
        edital.put("id", id);
        edital.put("nomeEdital", "");
        edital.put("status", "");
        edital.put("instituicaoFornecedora", "");
        edital.put("instituicaoParceira", null);
        edital.put("valor", null);
        model.addAttribute("edital", edital);
        return "detalhes-edital";
    }

    @GetMapping("/almoxarifado")
    public String paginaAlmoxarifado() {
        return "almoxarifado";
    }

    @GetMapping("/amostras")
    public String paginaAmostras() {
        return "amostras";
    }

    @GetMapping("/avaliacao")
    public String paginaAvaliacao() {
        return "avaliacao";
    }

    @GetMapping("/dashboard-avaliacao")
    public String paginaDashboardAvaliacao() {
        return "dashboard-avaliacao";
    }

    @GetMapping("/maquinas")
    public String paginaMaquinas() {
        return "maquinas";
    }

    @GetMapping("/verificacao-ambiental")
    public String paginaVerificacaoAmbiental() {
        return "verificacao-ambiental";
    }

    @GetMapping("/kanban-estagiarios")
    public String paginaKanbanEstagiarios() {
        return "kanban-estagiarios";
    }

    @GetMapping("/dashboard-estagiarios")
    public String paginaDashboardEstagiarios() {
        return "dashboard-estagiarios";
    }

    @GetMapping("/qrcode-avaliacao")
    public String paginaQrcodeAvaliacao() {
        return "qrcode-avaliacao";
    }
}
