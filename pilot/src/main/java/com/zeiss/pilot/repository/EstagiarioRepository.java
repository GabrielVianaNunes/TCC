package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.Estagiario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstagiarioRepository extends JpaRepository<Estagiario, Long> {
    List<Estagiario> findByAtivoTrue();
}
