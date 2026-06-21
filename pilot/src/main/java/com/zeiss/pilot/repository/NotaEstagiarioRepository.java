package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.NotaEstagiario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotaEstagiarioRepository extends JpaRepository<NotaEstagiario, Long> {
    List<NotaEstagiario> findByEstagiariaId(Long estagiariaId);
}
