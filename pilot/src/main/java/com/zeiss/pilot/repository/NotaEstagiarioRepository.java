package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.NotaEstagiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotaEstagiarioRepository extends JpaRepository<NotaEstagiario, Long> {
    List<NotaEstagiario> findByEstagiariaId(Long estagiariaId);
}
