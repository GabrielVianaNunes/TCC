package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.KanbanCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KanbanCardRepository extends JpaRepository<KanbanCard, Long> {
    List<KanbanCard> findByEstagiariaId(Long estagiariaId);
}
