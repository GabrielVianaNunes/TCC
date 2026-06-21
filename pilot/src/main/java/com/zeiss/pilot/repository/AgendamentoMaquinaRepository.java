package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.AgendamentoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgendamentoMaquinaRepository extends JpaRepository<AgendamentoMaquina, Long> {
    List<AgendamentoMaquina> findByMaquinaId(Long maquinaId);
}
