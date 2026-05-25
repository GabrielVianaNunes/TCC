package com.zeiss.pilot.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zeiss.pilot.entity.DocumentoPDF;

public interface DocumentoPDFRepository extends JpaRepository<DocumentoPDF, Long> {

    List<DocumentoPDF> findByUsuarioId(Long usuarioId);

    Page<DocumentoPDF> findByUsuarioIdAndStatusIgnoreCaseContainingAndNomeArquivoIgnoreCaseContaining(
            Long usuarioId, String status, String nomeArquivo, Pageable pageable
    );

    @Query(
    value = """
        SELECT d.*
        FROM documento_pdf d
        WHERE d.subpasta_id = :subpastaId
        AND (:status IS NULL OR LOWER(TRIM(d.status)) = LOWER(TRIM(CAST(:status AS TEXT))))
        AND (:nome   IS NULL OR d.nome_arquivo ILIKE ('%' || CAST(:nome AS TEXT) || '%'))
        """,
    countQuery = """
        SELECT COUNT(*)
        FROM documento_pdf d
        WHERE d.subpasta_id = :subpastaId
        AND (:status IS NULL OR LOWER(TRIM(d.status)) = LOWER(TRIM(CAST(:status AS TEXT))))
        AND (:nome   IS NULL OR d.nome_arquivo ILIKE ('%' || CAST(:nome AS TEXT) || '%'))
        """,
    nativeQuery = true
    )
    Page<DocumentoPDF> findBySubpastaComFiltro(
        @Param("subpastaId") Long subpastaId,
        @Param("status") String status,
        @Param("nome") String nome,
        Pageable pageable
    );


    // (Opcional) útil para validações/listagens simples
    Page<DocumentoPDF> findBySubpasta_Id(Long subpastaId, Pageable pageable);
}
