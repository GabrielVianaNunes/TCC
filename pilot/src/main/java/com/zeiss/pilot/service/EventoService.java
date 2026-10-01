package com.zeiss.pilot.service;

import java.time.Month;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.EventoDTO;
import com.zeiss.pilot.dto.EventoRelatorioDTO;
import com.zeiss.pilot.entity.Evento;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.EventoRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    public EventoService(EventoRepository eventoRepository, UsuarioRepository usuarioRepository) {
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<EventoDTO> getAllEventos() {
        return eventoRepository.findAll()
                               .stream()
                               .map(EventoDTO::fromEntity)
                               .collect(Collectors.toList());
    }

    public EventoDTO getEventoById(Long id) {
        return eventoRepository.findById(id)
                .map(EventoDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado com id: " + id));
    }

    public EventoDTO createEvento(EventoDTO eventoDTO) {
        validarPresencas(eventoDTO);
        Evento evento = eventoDTO.toEntity();
        aplicarResponsavel(evento, eventoDTO);
        evento = eventoRepository.save(evento);
        return EventoDTO.fromEntity(evento);
    }

    public EventoDTO updateEvento(Long id, EventoDTO eventoDTO) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado com id: " + id));

        validarPresencas(eventoDTO);
        if (eventoDTO.getTitulo() != null) evento.setNome(eventoDTO.getTitulo());
        if (eventoDTO.getData() != null)   evento.setDataEvento(eventoDTO.getData());
        evento.setDescricao(eventoDTO.getDescricao());
        evento.setHorario(eventoDTO.getHorario());
        evento.setLocal(eventoDTO.getLocal());
        aplicarResponsavel(evento, eventoDTO);
        evento.setNumeroParticipantes(eventoDTO.getNumeroParticipantes());
        evento.setNumeroConvidados(eventoDTO.getNumeroConvidados() != null ? eventoDTO.getNumeroConvidados() : 0);
        evento.setNumeroPresentes(eventoDTO.getNumeroParticipantes() != null ? eventoDTO.getNumeroParticipantes() : 0);
        evento.setObservacao(eventoDTO.getObservacao());

        evento = eventoRepository.save(evento);
        return EventoDTO.fromEntity(evento);
    }

    private void validarPresencas(EventoDTO dto) {
        if (dto.getNumeroConvidados() != null && dto.getNumeroConvidados() < 0
                || dto.getNumeroParticipantes() != null && dto.getNumeroParticipantes() < 0) {
            throw new IllegalArgumentException("Convidados e participantes não podem ser negativos.");
        }
        int convidados = dto.getNumeroConvidados() != null ? dto.getNumeroConvidados() : 0;
        int participantes = dto.getNumeroParticipantes() != null ? dto.getNumeroParticipantes() : 0;
        if (participantes > convidados) {
            throw new IllegalArgumentException("Nº de participantes não pode exceder o nº de convidados.");
        }
    }

    private void aplicarResponsavel(Evento evento, EventoDTO dto) {
        if (dto.getResponsavelId() == null) {
            throw new IllegalArgumentException("responsavelId é obrigatório.");
        }
        Usuario responsavel = usuarioRepository.findById(dto.getResponsavelId())
                .orElseThrow(() -> new RuntimeException("Usuário responsável não encontrado: " + dto.getResponsavelId()));
        if (!"GESTOR".equals(responsavel.getCargo())) {
            throw new IllegalArgumentException("Responsável do evento deve ter cargo Gestor.");
        }
        evento.setResponsavelUsuario(responsavel);
        evento.setResponsavel(responsavel.getNome());
    }

    public void deleteEvento(Long id) {
        eventoRepository.deleteById(id);
    }

    // Cálculo dos relatórios de eventos
    public EventoRelatorioDTO getRelatoriosEventos() {
        List<Evento> eventos = eventoRepository.findAll();

        long totalEventos = eventos.size();
        double adesaoMedia = eventos.stream()
                .filter(e -> e.getNumeroConvidados() > 0)
                .mapToDouble(e -> (double) e.getNumeroPresentes() / e.getNumeroConvidados() * 100)
                .average()
                .orElse(0.0);
        adesaoMedia = Math.round(adesaoMedia * 10.0) / 10.0;

        Map<String, Long> distribuicaoMensal = new HashMap<>();
        for (Month mes : Month.values()) {
            distribuicaoMensal.put(mes.toString(), 0L);
        }

        eventos.forEach(evento -> {
            if (evento.getDataEvento() == null) return;
            String mes = evento.getDataEvento().getMonth().toString();
            distribuicaoMensal.put(mes, distribuicaoMensal.getOrDefault(mes, 0L) + 1);
        });

        return new EventoRelatorioDTO(totalEventos, adesaoMedia, distribuicaoMensal);
    }
}
