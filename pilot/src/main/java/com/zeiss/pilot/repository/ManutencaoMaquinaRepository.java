package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.ManutencaoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManutencaoMaquinaRepository extends JpaRepository<ManutencaoMaquina, Long> {
    List<ManutencaoMaquina> findByMaquinaId(Long maquinaId);
}
