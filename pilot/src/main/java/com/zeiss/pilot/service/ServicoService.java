package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.RelatorioMensalDTO;
import com.zeiss.pilot.dto.ServicoDTO;
import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.entity.Servico;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.ServicoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final ClienteRepository clienteRepository;

    public ServicoService(ServicoRepository servicoRepository, ClienteRepository clienteRepository) {
        this.servicoRepository = servicoRepository;
        this.clienteRepository = clienteRepository;
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
        if (dto.getClienteId() == null) {
            throw new IllegalArgumentException("clienteId é obrigatório para criar uma Ordem de Serviço.");
        }
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        Servico entity = dto.toEntity();
        entity.setClienteEntidade(cliente);
        entity.setCliente(cliente.getNome());
        entity.setCodigoOs(gerarProximoCodigoOs());
        return ServicoDTO.fromEntity(servicoRepository.save(entity));
    }

    private String gerarProximoCodigoOs() {
        String prefixo = "OS-" + LocalDate.now().getYear() + "-";
        int proximaSequencia = servicoRepository.buscarMaiorCodigoOsComPrefixo(prefixo)
                .map(codigo -> Integer.parseInt(codigo.substring(codigo.length() - 4)) + 1)
                .orElse(1);
        return String.format("%s%04d", prefixo, proximaSequencia);
    }

    public ServicoDTO atualizarServico(Long id, ServicoDTO dto) {
        Servico existente = servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado: " + id));
        if (dto.getClienteId() == null) {
            throw new IllegalArgumentException("clienteId é obrigatório ao atualizar uma Ordem de Serviço.");
        }
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.getClienteId()));

        Servico entity = dto.toEntity();
        entity.setId(id);
        entity.setClienteEntidade(cliente);
        entity.setCliente(cliente.getNome());
        entity.setCodigoOs(existente.getCodigoOs());
        return ServicoDTO.fromEntity(servicoRepository.save(entity));
    }

    public List<RelatorioMensalDTO> obterRelatorioMensal() {
        return servicoRepository.calcularArrecadacaoMensal();
    }

    public void excluirServico(Long id) {
        servicoRepository.deleteById(id);
    }
}
