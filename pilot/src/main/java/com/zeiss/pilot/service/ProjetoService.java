package com.zeiss.pilot.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.ProjetoDTO;
import com.zeiss.pilot.entity.Projeto;
import com.zeiss.pilot.repository.ProjetoRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

@Service
public class ProjetoService {

    private final ProjetoRepository projetoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProjetoService(ProjetoRepository projetoRepository, UsuarioRepository usuarioRepository) {
        this.projetoRepository = projetoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public ProjetoDTO criarProjeto(ProjetoDTO dto) {
        Projeto projeto = new Projeto();
        projeto.setNomeProjeto(dto.getNomeProjeto());
        projeto.setObjetivo(dto.getObjetivo());
        projeto.setAtividades(dto.getAtividades());
        if (dto.getResponsavelId() != null) {
            usuarioRepository.findById(dto.getResponsavelId()).ifPresent(projeto::setResponsavel);
        }
        projeto.setPrioridade(dto.getPrioridade());
        projeto.setCustoAnualPrevisto(dto.getCustoAnualPrevisto());
        projeto.setRetornoPrevisto(dto.getRetornoPrevisto());
        projeto.setStatus(dto.getStatus());
        projeto.setObservacao(dto.getObservacao());
        projeto.setPrevisaoInicio(dto.getPrevisaoInicio());
        projeto.setPrevisaoTermino(dto.getPrevisaoTermino());
        projeto.setDataRealFinalizacao(dto.getDataRealFinalizacao());
        return toDTO(projetoRepository.save(projeto));
    }    

    public List<ProjetoDTO> listarProjetos() {
        return projetoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProjetoDTO> buscarPorId(Long id) {
        return projetoRepository.findById(id).map(this::toDTO);
    }

    public boolean excluirProjeto(Long id) {
        if (projetoRepository.existsById(id)) {
            projetoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public ProjetoDTO atualizarProjeto(Long id, ProjetoDTO dto) {
        return projetoRepository.findById(id).map(projeto -> {
            projeto.setNomeProjeto(dto.getNomeProjeto());
            projeto.setObjetivo(dto.getObjetivo());
            projeto.setAtividades(dto.getAtividades());
            if (dto.getResponsavelId() != null) {
                usuarioRepository.findById(dto.getResponsavelId()).ifPresent(projeto::setResponsavel);
            } else {
                projeto.setResponsavel(null);
            }
            projeto.setPrioridade(dto.getPrioridade());
            projeto.setCustoAnualPrevisto(dto.getCustoAnualPrevisto());
            projeto.setRetornoPrevisto(dto.getRetornoPrevisto());
            projeto.setStatus(dto.getStatus());
            projeto.setObservacao(dto.getObservacao());
            projeto.setPrevisaoInicio(dto.getPrevisaoInicio());
            projeto.setPrevisaoTermino(dto.getPrevisaoTermino());
            projeto.setDataRealFinalizacao(dto.getDataRealFinalizacao());
            return toDTO(projetoRepository.save(projeto));
        }).orElse(null);
    }    

    private ProjetoDTO toDTO(Projeto projeto) {
        ProjetoDTO dto = new ProjetoDTO();
        dto.setId(projeto.getId());
        dto.setNomeProjeto(projeto.getNomeProjeto());
        dto.setObjetivo(projeto.getObjetivo());
        dto.setAtividades(projeto.getAtividades());
        dto.setResponsavelId(projeto.getResponsavel() != null ? projeto.getResponsavel().getId() : null);
        dto.setResponsavelNome(projeto.getResponsavel() != null ? projeto.getResponsavel().getNome() : null);
        dto.setPrioridade(projeto.getPrioridade());
        dto.setCustoAnualPrevisto(projeto.getCustoAnualPrevisto());
        dto.setRetornoPrevisto(projeto.getRetornoPrevisto());
        dto.setStatus(projeto.getStatus());
        dto.setObservacao(projeto.getObservacao());
        dto.setPrevisaoInicio(projeto.getPrevisaoInicio());
        dto.setPrevisaoTermino(projeto.getPrevisaoTermino());
        dto.setDataRealFinalizacao(projeto.getDataRealFinalizacao());
        return dto;
    }
}
