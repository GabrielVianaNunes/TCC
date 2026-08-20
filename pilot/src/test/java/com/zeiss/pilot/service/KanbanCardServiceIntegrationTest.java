package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.KanbanCardDTO;
import com.zeiss.pilot.entity.Estagiario;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.EstagiarioRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class KanbanCardServiceIntegrationTest {

    @Autowired
    private KanbanCardService kanbanCardService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstagiarioRepository estagiarioRepository;

    private Usuario salvarUsuario(String nome, String email, String cargo, String role) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha("x");
        u.setCargo(cargo);
        u.setRole(role);
        return usuarioRepository.save(u);
    }

    private Usuario admin() { return salvarUsuario("Admin KC", "admin.kc@zeiss.com", "DIRETOR_CEM", "ADMIN"); }
    private Usuario gestor(String sufixo) { return salvarUsuario("Gestor " + sufixo, "gestor." + sufixo + ".kc@zeiss.com", "GESTOR", "GESTOR"); }
    private Usuario tecnico(String sufixo) { return salvarUsuario("Técnico " + sufixo, "tecnico." + sufixo + ".kc@zeiss.com", "TECNICO", "TECNICO"); }

    private Usuario estagiarioComVinculo(String sufixo) {
        Usuario u = salvarUsuario("Estagiário " + sufixo, "estagiario." + sufixo + ".kc@zeiss.com", "ESTAGIARIO", "ESTAGIARIO");
        Estagiario e = new Estagiario();
        e.setNome(u.getNome());
        e.setEmail(u.getEmail());
        e.setAtivo(true);
        e.setUsuario(u);
        estagiarioRepository.save(e);
        return u;
    }

    private Long estagiarioIdDe(Usuario usuarioEstagiario) {
        return estagiarioRepository.findByUsuarioId(usuarioEstagiario.getId()).orElseThrow().getId();
    }

    private KanbanCardDTO cardEstagiario(Long estagiariaId, String titulo) {
        KanbanCardDTO dto = new KanbanCardDTO();
        dto.setTitulo(titulo);
        dto.setEstagiariaId(estagiariaId);
        dto.setColuna("backlog");
        return dto;
    }

    private KanbanCardDTO cardUsuario(Long usuarioId, String titulo) {
        KanbanCardDTO dto = new KanbanCardDTO();
        dto.setTitulo(titulo);
        dto.setUsuarioId(usuarioId);
        dto.setColuna("backlog");
        return dto;
    }

    /* ── Criação: quem pode atribuir a quem ──────────────────────────── */

    @Test
    void gestorConsegueCriarAtividadeParaTecnico() {
        Usuario tec = tecnico("A");
        KanbanCardDTO criado = kanbanCardService.salvar(cardUsuario(tec.getId(), "Calibrar CMM"), gestor("A"));
        assertEquals(tec.getId(), criado.getUsuarioId());
    }

    @Test
    void tecnicoNaoConsegueCriarAtividadeParaOutroTecnico() {
        Usuario tecA = tecnico("B");
        Usuario tecB = tecnico("C");
        assertThrows(AccessDeniedException.class, () ->
                kanbanCardService.salvar(cardUsuario(tecB.getId(), "Indevida"), tecA));
    }

    @Test
    void adminConsegueCriarAtividadeParaGestor() {
        Usuario g = gestor("D");
        KanbanCardDTO criado = kanbanCardService.salvar(cardUsuario(g.getId(), "Planejamento trimestral"), admin());
        assertEquals(g.getId(), criado.getUsuarioId());
    }

    @Test
    void gestorConsegueCriarAtividadeParaSiMesmo() {
        Usuario g = gestor("E");
        KanbanCardDTO criado = kanbanCardService.salvar(cardUsuario(g.getId(), "Revisar contrato"), g);
        assertEquals(g.getId(), criado.getUsuarioId());
    }

    @Test
    void gestorNaoConsegueCriarAtividadeParaOutroGestor() {
        Usuario g1 = gestor("F");
        Usuario g2 = gestor("G");
        assertThrows(AccessDeniedException.class, () ->
                kanbanCardService.salvar(cardUsuario(g2.getId(), "Indevida"), g1));
    }

    /* ── Visibilidade: a matriz completa ──────────────────────────────── */

    @Test
    void adminVeAtividadeDeEstagiarioTecnicoEGestor() {
        Usuario est = estagiarioComVinculo("H");
        Usuario tec = tecnico("H");
        Usuario g = gestor("H");
        Usuario adm = admin();
        kanbanCardService.salvar(cardEstagiario(estagiarioIdDe(est), "Tarefa estagiário"), adm);
        kanbanCardService.salvar(cardUsuario(tec.getId(), "Tarefa técnico"), adm);
        kanbanCardService.salvar(cardUsuario(g.getId(), "Tarefa gestor"), g);

        List<KanbanCardDTO> visiveis = kanbanCardService.listarVisiveisPara(adm);

        assertTrue(visiveis.stream().anyMatch(c -> "Tarefa estagiário".equals(c.getTitulo())));
        assertTrue(visiveis.stream().anyMatch(c -> "Tarefa técnico".equals(c.getTitulo())));
        assertTrue(visiveis.stream().anyMatch(c -> "Tarefa gestor".equals(c.getTitulo())));
    }

    @Test
    void gestorVeAtividadesDeTodosOsTecnicosETodosOsEstagiariosMasNaoDeOutroGestor() {
        Usuario est = estagiarioComVinculo("I");
        Usuario tec = tecnico("I");
        Usuario gEu = gestor("I");
        Usuario gOutro = gestor("J");
        kanbanCardService.salvar(cardEstagiario(estagiarioIdDe(est), "Tarefa estagiário I"), gEu);
        kanbanCardService.salvar(cardUsuario(tec.getId(), "Tarefa técnico I"), gEu);
        kanbanCardService.salvar(cardUsuario(gEu.getId(), "Minha tarefa"), gEu);
        kanbanCardService.salvar(cardUsuario(gOutro.getId(), "Tarefa do outro gestor"), gOutro);

        List<KanbanCardDTO> visiveis = kanbanCardService.listarVisiveisPara(gEu);
        List<String> titulos = visiveis.stream().map(KanbanCardDTO::getTitulo).toList();

        assertTrue(titulos.contains("Tarefa estagiário I"));
        assertTrue(titulos.contains("Tarefa técnico I"));
        assertTrue(titulos.contains("Minha tarefa"));
        assertTrue(titulos.stream().noneMatch("Tarefa do outro gestor"::equals));
    }

    @Test
    void tecnicoVeAtividadesDeTodosOsEstagiariosEAsProprias_NaoVeDeOutroTecnicoNemDeGestor() {
        Usuario est = estagiarioComVinculo("K");
        Usuario euTec = tecnico("K");
        Usuario outroTec = tecnico("L");
        Usuario g = gestor("K");
        kanbanCardService.salvar(cardEstagiario(estagiarioIdDe(est), "Tarefa estagiário K"), g);
        kanbanCardService.salvar(cardUsuario(euTec.getId(), "Minha tarefa técnico"), g);
        kanbanCardService.salvar(cardUsuario(outroTec.getId(), "Tarefa outro técnico"), g);
        kanbanCardService.salvar(cardUsuario(g.getId(), "Tarefa do gestor"), g);

        List<KanbanCardDTO> visiveis = kanbanCardService.listarVisiveisPara(euTec);
        List<String> titulos = visiveis.stream().map(KanbanCardDTO::getTitulo).toList();

        assertTrue(titulos.contains("Tarefa estagiário K"));
        assertTrue(titulos.contains("Minha tarefa técnico"));
        assertTrue(titulos.stream().noneMatch("Tarefa outro técnico"::equals));
        assertTrue(titulos.stream().noneMatch("Tarefa do gestor"::equals));
    }

    @Test
    void estagiarioSoVeAsPropriasAtividades() {
        Usuario euEst = estagiarioComVinculo("M");
        Usuario outroEst = estagiarioComVinculo("N");
        Usuario g = gestor("M");
        kanbanCardService.salvar(cardEstagiario(estagiarioIdDe(euEst), "Minha tarefa estagiário"), g);
        kanbanCardService.salvar(cardEstagiario(estagiarioIdDe(outroEst), "Tarefa outro estagiário"), g);
        kanbanCardService.salvar(cardUsuario(g.getId(), "Tarefa do gestor"), g);

        List<KanbanCardDTO> visiveis = kanbanCardService.listarVisiveisPara(euEst);
        List<String> titulos = visiveis.stream().map(KanbanCardDTO::getTitulo).toList();

        assertEquals(1, titulos.size());
        assertTrue(titulos.contains("Minha tarefa estagiário"));
    }

    /* ── PATCH parcial não pode apagar os demais campos ───────────────── */

    @Test
    void patchParcialDeColunaNaoApagaTituloNemDono() {
        Usuario tec = tecnico("O");
        Usuario g = gestor("O");
        KanbanCardDTO criado = kanbanCardService.salvar(cardUsuario(tec.getId(), "Tarefa preservada"), g);

        KanbanCardDTO patchSoColuna = new KanbanCardDTO();
        patchSoColuna.setColuna("em-andamento");
        KanbanCardDTO atualizado = kanbanCardService.atualizar(criado.getId(), patchSoColuna, tec);

        assertEquals("Tarefa preservada", atualizado.getTitulo());
        assertEquals(tec.getId(), atualizado.getUsuarioId());
        assertEquals("em-andamento", atualizado.getColuna());
    }

    @Test
    void tecnicoNaoConsegueAtualizarAtividadeDeOutroTecnico() {
        Usuario tecA = tecnico("P");
        Usuario tecB = tecnico("Q");
        Usuario g = gestor("P");
        KanbanCardDTO criado = kanbanCardService.salvar(cardUsuario(tecA.getId(), "Tarefa A"), g);

        KanbanCardDTO patch = new KanbanCardDTO();
        patch.setColuna("concluido");
        assertThrows(AccessDeniedException.class, () -> kanbanCardService.atualizar(criado.getId(), patch, tecB));
    }
}
