package com.zeiss.pilot.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.dto.ClienteReceitaDTO;
import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.exception.ClienteConflitoException;
import com.zeiss.pilot.repository.ClienteReceitaAgregado;
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

    /**
     * HashUtil.normalizarDocumento devolve "" tanto para null quanto para
     * qualquer string sem dígitos — sem essa checagem, um CPF/CNPJ em branco ou
     * inválido gera hash idêntico para todo cliente nessa condição, causando
     * falso-409 de duplicata para o segundo caso, ou violação NOT NULL crua do
     * banco (500) para o primeiro.
     */
    private String calcularHash(String cpfOuCnpj) {
        String documentoNormalizado = HashUtil.normalizarDocumento(cpfOuCnpj);
        if (documentoNormalizado.isBlank()) {
            throw new IllegalArgumentException("CPF/CNPJ é obrigatório.");
        }
        return HashUtil.sha256Hex(documentoNormalizado);
    }

    public List<ClienteReceitaDTO> obterRankingReceita() {
        LocalDate hoje = LocalDate.now();
        Map<Long, ClienteReceitaAgregado> porMes = indexarPorCliente(
                servicoRepository.calcularReceitaPorClienteNoMes(hoje.getYear(), hoje.getMonthValue()));
        Map<Long, ClienteReceitaAgregado> porAno = indexarPorCliente(
                servicoRepository.calcularReceitaPorClienteNoAno(hoje.getYear()));

        return clienteRepository.findAll().stream()
                .map(cliente -> {
                    ClienteReceitaAgregado mes = porMes.get(cliente.getId());
                    ClienteReceitaAgregado ano = porAno.get(cliente.getId());
                    return new ClienteReceitaDTO(
                            cliente.getId(),
                            cliente.getNome(),
                            mes != null ? mes.getReceita() : BigDecimal.ZERO,
                            mes != null ? mes.getQtd() : 0,
                            ano != null ? ano.getReceita() : BigDecimal.ZERO,
                            ano != null ? ano.getQtd() : 0);
                })
                .sorted((a, b) -> b.getReceitaAno().compareTo(a.getReceitaAno()))
                .toList();
    }

    private Map<Long, ClienteReceitaAgregado> indexarPorCliente(List<ClienteReceitaAgregado> agregados) {
        Map<Long, ClienteReceitaAgregado> mapa = new HashMap<>();
        for (ClienteReceitaAgregado a : agregados) {
            mapa.put(a.getClienteId(), a);
        }
        return mapa;
    }
}
