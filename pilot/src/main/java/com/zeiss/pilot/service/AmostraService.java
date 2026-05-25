package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.AmostraDTO;
import com.zeiss.pilot.entity.Amostra;
import com.zeiss.pilot.repository.AmostraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class AmostraService {

    @Autowired
    private AmostraRepository repository;

    public Page<AmostraDTO> listarPaginado(int page, int size, String query, String status) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dataEntrada"));
        String q = (query  != null && !query.trim().isEmpty())  ? query.trim()  : null;
        String s = (status != null && !status.trim().isEmpty()) ? status.trim() : null;

        Page<Amostra> result = "Vencendo".equals(s)
                ? repository.searchVencendo(q, LocalDate.now(), pageable)
                : repository.search(q, s, pageable);

        return result.map(AmostraDTO::fromEntity);
    }

    public Map<String, Long> getKpis() {
        LocalDate hoje = LocalDate.now();
        return Map.of(
                "total",      repository.count(),
                "custodia",   repository.countByStatus("Em custódia"),
                "vencendo",   repository.countByStatusAndDataDevPrevistaLessThanEqual("Em custódia", hoje),
                "devolvidas", repository.countByStatus("Devolvida")
        );
    }

    public AmostraDTO buscarPorId(Long id) {
        Amostra a = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amostra não encontrada: " + id));
        return AmostraDTO.fromEntity(a);
    }

    public AmostraDTO salvar(AmostraDTO dto) {
        return AmostraDTO.fromEntity(repository.save(dto.toEntity()));
    }

    public AmostraDTO atualizar(Long id, AmostraDTO dto) {
        repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amostra não encontrada: " + id));
        Amostra entity = dto.toEntity();
        entity.setId(id);
        return AmostraDTO.fromEntity(repository.save(entity));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
