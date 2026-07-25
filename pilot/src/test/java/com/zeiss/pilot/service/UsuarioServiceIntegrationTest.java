package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.UsuarioDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UsuarioServiceIntegrationTest {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario salvar(String nome, String email, String cargo, String role) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha("x");
        u.setCargo(cargo);
        u.setRole(role);
        return usuarioRepository.save(u);
    }

    private Usuario novoUsuario(String nome, String email, String cargo) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha("senha123");
        u.setCargo(cargo);
        return u;
    }

    private Usuario chamadorAdmin() {
        return salvar("Admin Teste", "admin.teste.usc@zeiss.com", "DIRETOR_CEM", "ADMIN");
    }

    private Usuario chamadorGestor() {
        return salvar("Gestor Teste", "gestor.teste.usc@zeiss.com", "GESTOR", "GESTOR");
    }

    /* ── Derivação de papel por cargo ─────────────────────────── */

    @Test
    void criarUsuarioComCargoEstagiarioDerivaRoleEstagiario() {
        UsuarioDTO dto = usuarioService.criarUsuario(
                novoUsuario("Fulano Estagiário", "fulano.estagiario.usc@zeiss.com", "ESTAGIARIO"),
                chamadorAdmin());
        assertEquals("ESTAGIARIO", dto.getRole());
    }

    @Test
    void criarUsuarioComCargoGestorDerivaRoleGestor() {
        UsuarioDTO dto = usuarioService.criarUsuario(
                novoUsuario("Fulana Gestora", "fulana.gestora.usc@zeiss.com", "GESTOR"),
                chamadorAdmin());
        assertEquals("GESTOR", dto.getRole());
    }

    @Test
    void criarUsuarioComCargoDiretorCemDerivaRoleAdmin() {
        UsuarioDTO dto = usuarioService.criarUsuario(
                novoUsuario("Fulano Diretor", "fulano.diretor.usc@zeiss.com", "DIRETOR_CEM"),
                chamadorAdmin());
        assertEquals("ADMIN", dto.getRole());
    }

    /* ── Escopo do Gestor: criar ───────────────────────────────── */

    @Test
    void gestorConsegueCriarUsuarioComCargoEstagiario() {
        UsuarioDTO dto = usuarioService.criarUsuario(
                novoUsuario("Novo Estagiário", "novo.estagiario.usc@zeiss.com", "ESTAGIARIO"),
                chamadorGestor());
        assertEquals("ESTAGIARIO", dto.getRole());
    }

    @Test
    void gestorNaoConsegueCriarUsuarioComCargoGestor() {
        Usuario chamador = chamadorGestor();
        assertThrows(AccessDeniedException.class, () ->
                usuarioService.criarUsuario(
                        novoUsuario("Outro Gestor", "outro.gestor.usc@zeiss.com", "GESTOR"),
                        chamador));
    }

    @Test
    void gestorNaoConsegueCriarUsuarioComCargoDiretorCem() {
        Usuario chamador = chamadorGestor();
        assertThrows(AccessDeniedException.class, () ->
                usuarioService.criarUsuario(
                        novoUsuario("Outro Diretor", "outro.diretor.usc@zeiss.com", "DIRETOR_CEM"),
                        chamador));
    }

    /* ── Escopo do Gestor: editar ──────────────────────────────── */

    @Test
    void gestorConsegueEditarUsuarioQueJaEEstagiario() {
        Usuario alvo = salvar("Estagiário Alvo", "estagiario.alvo.usc@zeiss.com", "ESTAGIARIO", "ESTAGIARIO");
        Usuario dadosNovos = novoUsuario("Estagiário Alvo Editado", "estagiario.alvo.usc@zeiss.com", "ESTAGIARIO");

        UsuarioDTO dto = usuarioService.atualizarUsuario(alvo.getId(), dadosNovos, chamadorGestor());
        assertEquals("Estagiário Alvo Editado", dto.getNome());
    }

    @Test
    void gestorNaoConsegueEditarUsuarioQueJaEGestor() {
        Usuario alvo = salvar("Gestor Alvo", "gestor.alvo.usc@zeiss.com", "GESTOR", "GESTOR");
        Usuario dadosNovos = novoUsuario("Gestor Alvo Editado", "gestor.alvo.usc@zeiss.com", "GESTOR");
        Usuario chamador = chamadorGestor();

        assertThrows(AccessDeniedException.class, () ->
                usuarioService.atualizarUsuario(alvo.getId(), dadosNovos, chamador));
    }

    @Test
    void gestorNaoConseguePromoverEstagiarioParaGestor() {
        Usuario alvo = salvar("Estagiário Promovido", "estagiario.promovido.usc@zeiss.com", "ESTAGIARIO", "ESTAGIARIO");
        Usuario dadosNovos = novoUsuario("Estagiário Promovido", "estagiario.promovido.usc@zeiss.com", "GESTOR");
        Usuario chamador = chamadorGestor();

        assertThrows(AccessDeniedException.class, () ->
                usuarioService.atualizarUsuario(alvo.getId(), dadosNovos, chamador));
    }

    /* ── Escopo do Gestor: excluir ─────────────────────────────── */

    @Test
    void gestorConsegueExcluirUsuarioQueJaEEstagiario() {
        Usuario alvo = salvar("Estagiário Para Excluir", "estagiario.excluir.usc@zeiss.com", "ESTAGIARIO", "ESTAGIARIO");
        usuarioService.deletarUsuario(alvo.getId(), chamadorGestor());
        assertEquals(0, usuarioRepository.findById(alvo.getId()).stream().count());
    }

    @Test
    void gestorNaoConsegueExcluirUsuarioQueJaEAdmin() {
        Usuario alvo = salvar("Admin Alvo", "admin.alvo.usc@zeiss.com", "DIRETOR_CEM", "ADMIN");
        Usuario chamador = chamadorGestor();

        assertThrows(AccessDeniedException.class, () ->
                usuarioService.deletarUsuario(alvo.getId(), chamador));
    }

    /* ── Admin continua sem restrição ─────────────────────────── */

    @Test
    void adminConsegueCriarEditarExcluirQualquerCargo() {
        Usuario chamador = chamadorAdmin();
        UsuarioDTO criado = usuarioService.criarUsuario(
                novoUsuario("Gestor Criado Por Admin", "gestor.criadoporadmin.usc@zeiss.com", "GESTOR"),
                chamador);
        assertEquals("GESTOR", criado.getRole());

        Usuario dadosNovos = novoUsuario("Gestor Criado Por Admin Editado", "gestor.criadoporadmin.usc@zeiss.com", "DIRETOR_CEM");
        UsuarioDTO editado = usuarioService.atualizarUsuario(criado.getId(), dadosNovos, chamador);
        assertEquals("ADMIN", editado.getRole());

        usuarioService.deletarUsuario(criado.getId(), chamador);
        assertEquals(0, usuarioRepository.findById(criado.getId()).stream().count());
    }
}
