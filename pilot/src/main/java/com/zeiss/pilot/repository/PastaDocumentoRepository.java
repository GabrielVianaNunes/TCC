package com.zeiss.pilot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zeiss.pilot.entity.PastaDocumento;

public interface PastaDocumentoRepository extends JpaRepository<PastaDocumento, Long> {
    List<PastaDocumento> findByPastaPaiId(Long pastaPaiId);
    List<PastaDocumento> findByPastaPaiIsNull(); 
    boolean existsByPastaPaiIdAndNome(Long pastaPaiId, String nome);
}
