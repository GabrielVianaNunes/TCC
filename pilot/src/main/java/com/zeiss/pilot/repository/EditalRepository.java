package com.zeiss.pilot.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zeiss.pilot.entity.Edital;

@Repository
public interface EditalRepository extends JpaRepository<Edital, Long> {

    List<Edital> findByStatus(String status);

    List<Edital> findByInstituicaoFornecedora(String instituicaoFornecedora);

    List<Edital> findByValorGreaterThan(BigDecimal valor);

    List<Edital> findByNomeEditalContaining(String nomeEdital);

    List<Edital> findByInstituicaoParceira(String instituicaoParceira);
}