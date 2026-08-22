package com.zeiss.pilot.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.TipoServicoDTO;
import com.zeiss.pilot.repository.TipoServicoRepository;

@Service
public class TipoServicoService {

    private final TipoServicoRepository tipoServicoRepository;

    public TipoServicoService(TipoServicoRepository tipoServicoRepository) {
        this.tipoServicoRepository = tipoServicoRepository;
    }

    public List<TipoServicoDTO> listar() {
        return tipoServicoRepository.findAll().stream().map(TipoServicoDTO::fromEntity).toList();
    }
}
