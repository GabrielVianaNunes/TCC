package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.zeiss.pilot.dto.EventoDTO;
import com.zeiss.pilot.entity.Evento;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.EventoRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

class EventoServiceTest {

    private final EventoRepository eventoRepository = mock(EventoRepository.class);
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final EventoService service = new EventoService(eventoRepository, usuarioRepository);

    private static Evento evento(int convidados, int presentes) {
        Evento e = new Evento();
        e.setDataEvento(LocalDate.of(2026, 3, 10));
        e.setNumeroConvidados(convidados);
        e.setNumeroPresentes(presentes);
        return e;
    }

    @Test
    void adesaoMediaUsaPresentesSobreConvidadosEArredondaUmaCasa() {
        when(eventoRepository.findAll()).thenReturn(List.of(evento(3, 1), evento(3, 2)));

        // (33,33% + 66,67%) / 2 = 50,0 ; um único evento 1/3 = 33,3
        assertEquals(50.0, service.getRelatoriosEventos().getAdesaoMedia());
        when(eventoRepository.findAll()).thenReturn(List.of(evento(3, 1)));
        assertEquals(33.3, service.getRelatoriosEventos().getAdesaoMedia());
    }

    @Test
    void eventoSemConvidadosFicaForaDaMediaDeAdesao() {
        when(eventoRepository.findAll()).thenReturn(List.of(evento(0, 0), evento(10, 5)));

        assertEquals(50.0, service.getRelatoriosEventos().getAdesaoMedia());
    }

    @Test
    void createEventoRejeitaMaisParticipantesQueConvidados() {
        EventoDTO dto = new EventoDTO();
        dto.setNumeroConvidados(5);
        dto.setNumeroParticipantes(6);

        assertThrows(IllegalArgumentException.class, () -> service.createEvento(dto));
        verify(eventoRepository, never()).save(any());
    }

    @Test
    void createEventoRejeitaValoresNegativos() {
        EventoDTO dto = new EventoDTO();
        dto.setNumeroConvidados(-1);

        assertThrows(IllegalArgumentException.class, () -> service.createEvento(dto));
    }

    @Test
    void updateEventoRejeitaMaisParticipantesQueConvidadosSemGravar() {
        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento(5, 3)));
        EventoDTO dto = new EventoDTO();
        dto.setNumeroConvidados(2);
        dto.setNumeroParticipantes(4);

        assertThrows(IllegalArgumentException.class, () -> service.updateEvento(1L, dto));
        verify(eventoRepository, never()).save(any());
    }

    @Test
    void createEventoPersisteConvidadosEParticipantes() {
        Usuario gestor = mock(Usuario.class);
        when(gestor.getCargo()).thenReturn("GESTOR");
        when(gestor.getNome()).thenReturn("Gestor");
        when(usuarioRepository.findById(9L)).thenReturn(Optional.of(gestor));
        when(eventoRepository.save(any(Evento.class))).thenAnswer(i -> i.getArgument(0));
        EventoDTO dto = new EventoDTO();
        dto.setResponsavelId(9L);
        dto.setNumeroConvidados(40);
        dto.setNumeroParticipantes(28);

        EventoDTO salvo = service.createEvento(dto);

        assertEquals(40, salvo.getNumeroConvidados());
        assertEquals(28, salvo.getNumeroParticipantes());
    }
}
