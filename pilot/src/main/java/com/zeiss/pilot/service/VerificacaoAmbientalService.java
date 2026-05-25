package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.VerificacaoAmbientalDTO;
import com.zeiss.pilot.entity.VerificacaoAmbiental;
import com.zeiss.pilot.repository.VerificacaoAmbientalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VerificacaoAmbientalService {

    @Autowired
    private VerificacaoAmbientalRepository repository;

    public List<VerificacaoAmbientalDTO> listar() {
        return repository.findAll().stream()
                .map(VerificacaoAmbientalDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public VerificacaoAmbientalDTO salvar(VerificacaoAmbientalDTO dto) {
        VerificacaoAmbiental saved = repository.save(dto.toEntity());
        return VerificacaoAmbientalDTO.fromEntity(saved);
    }
}
