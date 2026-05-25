package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.Estagiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstagiarioRepository extends JpaRepository<Estagiario, Long> {
    List<Estagiario> findByAtivoTrue();
}
