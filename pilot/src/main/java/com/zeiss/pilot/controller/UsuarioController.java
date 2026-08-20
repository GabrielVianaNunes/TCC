package com.zeiss.pilot.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zeiss.pilot.dto.UsuarioDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioService usuarioService, PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
    }

    private Usuario usuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return usuarioService.buscarPorEmail(auth.getName());
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> me() {
        return ResponseEntity.ok(usuarioService.buscarPorId(usuarioLogado().getId()));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios(@RequestParam(required = false) String role) {
        if (role != null && !role.isEmpty()) {
            return ResponseEntity.ok(usuarioService.listarUsuariosPorRole(role));
        }
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/admins")
    public ResponseEntity<List<UsuarioDTO>> listarApenasAdmins() {
        return ResponseEntity.ok(usuarioService.listarUsuariosPorRole("ADMIN"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarUsuarioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> criarUsuario(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.criarUsuario(usuario, usuarioLogado()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> atualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, usuario, usuarioLogado()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        usuarioService.deletarUsuario(id, usuarioLogado());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validar-senha-admin")
    public ResponseEntity<Boolean> validarSenhaAdmin(@RequestBody Map<String, String> payload, Principal principal) {
        String senhaDigitada = payload.get("senha");
        Usuario usuario = usuarioService.buscarPorEmail(principal.getName());
        return ResponseEntity.ok(passwordEncoder.matches(senhaDigitada, usuario.getSenha()));
    }
}
