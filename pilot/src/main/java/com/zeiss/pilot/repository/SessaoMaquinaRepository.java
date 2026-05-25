package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.SessaoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessaoMaquinaRepository extends JpaRepository<SessaoMaquina, Long> {
    List<SessaoMaquina> findByMaquinaId(Long maquinaId);
}
