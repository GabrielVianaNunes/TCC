package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.AgendamentoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgendamentoMaquinaRepository extends JpaRepository<AgendamentoMaquina, Long> {
    List<AgendamentoMaquina> findByMaquinaId(Long maquinaId);
}
