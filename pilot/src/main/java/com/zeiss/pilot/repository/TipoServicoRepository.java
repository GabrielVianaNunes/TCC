package com.zeiss.pilot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zeiss.pilot.entity.TipoServico;

public interface TipoServicoRepository extends JpaRepository<TipoServico, Long> {
}
