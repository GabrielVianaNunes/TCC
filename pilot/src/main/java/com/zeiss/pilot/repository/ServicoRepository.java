package com.zeiss.pilot.repository;

import com.zeiss.pilot.dto.RelatorioMensalDTO;
import com.zeiss.pilot.entity.Servico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    @Query("SELECT s FROM Servico s WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(s.cliente) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(s.solicitacao) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(COALESCE(s.tecnicoResponsavel, '')) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR s.status = :status)")
    Page<Servico> search(@Param("query") String query, @Param("status") String status, Pageable pageable);

    @Query("SELECT new com.zeiss.pilot.dto.RelatorioMensalDTO(YEAR(s.dataCriacao), MONTH(s.dataCriacao), SUM(s.valor), COUNT(s)) " +
           "FROM Servico s GROUP BY YEAR(s.dataCriacao), MONTH(s.dataCriacao) ORDER BY YEAR(s.dataCriacao), MONTH(s.dataCriacao)")
    List<RelatorioMensalDTO> calcularArrecadacaoMensal();
}
