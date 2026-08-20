package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.Estagiario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstagiarioRepository extends JpaRepository<Estagiario, Long> {
    List<Estagiario> findByAtivoTrue();
    Optional<Estagiario> findByUsuarioId(Long usuarioId);
}
