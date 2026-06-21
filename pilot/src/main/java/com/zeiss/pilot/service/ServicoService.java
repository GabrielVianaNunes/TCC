package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.RelatorioMensalDTO;
import com.zeiss.pilot.dto.ServicoDTO;
import com.zeiss.pilot.entity.Servico;
import com.zeiss.pilot.repository.ServicoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    public Page<ServicoDTO> listarPaginado(int page, int size, String query, String status) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dataCriacao"));
        return servicoRepository.search(
                query  != null && !query.trim().isEmpty()  ? query.trim()  : null,
                status != null && !status.trim().isEmpty() ? status.trim() : null,
                pageable
        ).map(ServicoDTO::fromEntity);
    }

    public ServicoDTO buscarPorId(Long id) {
        return servicoRepository.findById(id)
                .map(ServicoDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado: " + id));
    }

    public ServicoDTO criarServico(ServicoDTO dto) {
        return ServicoDTO.fromEntity(servicoRepository.save(dto.toEntity()));
    }

    public ServicoDTO atualizarServico(Long id, ServicoDTO dto) {
        servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado: " + id));
        Servico entity = dto.toEntity();
        entity.setId(id);
        return ServicoDTO.fromEntity(servicoRepository.save(entity));
    }

    public List<RelatorioMensalDTO> obterRelatorioMensal() {
        return servicoRepository.calcularArrecadacaoMensal();
    }

    public void excluirServico(Long id) {
        servicoRepository.deleteById(id);
    }
}
