package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.AmostraDTO;
import com.zeiss.pilot.entity.Amostra;
import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.AmostraRepository;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@Service
public class AmostraService {

    private static final Set<String> CARGOS_RECEBIDO_POR = Set.of("GESTOR", "TECNICO", "ESTAGIARIO");

    private final AmostraRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public AmostraService(AmostraRepository repository, UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

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
        Amostra entity = dto.toEntity();
        aplicarVinculos(entity, dto);
        return AmostraDTO.fromEntity(repository.save(entity));
    }

    public AmostraDTO atualizar(Long id, AmostraDTO dto) {
        repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Amostra não encontrada: " + id));
        Amostra entity = dto.toEntity();
        entity.setId(id);
        aplicarVinculos(entity, dto);
        return AmostraDTO.fromEntity(repository.save(entity));
    }

    private void aplicarVinculos(Amostra entity, AmostraDTO dto) {
        if (dto.getResponsavelId() == null) {
            throw new IllegalArgumentException("responsavelId é obrigatório.");
        }
        Usuario responsavel = usuarioRepository.findById(dto.getResponsavelId())
                .orElseThrow(() -> new RuntimeException("Usuário responsável não encontrado: " + dto.getResponsavelId()));
        if (responsavel.getCargo() == null || !CARGOS_RECEBIDO_POR.contains(responsavel.getCargo())) {
            throw new IllegalArgumentException("Usuário responsável deve ter cargo Gestor, Técnico ou Estagiário.");
        }

        if (dto.getClienteId() == null) {
            throw new IllegalArgumentException("clienteId é obrigatório.");
        }
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        entity.setResponsavelUsuario(responsavel);
        entity.setResponsavel(responsavel.getNome());
        entity.setClienteEntidade(cliente);
        entity.setCliente(cliente.getNome());
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
