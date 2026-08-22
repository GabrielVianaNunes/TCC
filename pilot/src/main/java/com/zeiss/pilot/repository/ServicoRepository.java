package com.zeiss.pilot.repository;

import com.zeiss.pilot.dto.RelatorioMensalDTO;
import com.zeiss.pilot.entity.Servico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    @Query("SELECT MAX(s.codigoOs) FROM Servico s WHERE s.codigoOs LIKE CONCAT(:prefixo, '%')")
    Optional<String> buscarMaiorCodigoOsComPrefixo(@Param("prefixo") String prefixo);

    @Query("SELECT s FROM Servico s LEFT JOIN s.clienteEntidade c WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(COALESCE(c.nome, s.cliente)) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(s.solicitacao) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "   OR LOWER(COALESCE(s.tecnicoResponsavel, '')) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR s.status = :status)")
    Page<Servico> search(@Param("query") String query, @Param("status") String status, Pageable pageable);

    @Query("SELECT new com.zeiss.pilot.dto.RelatorioMensalDTO(YEAR(s.dataCriacao), MONTH(s.dataCriacao), SUM(s.valor), COUNT(s)) " +
           "FROM Servico s GROUP BY YEAR(s.dataCriacao), MONTH(s.dataCriacao) ORDER BY YEAR(s.dataCriacao), MONTH(s.dataCriacao)")
    List<RelatorioMensalDTO> calcularArrecadacaoMensal();

    boolean existsByClienteEntidadeId(Long clienteId);

    @Query("SELECT s.clienteEntidade.id as clienteId, COALESCE(SUM(s.valor), 0) as receita, COUNT(s) as qtd "
           + "FROM Servico s WHERE s.clienteEntidade IS NOT NULL "
           + "AND YEAR(s.dataCriacao) = :ano AND MONTH(s.dataCriacao) = :mes "
           + "GROUP BY s.clienteEntidade.id")
    List<ClienteReceitaAgregado> calcularReceitaPorClienteNoMes(@Param("ano") int ano, @Param("mes") int mes);

    @Query("SELECT s.clienteEntidade.id as clienteId, COALESCE(SUM(s.valor), 0) as receita, COUNT(s) as qtd "
           + "FROM Servico s WHERE s.clienteEntidade IS NOT NULL AND YEAR(s.dataCriacao) = :ano "
           + "GROUP BY s.clienteEntidade.id")
    List<ClienteReceitaAgregado> calcularReceitaPorClienteNoAno(@Param("ano") int ano);
}
