package com.zeiss.pilot.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeiss.pilot.entity.Evento;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    
    // Buscar eventos por tipo
    List<Evento> findByTipo(String tipo);

    // Buscar eventos dentro de um período específico
    List<Evento> findByDataEventoBetween(LocalDate startDate, LocalDate endDate);
}
