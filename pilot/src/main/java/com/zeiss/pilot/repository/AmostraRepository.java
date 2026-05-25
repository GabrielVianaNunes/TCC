package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.Amostra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface AmostraRepository extends JpaRepository<Amostra, Long> {

    @Query("SELECT a FROM Amostra a WHERE " +
           "(:query IS NULL OR :query = '' " +
           "   OR LOWER(a.cliente)    LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(a.descricao)  LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(COALESCE(a.servicoRef, '')) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR a.status = :status)")
    Page<Amostra> search(@Param("query") String query,
                         @Param("status") String status,
                         Pageable pageable);

    @Query("SELECT a FROM Amostra a WHERE " +
           "(:query IS NULL OR :query = '' " +
           "   OR LOWER(a.cliente)    LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(a.descricao)  LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(COALESCE(a.servicoRef, '')) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND a.status = 'Em custódia' AND a.dataDevPrevista <= :hoje")
    Page<Amostra> searchVencendo(@Param("query") String query,
                                  @Param("hoje") LocalDate hoje,
                                  Pageable pageable);

    long countByStatus(String status);

    long countByStatusAndDataDevPrevistaLessThanEqual(String status, LocalDate date);
}
