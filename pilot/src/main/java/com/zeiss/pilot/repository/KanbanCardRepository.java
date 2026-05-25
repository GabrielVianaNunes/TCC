package com.zeiss.pilot.repository;

import com.zeiss.pilot.entity.KanbanCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanbanCardRepository extends JpaRepository<KanbanCard, Long> {
    List<KanbanCard> findByEstagiariaId(Long estagiariaId);
}
