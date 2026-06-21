package com.zeiss.pilot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.NotaEstagiarioDTO;
import com.zeiss.pilot.repository.NotaEstagiarioRepository;

@Service
public class NotaEstagiarioService {

    private final NotaEstagiarioRepository repository;

    public NotaEstagiarioService(NotaEstagiarioRepository repository) {
        this.repository = repository;
    }

    public List<NotaEstagiarioDTO> listar() {
        return repository.findAll().stream()
                .map(NotaEstagiarioDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotaEstagiarioDTO> listarPorEstagiaria(Long estagiariaId) {
        return repository.findByEstagiariaId(estagiariaId).stream()
                .map(NotaEstagiarioDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public NotaEstagiarioDTO salvar(NotaEstagiarioDTO dto) {
        return NotaEstagiarioDTO.fromEntity(repository.save(dto.toEntity()));
    }
}
