package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.EstagiarioDTO;
import com.zeiss.pilot.entity.Estagiario;
import com.zeiss.pilot.repository.EstagiarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EstagiarioService {

    @Autowired
    private EstagiarioRepository repository;

    public List<EstagiarioDTO> listar() {
        return repository.findAll().stream()
                .map(EstagiarioDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<EstagiarioDTO> listarAtivos() {
        return repository.findByAtivoTrue().stream()
                .map(EstagiarioDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public EstagiarioDTO buscarPorId(Long id) {
        return EstagiarioDTO.fromEntity(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estagiário não encontrado: " + id)));
    }

    public EstagiarioDTO salvar(EstagiarioDTO dto) {
        return EstagiarioDTO.fromEntity(repository.save(dto.toEntity()));
    }

    public EstagiarioDTO atualizar(Long id, EstagiarioDTO dto) {
        repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estagiário não encontrado: " + id));
        Estagiario entity = dto.toEntity();
        entity.setId(id);
        return EstagiarioDTO.fromEntity(repository.save(entity));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
