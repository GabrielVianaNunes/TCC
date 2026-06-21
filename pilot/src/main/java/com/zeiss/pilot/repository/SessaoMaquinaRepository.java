package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.SessaoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessaoMaquinaRepository extends JpaRepository<SessaoMaquina, Long> {
    List<SessaoMaquina> findByMaquinaId(Long maquinaId);
}
