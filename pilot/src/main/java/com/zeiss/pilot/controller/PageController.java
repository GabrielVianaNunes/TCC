package com.zeiss.pilot.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.zeiss.pilot.service.UsuarioService;

@Controller
public class PageController {

    private final UsuarioService usuarioService;

    public PageController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
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
    public String paginaUsuarios(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        String papel = "";
        try {
            papel = usuarioService.buscarPorEmail(userDetails.getUsername()).getRole();
        } catch (RuntimeException ignored) {
            // usuário autenticado mas ausente no banco (ex.: testes com @WithMockUser) — mantém string vazia
        }
        model.addAttribute("papelUsuarioLogado", papel);
        return "usuarios";
    }

    @GetMapping("/documentos")
    public String paginaDocumentos(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        try {
            model.addAttribute("usuarioId", usuarioService.buscarPorEmail(userDetails.getUsername()).getId());
        } catch (RuntimeException ignored) {
            // usuário autenticado mas ausente no banco — mantém o comportamento anterior de não popular o atributo
        }
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

    @GetMapping("/clientes")
    public String paginaClientes() {
        return "clientes";
    }
}
