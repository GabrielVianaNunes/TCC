package com.zeiss.pilot.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.exception.ClienteConflitoException;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.ServicoRepository;
import com.zeiss.pilot.security.HashUtil;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;

    public ClienteService(ClienteRepository clienteRepository, ServicoRepository servicoRepository) {
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
    }

    public List<ClienteDTO> listar() {
        return clienteRepository.findAll().stream().map(ClienteDTO::fromEntity).toList();
    }

    public ClienteDTO buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .map(ClienteDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));
    }

    public ClienteDTO criar(ClienteDTO dto) {
        String hash = calcularHash(dto.getCpfOuCnpj());
        clienteRepository.findByCpfOuCnpjHash(hash).ifPresent(c -> {
            throw new ClienteConflitoException("Já existe um cliente cadastrado com este CPF/CNPJ.");
        });

        Cliente entity = dto.toEntity();
        entity.setCpfOuCnpjHash(hash);
        entity.setDataCadastro(LocalDate.now());
        return ClienteDTO.fromEntity(clienteRepository.save(entity));
    }

    public ClienteDTO atualizar(Long id, ClienteDTO dto) {
        Cliente existente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));

        String hash = calcularHash(dto.getCpfOuCnpj());
        clienteRepository.findByCpfOuCnpjHash(hash)
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new ClienteConflitoException("Já existe um cliente cadastrado com este CPF/CNPJ.");
                });

        existente.setNome(dto.getNome());
        existente.setCpfOuCnpj(dto.getCpfOuCnpj());
        existente.setCpfOuCnpjHash(hash);
        existente.setEndereco(dto.getEndereco());
        existente.setTelefone(dto.getTelefone());
        existente.setEmail(dto.getEmail());
        return ClienteDTO.fromEntity(clienteRepository.save(existente));
    }

    public void excluir(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado: " + id);
        }
        if (servicoRepository.existsByClienteEntidadeId(id)) {
            throw new ClienteConflitoException("Não é possível excluir um cliente com Ordens de Serviço vinculadas.");
        }
        clienteRepository.deleteById(id);
    }

    private String calcularHash(String cpfOuCnpj) {
        return HashUtil.sha256Hex(HashUtil.normalizarDocumento(cpfOuCnpj));
    }
}
