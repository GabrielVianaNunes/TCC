package com.zeiss.pilot.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.VisitaTecnicaDTO;
import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.entity.VisitaTecnica;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.UsuarioRepository;
import com.zeiss.pilot.repository.VisitaTecnicaRepository;

@Service
public class VisitaTecnicaService {

    private static final Set<String> CARGOS_PERMITIDOS = Set.of("GESTOR", "TECNICO");
    private static final String EMPRESA_INTERNA = "CEM SENAI Zeiss";

    private final VisitaTecnicaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public VisitaTecnicaService(VisitaTecnicaRepository repository, UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<VisitaTecnica> listarVisitas() {
        return repository.findAll();
    }

    public Optional<VisitaTecnica> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public VisitaTecnicaDTO criarVisita(VisitaTecnicaDTO dto) {
        VisitaTecnica entidade = montarEntidade(new VisitaTecnica(), dto);
        return VisitaTecnicaDTO.fromEntity(repository.save(entidade));
    }

    public VisitaTecnicaDTO atualizarVisita(Long id, VisitaTecnicaDTO dto) {
        VisitaTecnica existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visita técnica não encontrada: " + id));
        VisitaTecnica entidade = montarEntidade(existente, dto);
        return VisitaTecnicaDTO.fromEntity(repository.save(entidade));
    }

    private VisitaTecnica montarEntidade(VisitaTecnica entidade, VisitaTecnicaDTO dto) {
        if (dto.getResponsavelId() == null) {
            throw new IllegalArgumentException("responsavelId é obrigatório.");
        }
        Usuario responsavel = usuarioRepository.findById(dto.getResponsavelId())
                .orElseThrow(() -> new RuntimeException("Usuário responsável não encontrado: " + dto.getResponsavelId()));
        if (!CARGOS_PERMITIDOS.contains(responsavel.getCargo())) {
            throw new IllegalArgumentException("Usuário responsável deve ter cargo Gestor ou Técnico.");
        }

        boolean interna = Boolean.TRUE.equals(dto.getVisitaInterna());
        Cliente cliente = null;
        if (!interna) {
            if (dto.getClienteId() == null) {
                throw new IllegalArgumentException("clienteId é obrigatório para visita a cliente.");
            }
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));
        }

        entidade.setResponsavelUsuario(responsavel);
        entidade.setResponsavel(responsavel.getNome());
        entidade.setClienteEntidade(cliente);
        entidade.setEmpresaInstituicao(interna ? EMPRESA_INTERNA : cliente.getNome());
        entidade.setDataSolicitada(dto.getDataSolicitada());
        entidade.setDataAgendada(dto.getDataAgendada());
        entidade.setVisitaRealizada(dto.getVisitaRealizada());
        entidade.setQuantidadeVisitantes(dto.getQuantidadeVisitantes());
        entidade.setLocalVisita(dto.getLocalVisita());
        entidade.setTelefones(dto.getTelefones());
        entidade.setObservacao(dto.getObservacao());
        return entidade;
    }

    public void deletarVisita(Long id) {
        repository.deleteById(id);
    }
}
