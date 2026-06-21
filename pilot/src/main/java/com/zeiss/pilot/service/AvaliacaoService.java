package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.AvaliacaoDTO;
import com.zeiss.pilot.entity.Avaliacao;
import com.zeiss.pilot.repository.AvaliacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository repository;

    public AvaliacaoService(AvaliacaoRepository repository) {
        this.repository = repository;
    }

    public List<AvaliacaoDTO> listar() {
        return repository.findAll().stream()
                .map(AvaliacaoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public AvaliacaoDTO salvar(AvaliacaoDTO dto) {
        Avaliacao saved = repository.save(dto.toEntity());
        return AvaliacaoDTO.fromEntity(saved);
    }
}
