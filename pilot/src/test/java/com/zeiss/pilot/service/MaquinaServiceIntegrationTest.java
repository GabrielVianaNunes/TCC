package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.AgendamentoMaquinaDTO;
import com.zeiss.pilot.dto.ManutencaoMaquinaDTO;
import com.zeiss.pilot.dto.MaquinaDTO;
import com.zeiss.pilot.dto.SessaoMaquinaDTO;
import com.zeiss.pilot.repository.AgendamentoMaquinaRepository;
import com.zeiss.pilot.repository.ManutencaoMaquinaRepository;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.SessaoMaquinaRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MaquinaServiceIntegrationTest {

    @Autowired
    private MaquinaService maquinaService;

    @Autowired
    private MaquinaRepository maquinaRepository;

    @Autowired
    private SessaoMaquinaRepository sessaoRepository;

    @Autowired
    private ManutencaoMaquinaRepository manutencaoRepository;

    @Autowired
    private AgendamentoMaquinaRepository agendamentoRepository;

    private MaquinaDTO criarMaquina(String nome, String patrimonioId) {
        MaquinaDTO dto = new MaquinaDTO();
        dto.setNome(nome);
        dto.setPatrimonioId(patrimonioId);
        dto.setStatus("Ativa");
        return maquinaService.salvar(dto);
    }

    // ---- Máquina ----
    // Nota: a tabela "maquinas" já tem 4 registros permanentes (seed do
    // MaquinaDataInitializer, ver "Contexto já resolvido" no plano) — os
    // testes abaixo checam presença por id, nunca tamanho exato de lista.

    @Test
    void listarRetornaMaquinasCriadasNesteTeste() {
        MaquinaDTO m1 = criarMaquina("Máquina Teste Listar A", "TESTE-LIST-A");
        MaquinaDTO m2 = criarMaquina("Máquina Teste Listar B", "TESTE-LIST-B");

        List<MaquinaDTO> todas = maquinaService.listar();

        assertTrue(todas.stream().anyMatch(dto -> dto.getId().equals(m1.getId())));
        assertTrue(todas.stream().anyMatch(dto -> dto.getId().equals(m2.getId())));
    }

    @Test
    void buscarPorIdEncontradoRetornaDto() {
        MaquinaDTO criada = criarMaquina("Máquina Teste Buscar", "TESTE-BUSCAR");

        MaquinaDTO encontrada = maquinaService.buscarPorId(criada.getId());

        assertEquals("Máquina Teste Buscar", encontrada.getNome());
    }

    @Test
    void buscarPorIdNaoEncontradoLancaExcecao() {
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.buscarPorId(999999L));
        assertTrue(ex.getMessage().contains("Máquina não encontrada"));
    }

    @Test
    void salvarPersisteEDevolveIdGerado() {
        MaquinaDTO criada = criarMaquina("Máquina Teste Salvar", "TESTE-SALVAR");

        assertNotNull(criada.getId());
        assertTrue(maquinaRepository.findById(criada.getId()).isPresent());
    }

    @Test
    void atualizarEncontradoAtualizaCampos() {
        MaquinaDTO criada = criarMaquina("Máquina Original", "TESTE-ATUALIZAR");

        MaquinaDTO novosDados = new MaquinaDTO();
        novosDados.setNome("Máquina Atualizada");
        novosDados.setStatus("Manutenção");

        MaquinaDTO atualizada = maquinaService.atualizar(criada.getId(), novosDados);

        assertEquals("Máquina Atualizada", atualizada.getNome());
        assertEquals("Manutenção", atualizada.getStatus());
    }

    @Test
    void atualizarNaoEncontradoLancaExcecao() {
        MaquinaDTO novosDados = new MaquinaDTO();
        novosDados.setNome("Não importa");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.atualizar(999999L, novosDados));
        assertTrue(ex.getMessage().contains("Máquina não encontrada"));
    }

    @Test
    void deletarRemoveRegistro() {
        MaquinaDTO criada = criarMaquina("Máquina Teste Deletar", "TESTE-DELETAR");

        maquinaService.deletar(criada.getId());

        assertTrue(maquinaRepository.findById(criada.getId()).isEmpty());
    }

    // ---- Sessões ----

    @Test
    void criarSessaoComMaquinaExistentePersisteEAssociaMaquina() {
        MaquinaDTO maquina = criarMaquina("Máquina Sessão", "TESTE-SESSAO-1");
        SessaoMaquinaDTO dto = new SessaoMaquinaDTO();
        dto.setUsuario("operador.teste");
        dto.setDataLigada(LocalDateTime.now());

        SessaoMaquinaDTO criada = maquinaService.criarSessao(maquina.getId(), dto);

        assertNotNull(criada.getId());
        assertEquals(maquina.getId(), criada.getMaquinaId());
        assertEquals("operador.teste", criada.getUsuario());
    }

    @Test
    void criarSessaoComMaquinaInexistenteLancaExcecao() {
        SessaoMaquinaDTO dto = new SessaoMaquinaDTO();
        dto.setUsuario("operador.teste");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.criarSessao(999999L, dto));
        assertTrue(ex.getMessage().contains("Máquina não encontrada"));
    }

    @Test
    void listarSessoesRetornaApenasDaMaquinaCorreta() {
        MaquinaDTO maquinaA = criarMaquina("Máquina Sessão A", "TESTE-SESSAO-A");
        MaquinaDTO maquinaB = criarMaquina("Máquina Sessão B", "TESTE-SESSAO-B");

        SessaoMaquinaDTO sessaoA = new SessaoMaquinaDTO();
        sessaoA.setUsuario("usuarioA");
        maquinaService.criarSessao(maquinaA.getId(), sessaoA);

        SessaoMaquinaDTO sessaoB = new SessaoMaquinaDTO();
        sessaoB.setUsuario("usuarioB");
        maquinaService.criarSessao(maquinaB.getId(), sessaoB);

        List<SessaoMaquinaDTO> sessoesDeA = maquinaService.listarSessoes(maquinaA.getId());

        assertEquals(1, sessoesDeA.size());
        assertEquals("usuarioA", sessoesDeA.get(0).getUsuario());
    }

    @Test
    void atualizarSessaoEncontradaAtualizaCampos() {
        MaquinaDTO maquina = criarMaquina("Máquina Sessão Update", "TESTE-SESSAO-UPD");
        SessaoMaquinaDTO original = new SessaoMaquinaDTO();
        original.setUsuario("usuario.original");
        SessaoMaquinaDTO criada = maquinaService.criarSessao(maquina.getId(), original);

        SessaoMaquinaDTO novosDados = new SessaoMaquinaDTO();
        novosDados.setUsuario("usuario.atualizado");
        novosDados.setHorasUso(5.5);

        SessaoMaquinaDTO atualizada = maquinaService.atualizarSessao(criada.getId(), novosDados);

        assertEquals("usuario.atualizado", atualizada.getUsuario());
        assertEquals(5.5, atualizada.getHorasUso());
    }

    @Test
    void atualizarSessaoNaoEncontradaLancaExcecao() {
        SessaoMaquinaDTO novosDados = new SessaoMaquinaDTO();
        novosDados.setUsuario("não importa");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.atualizarSessao(999999L, novosDados));
        assertTrue(ex.getMessage().contains("Sessão não encontrada"));
    }

    @Test
    void deletarSessaoRemoveRegistro() {
        MaquinaDTO maquina = criarMaquina("Máquina Sessão Delete", "TESTE-SESSAO-DEL");
        SessaoMaquinaDTO dto = new SessaoMaquinaDTO();
        dto.setUsuario("usuario.delete");
        SessaoMaquinaDTO criada = maquinaService.criarSessao(maquina.getId(), dto);

        maquinaService.deletarSessao(criada.getId());

        assertTrue(sessaoRepository.findById(criada.getId()).isEmpty());
    }

    // ---- Manutenções ----

    @Test
    void criarManutencaoComMaquinaExistentePersisteEAssociaMaquina() {
        MaquinaDTO maquina = criarMaquina("Máquina Manutenção", "TESTE-MANUT-1");
        ManutencaoMaquinaDTO dto = new ManutencaoMaquinaDTO();
        dto.setTipo("Preventiva");
        dto.setResponsavel("Técnico Teste");
        dto.setData(LocalDate.now());

        ManutencaoMaquinaDTO criada = maquinaService.criarManutencao(maquina.getId(), dto);

        assertNotNull(criada.getId());
        assertEquals(maquina.getId(), criada.getMaquinaId());
        assertEquals("Preventiva", criada.getTipo());
    }

    @Test
    void criarManutencaoComMaquinaInexistenteLancaExcecao() {
        ManutencaoMaquinaDTO dto = new ManutencaoMaquinaDTO();
        dto.setTipo("Preventiva");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.criarManutencao(999999L, dto));
        assertTrue(ex.getMessage().contains("Máquina não encontrada"));
    }

    @Test
    void listarManutencoesRetornaApenasDaMaquinaCorreta() {
        MaquinaDTO maquinaA = criarMaquina("Máquina Manutenção A", "TESTE-MANUT-A");
        MaquinaDTO maquinaB = criarMaquina("Máquina Manutenção B", "TESTE-MANUT-B");

        ManutencaoMaquinaDTO manutencaoA = new ManutencaoMaquinaDTO();
        manutencaoA.setTipo("Preventiva A");
        maquinaService.criarManutencao(maquinaA.getId(), manutencaoA);

        ManutencaoMaquinaDTO manutencaoB = new ManutencaoMaquinaDTO();
        manutencaoB.setTipo("Preventiva B");
        maquinaService.criarManutencao(maquinaB.getId(), manutencaoB);

        List<ManutencaoMaquinaDTO> manutencoesDeA = maquinaService.listarManutencoes(maquinaA.getId());

        assertEquals(1, manutencoesDeA.size());
        assertEquals("Preventiva A", manutencoesDeA.get(0).getTipo());
    }

    @Test
    void atualizarManutencaoEncontradaAtualizaCampos() {
        MaquinaDTO maquina = criarMaquina("Máquina Manutenção Update", "TESTE-MANUT-UPD");
        ManutencaoMaquinaDTO original = new ManutencaoMaquinaDTO();
        original.setTipo("Preventiva");
        ManutencaoMaquinaDTO criada = maquinaService.criarManutencao(maquina.getId(), original);

        ManutencaoMaquinaDTO novosDados = new ManutencaoMaquinaDTO();
        novosDados.setTipo("Corretiva");
        novosDados.setStatus("Concluída");

        ManutencaoMaquinaDTO atualizada = maquinaService.atualizarManutencao(criada.getId(), novosDados);

        assertEquals("Corretiva", atualizada.getTipo());
        assertEquals("Concluída", atualizada.getStatus());
    }

    @Test
    void atualizarManutencaoNaoEncontradaLancaExcecao() {
        ManutencaoMaquinaDTO novosDados = new ManutencaoMaquinaDTO();
        novosDados.setTipo("não importa");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.atualizarManutencao(999999L, novosDados));
        assertTrue(ex.getMessage().contains("Manutenção não encontrada"));
    }

    @Test
    void deletarManutencaoRemoveRegistro() {
        MaquinaDTO maquina = criarMaquina("Máquina Manutenção Delete", "TESTE-MANUT-DEL");
        ManutencaoMaquinaDTO dto = new ManutencaoMaquinaDTO();
        dto.setTipo("Preventiva");
        ManutencaoMaquinaDTO criada = maquinaService.criarManutencao(maquina.getId(), dto);

        maquinaService.deletarManutencao(criada.getId());

        assertTrue(manutencaoRepository.findById(criada.getId()).isEmpty());
    }

    // ---- Agendamentos ----

    @Test
    void criarAgendamentoComMaquinaExistentePersisteEAssociaMaquina() {
        MaquinaDTO maquina = criarMaquina("Máquina Agendamento", "TESTE-AGEND-1");
        AgendamentoMaquinaDTO dto = new AgendamentoMaquinaDTO();
        dto.setUsuario("agendador.teste");
        dto.setDataInicio(LocalDateTime.now());
        dto.setConfirmado(true);

        AgendamentoMaquinaDTO criada = maquinaService.criarAgendamento(maquina.getId(), dto);

        assertNotNull(criada.getId());
        assertEquals(maquina.getId(), criada.getMaquinaId());
        assertTrue(criada.isConfirmado());
    }

    @Test
    void criarAgendamentoComMaquinaInexistenteLancaExcecao() {
        AgendamentoMaquinaDTO dto = new AgendamentoMaquinaDTO();
        dto.setUsuario("agendador.teste");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.criarAgendamento(999999L, dto));
        assertTrue(ex.getMessage().contains("Máquina não encontrada"));
    }

    @Test
    void listarAgendamentosRetornaApenasDaMaquinaCorreta() {
        MaquinaDTO maquinaA = criarMaquina("Máquina Agendamento A", "TESTE-AGEND-A");
        MaquinaDTO maquinaB = criarMaquina("Máquina Agendamento B", "TESTE-AGEND-B");

        AgendamentoMaquinaDTO agendamentoA = new AgendamentoMaquinaDTO();
        agendamentoA.setUsuario("usuarioAgendaA");
        maquinaService.criarAgendamento(maquinaA.getId(), agendamentoA);

        AgendamentoMaquinaDTO agendamentoB = new AgendamentoMaquinaDTO();
        agendamentoB.setUsuario("usuarioAgendaB");
        maquinaService.criarAgendamento(maquinaB.getId(), agendamentoB);

        List<AgendamentoMaquinaDTO> agendamentosDeA = maquinaService.listarAgendamentos(maquinaA.getId());

        assertEquals(1, agendamentosDeA.size());
        assertEquals("usuarioAgendaA", agendamentosDeA.get(0).getUsuario());
    }

    @Test
    void atualizarAgendamentoEncontradoAtualizaCampos() {
        MaquinaDTO maquina = criarMaquina("Máquina Agendamento Update", "TESTE-AGEND-UPD");
        AgendamentoMaquinaDTO original = new AgendamentoMaquinaDTO();
        original.setUsuario("usuario.original");
        AgendamentoMaquinaDTO criada = maquinaService.criarAgendamento(maquina.getId(), original);

        AgendamentoMaquinaDTO novosDados = new AgendamentoMaquinaDTO();
        novosDados.setUsuario("usuario.atualizado");
        novosDados.setConfirmado(true);

        AgendamentoMaquinaDTO atualizada = maquinaService.atualizarAgendamento(criada.getId(), novosDados);

        assertEquals("usuario.atualizado", atualizada.getUsuario());
        assertTrue(atualizada.isConfirmado());
    }

    @Test
    void atualizarAgendamentoNaoEncontradoLancaExcecao() {
        AgendamentoMaquinaDTO novosDados = new AgendamentoMaquinaDTO();
        novosDados.setUsuario("não importa");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> maquinaService.atualizarAgendamento(999999L, novosDados));
        assertTrue(ex.getMessage().contains("Agendamento não encontrado"));
    }

    @Test
    void deletarAgendamentoRemoveRegistro() {
        MaquinaDTO maquina = criarMaquina("Máquina Agendamento Delete", "TESTE-AGEND-DEL");
        AgendamentoMaquinaDTO dto = new AgendamentoMaquinaDTO();
        dto.setUsuario("usuario.delete");
        AgendamentoMaquinaDTO criada = maquinaService.criarAgendamento(maquina.getId(), dto);

        maquinaService.deletarAgendamento(criada.getId());

        assertTrue(agendamentoRepository.findById(criada.getId()).isEmpty());
    }
}
