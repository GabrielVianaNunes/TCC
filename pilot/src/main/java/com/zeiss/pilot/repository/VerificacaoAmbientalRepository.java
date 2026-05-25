package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.VerificacaoAmbiental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificacaoAmbientalRepository extends JpaRepository<VerificacaoAmbiental, Long> {
}
