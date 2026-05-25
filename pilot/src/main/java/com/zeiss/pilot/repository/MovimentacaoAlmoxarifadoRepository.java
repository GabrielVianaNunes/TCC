package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.MovimentacaoAlmoxarifado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoAlmoxarifadoRepository extends JpaRepository<MovimentacaoAlmoxarifado, Long> {
    List<MovimentacaoAlmoxarifado> findByItemId(Long itemId);
}
