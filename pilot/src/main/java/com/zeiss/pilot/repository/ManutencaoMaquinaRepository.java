package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.ManutencaoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManutencaoMaquinaRepository extends JpaRepository<ManutencaoMaquina, Long> {
    List<ManutencaoMaquina> findByMaquinaId(Long maquinaId);
}
