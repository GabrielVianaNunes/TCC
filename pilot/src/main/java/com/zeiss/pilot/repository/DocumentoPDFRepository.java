package com.zeiss.pilot.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.zeiss.pilot.entity.DocumentoPDF;

public interface DocumentoPDFRepository extends JpaRepository<DocumentoPDF, Long> {

    List<DocumentoPDF> findByUsuarioId(Long usuarioId);

    Page<DocumentoPDF> findByUsuarioIdAndStatusIgnoreCaseContainingAndNomeArquivoIgnoreCaseContaining(
            Long usuarioId, String status, String nomeArquivo, Pageable pageable
    );
}
