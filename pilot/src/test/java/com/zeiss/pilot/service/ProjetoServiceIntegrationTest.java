package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.ProjetoDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProjetoServiceIntegrationTest {

    @Autowired
    private ProjetoService projetoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Long usuarioComCargo(String cargo, String email) {
        Usuario u = new Usuario();
        u.setNome("Usuario Teste Projeto");
        u.setEmail(email);
        u.setSenha("senha123");
        u.setCargo(cargo);
        u.setRole(cargo);
        return usuarioRepository.save(u).getId();
    }

    private ProjetoDTO novoProjeto(String nome) {
        ProjetoDTO dto = new ProjetoDTO();
        dto.setNomeProjeto(nome);
        dto.setPrioridade("Alta");
        dto.setStatus("A iniciar");
        return dto;
    }

    @Test
    void criarProjetoSemResponsavelPermanceOpcional() {
        ProjetoDTO criado = projetoService.criarProjeto(novoProjeto("Projeto Sem Responsavel"));

        assertNull(criado.getResponsavelId());
    }

    @Test
    void criarProjetoComResponsavelGestorVinculaCorretamente() {
        Long gestorId = usuarioComCargo("GESTOR", "gestor.projeto.teste@zeiss.com");
        ProjetoDTO dto = novoProjeto("Projeto Com Gestor");
        dto.setResponsavelId(gestorId);

        ProjetoDTO criado = projetoService.criarProjeto(dto);

        assertEquals(gestorId, criado.getResponsavelId());
    }

    @Test
    void criarProjetoComResponsavelDeCargoNaoPermitidoLancaExcecao() {
        Long tecnicoId = usuarioComCargo("TECNICO", "tecnico.projeto.teste@zeiss.com");
        ProjetoDTO dto = novoProjeto("Projeto Com Tecnico");
        dto.setResponsavelId(tecnicoId);

        assertThrows(IllegalArgumentException.class, () -> projetoService.criarProjeto(dto));
    }

    @Test
    void atualizarProjetoComResponsavelDeCargoNaoPermitidoLancaExcecao() {
        ProjetoDTO criado = projetoService.criarProjeto(novoProjeto("Projeto Para Atualizar"));
        Long estagiarioId = usuarioComCargo("ESTAGIARIO", "estagiario.projeto.teste@zeiss.com");

        ProjetoDTO atualizacao = novoProjeto("Projeto Para Atualizar");
        atualizacao.setResponsavelId(estagiarioId);

        assertThrows(IllegalArgumentException.class,
                () -> projetoService.atualizarProjeto(criado.getId(), atualizacao));
    }
}
