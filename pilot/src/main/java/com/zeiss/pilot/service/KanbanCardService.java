package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.KanbanCardDTO;
import com.zeiss.pilot.entity.KanbanCard;
import com.zeiss.pilot.repository.KanbanCardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KanbanCardService {

    private final KanbanCardRepository repository;

    public KanbanCardService(KanbanCardRepository repository) {
        this.repository = repository;
    }

    public List<KanbanCardDTO> listar() {
        return repository.findAll().stream()
                .map(KanbanCardDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<KanbanCardDTO> listarPorEstagiaria(Long estagiariaId) {
        return repository.findByEstagiariaId(estagiariaId).stream()
                .map(KanbanCardDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public KanbanCardDTO salvar(KanbanCardDTO dto) {
        return KanbanCardDTO.fromEntity(repository.save(dto.toEntity()));
    }

    public KanbanCardDTO atualizar(Long id, KanbanCardDTO dto) {
        repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card não encontrado: " + id));
        KanbanCard entity = dto.toEntity();
        entity.setId(id);
        return KanbanCardDTO.fromEntity(repository.save(entity));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
