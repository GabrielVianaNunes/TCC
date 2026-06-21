package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.MovimentacaoAlmoxarifado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoAlmoxarifadoRepository extends JpaRepository<MovimentacaoAlmoxarifado, Long> {
    List<MovimentacaoAlmoxarifado> findByItemId(Long itemId);
}
