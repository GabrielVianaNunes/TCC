package com.zeiss.pilot.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.VisitaTecnicaDTO;
import com.zeiss.pilot.entity.VisitaTecnica;
import com.zeiss.pilot.repository.VisitaTecnicaRepository;

@Service
public class VisitaTecnicaService {

    @Autowired
    private VisitaTecnicaRepository repository;

    public List<VisitaTecnica> listarVisitas() {
        return repository.findAll();
    }

    public VisitaTecnica salvarVisita(VisitaTecnica visita) {
        return repository.save(visita);
    }

    // ✅ Adicionado: Exclusão de visita técnica
    public void deletarVisita(Long id) {
        repository.deleteById(id);
    }

    // ✅ Adicional: Buscar por ID (para possível uso com DTO)
    public Optional<VisitaTecnica> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // ✅ Extra (opcional): salvar usando DTO diretamente
    public VisitaTecnicaDTO salvarVisitaDTO(VisitaTecnicaDTO dto) {
        VisitaTecnica entidade = dto.toEntity();
        VisitaTecnica salvo = repository.save(entidade);
        return VisitaTecnicaDTO.fromEntity(salvo);
    }
}