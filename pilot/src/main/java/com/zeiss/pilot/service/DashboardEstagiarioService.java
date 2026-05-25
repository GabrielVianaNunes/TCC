package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.DashboardEstagiarioDTO;
import com.zeiss.pilot.dto.DashboardEstagiarioDTO.EstagiarioMetricasDTO;
import com.zeiss.pilot.dto.DashboardEstagiarioDTO.TotaisDTO;
import com.zeiss.pilot.entity.Estagiario;
import com.zeiss.pilot.entity.KanbanCard;
import com.zeiss.pilot.entity.NotaEstagiario;
import com.zeiss.pilot.repository.EstagiarioRepository;
import com.zeiss.pilot.repository.KanbanCardRepository;
import com.zeiss.pilot.repository.NotaEstagiarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardEstagiarioService {

    @Autowired
    private EstagiarioRepository estagiarioRepository;

    @Autowired
    private KanbanCardRepository kanbanRepository;

    @Autowired
    private NotaEstagiarioRepository notaRepository;

    public DashboardEstagiarioDTO getDashboard() {
        List<Estagiario> estagiarios = estagiarioRepository.findByAtivoTrue();

        int totalTarefas = 0;
        int totalConcluidas = 0;
        double somaNotas = 0;
        int countNotas = 0;

        List<EstagiarioMetricasDTO> metricas = new java.util.ArrayList<>();

        for (Estagiario e : estagiarios) {
            List<KanbanCard> cards = kanbanRepository.findByEstagiariaId(e.getId());
            List<NotaEstagiario> notas = notaRepository.findByEstagiariaId(e.getId());

            Map<String, Integer> porColuna = new HashMap<>();
            int vencidas = 0;
            for (KanbanCard c : cards) {
                porColuna.merge(c.getColuna(), 1, Integer::sum);
                if (c.getPrazo() != null && c.getPrazo().isBefore(LocalDate.now())
                        && !"concluido".equalsIgnoreCase(c.getColuna())) {
                    vencidas++;
                }
            }

            int concluidas = porColuna.getOrDefault("concluido", 0);
            int total = cards.size();
            double taxa = total > 0 ? (double) concluidas / total * 100 : 0;

            Double mediaNota = notas.isEmpty() ? null :
                    notas.stream().mapToInt(NotaEstagiario::getNota).average().orElse(0);

            totalTarefas += total;
            totalConcluidas += concluidas;
            somaNotas += notas.stream().mapToInt(NotaEstagiario::getNota).sum();
            countNotas += notas.size();

            EstagiarioMetricasDTO m = new EstagiarioMetricasDTO();
            m.setId(e.getId());
            m.setNome(e.getNome());
            m.setArea(e.getArea());
            m.setTurno(e.getTurno());
            m.setOrientador(e.getOrientador());
            m.setInicioEstagio(e.getInicioEstagio());
            m.setEmail(e.getEmail());
            m.setTotalCards(total);
            m.setCardsPorColuna(porColuna);
            m.setTaxaConclusao(taxa);
            m.setMediaNotas(mediaNota);
            m.setVencidas(vencidas);
            metricas.add(m);
        }

        TotaisDTO totais = new TotaisDTO();
        totais.setTotalEstagiarios(estagiarios.size());
        totais.setTotalTarefas(totalTarefas);
        totais.setTotalConcluidas(totalConcluidas);
        totais.setMediaGeralNotas(countNotas > 0 ? somaNotas / countNotas : null);

        DashboardEstagiarioDTO dto = new DashboardEstagiarioDTO();
        dto.setTotais(totais);
        dto.setEstagiarios(metricas);
        return dto;
    }
}
