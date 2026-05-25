package com.zeiss.pilot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.EditalDTO;
import com.zeiss.pilot.entity.Edital;
import com.zeiss.pilot.repository.EditalRepository;

@Service
public class EditalService {

    private final EditalRepository editalRepository;

    public EditalService(EditalRepository editalRepository) {
        this.editalRepository = editalRepository;
    }

    public List<EditalDTO> listarTodos() {
        return editalRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public EditalDTO buscarPorId(Long id) {
        return editalRepository.findById(id)
                .map(this::converterParaDTO)
                .orElse(null);
    }

    public EditalDTO criarEdital(EditalDTO editalDTO) {
        Edital edital = converterParaEntidade(editalDTO);
        Edital editalSalvo = editalRepository.save(edital);
        return converterParaDTO(editalSalvo);
    }

    public EditalDTO atualizarEdital(Long id, EditalDTO editalDTO) {
        return editalRepository.findById(id)
                .map(editalExistente -> {
                    atualizarEntidade(editalExistente, editalDTO);
                    Edital editalAtualizado = editalRepository.save(editalExistente);
                    return converterParaDTO(editalAtualizado);
                })
                .orElseThrow(() -> new RuntimeException("Edital não encontrado com ID: " + id));
    }

    public void excluirEdital(Long id) {
        if (!editalRepository.existsById(id)) {
            throw new RuntimeException("Edital não encontrado com ID: " + id);
        }
        editalRepository.deleteById(id);
    }

    private EditalDTO converterParaDTO(Edital edital) {
        EditalDTO dto = new EditalDTO();
        dto.setId(edital.getId());
        dto.setNomeEdital(edital.getNomeEdital());
        dto.setInstituicaoFornecedora(edital.getInstituicaoFornecedora());
        dto.setInstituicaoParceira(edital.getInstituicaoParceira());
        dto.setStatus(edital.getStatus());
        dto.setValor(edital.getValor());
        dto.setObservacao(edital.getObservacao());
        return dto;
    }

    private Edital converterParaEntidade(EditalDTO dto) {
        Edital edital = new Edital();
        edital.setNomeEdital(dto.getNomeEdital());
        edital.setInstituicaoFornecedora(dto.getInstituicaoFornecedora());
        edital.setInstituicaoParceira(dto.getInstituicaoParceira());
        edital.setStatus(dto.getStatus());
        edital.setValor(dto.getValor());
        edital.setObservacao(dto.getObservacao());
        return edital;
    }

    private void atualizarEntidade(Edital edital, EditalDTO dto) {
        edital.setNomeEdital(dto.getNomeEdital());
        edital.setInstituicaoFornecedora(dto.getInstituicaoFornecedora());
        edital.setInstituicaoParceira(dto.getInstituicaoParceira());
        edital.setStatus(dto.getStatus());
        edital.setValor(dto.getValor());
        edital.setObservacao(dto.getObservacao());
    }
}