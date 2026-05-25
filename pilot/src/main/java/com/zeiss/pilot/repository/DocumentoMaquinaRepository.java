package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.DocumentoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentoMaquinaRepository extends JpaRepository<DocumentoMaquina, Long> {
    List<DocumentoMaquina> findByMaquinaIdOrderByDataUploadDesc(Long maquinaId);
}
