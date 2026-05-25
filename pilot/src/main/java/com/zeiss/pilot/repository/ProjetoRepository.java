package com.zeiss.pilot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zeiss.pilot.entity.Projeto;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
}
