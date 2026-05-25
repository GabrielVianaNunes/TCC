package com.zeiss.pilot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeiss.pilot.entity.VisitaTecnica;

@Repository
public interface VisitaTecnicaRepository extends JpaRepository<VisitaTecnica, Long> {
}