package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.NotaEstagiarioDTO;
import com.zeiss.pilot.entity.NotaEstagiario;
import com.zeiss.pilot.repository.NotaEstagiarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotaEstagiarioService {

    @Autowired
    private NotaEstagiarioRepository repository;

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
