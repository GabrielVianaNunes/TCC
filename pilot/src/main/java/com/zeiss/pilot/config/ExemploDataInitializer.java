package com.zeiss.pilot.config;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.context.annotation.Configuration;

import com.zeiss.pilot.entity.Edital;
import com.zeiss.pilot.entity.Evento;
import com.zeiss.pilot.entity.Projeto;
import com.zeiss.pilot.repository.EditalRepository;
import com.zeiss.pilot.repository.EventoRepository;
import com.zeiss.pilot.repository.ProjetoRepository;

import jakarta.annotation.PostConstruct;

@Configuration
public class ExemploDataInitializer {

    private final ProjetoRepository projetoRepository;
    private final EventoRepository eventoRepository;
    private final EditalRepository editalRepository;

    public ExemploDataInitializer(ProjetoRepository projetoRepository,
                                   EventoRepository eventoRepository,
                                   EditalRepository editalRepository) {
        this.projetoRepository = projetoRepository;
        this.eventoRepository = eventoRepository;
        this.editalRepository = editalRepository;
    }

    @PostConstruct
    public void initExemplos() {
        seedProjeto();
        seedEvento();
        seedEdital();
    }

    private void seedProjeto() {
        if (projetoRepository.count() > 0) return;

        Projeto p = new Projeto();
        p.setNomeProjeto("Calibração de Precisão — Linha Automotiva");
        p.setObjetivo("Reduzir o tempo de calibração das máquinas de medição por coordenadas em 20%");
        p.setAtividades("Levantamento de processo, treinamento de equipe, implantação de checklist digital");
        p.setPrioridade("Alta");
        p.setCustoAnualPrevisto(new BigDecimal("45000.00"));
        p.setRetornoPrevisto(new BigDecimal("120000.00"));
        p.setStatus("Em andamento");
        p.setObservacao("Projeto de exemplo — pode ser removido ou editado a qualquer momento.");
        p.setPrevisaoInicio(LocalDate.now().minusMonths(1));
        p.setPrevisaoTermino(LocalDate.now().plusMonths(5));
        projetoRepository.save(p);
    }

    private void seedEvento() {
        if (eventoRepository.count() > 0) return;

        Evento e = new Evento();
        e.setNome("Semana de Metrologia SENAI Zeiss");
        e.setTipo("Workshop");
        e.setDataEvento(LocalDate.now().plusMonths(1));
        e.setNumeroConvidados(80);
        e.setNumeroPresentes(0);
        e.setDescricao("Evento de exemplo apresentando as capacidades do laboratório de metrologia.");
        e.setHorario("09:00");
        e.setLocal("Auditório CEM SENAI Zeiss");
        e.setResponsavel("Coordenação CEM");
        e.setNumeroParticipantes(0);
        e.setObservacao("Evento de exemplo — pode ser removido ou editado a qualquer momento.");
        eventoRepository.save(e);
    }

    private void seedEdital() {
        if (editalRepository.count() > 0) return;

        Edital ed = new Edital();
        ed.setNomeEdital("Edital de Fomento à Inovação em Metrologia 2026");
        ed.setInstituicaoFornecedora("FINEP");
        ed.setInstituicaoParceira("SENAI Zeiss");
        ed.setStatus("Em análise");
        ed.setValor(new BigDecimal("250000.00"));
        ed.setObservacao("Edital de exemplo — pode ser removido ou editado a qualquer momento.");
        editalRepository.save(ed);
    }
}
