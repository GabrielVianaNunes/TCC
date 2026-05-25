package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.ItemAlmoxarifado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemAlmoxarifadoRepository extends JpaRepository<ItemAlmoxarifado, Long> {
}
