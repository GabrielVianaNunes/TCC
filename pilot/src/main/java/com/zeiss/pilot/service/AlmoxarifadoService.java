package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.ItemAlmoxarifadoDTO;
import com.zeiss.pilot.dto.MovimentacaoAlmoxarifadoDTO;
import com.zeiss.pilot.entity.ItemAlmoxarifado;
import com.zeiss.pilot.entity.MovimentacaoAlmoxarifado;
import com.zeiss.pilot.repository.ItemAlmoxarifadoRepository;
import com.zeiss.pilot.repository.MovimentacaoAlmoxarifadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlmoxarifadoService {

    @Autowired
    private ItemAlmoxarifadoRepository itemRepository;

    @Autowired
    private MovimentacaoAlmoxarifadoRepository movimentacaoRepository;

    public List<ItemAlmoxarifadoDTO> listarItens() {
        return itemRepository.findAll().stream()
                .map(ItemAlmoxarifadoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ItemAlmoxarifadoDTO salvarItem(ItemAlmoxarifadoDTO dto) {
        return ItemAlmoxarifadoDTO.fromEntity(itemRepository.save(dto.toEntity()));
    }

    public ItemAlmoxarifadoDTO atualizarItem(Long id, ItemAlmoxarifadoDTO dto) {
        ItemAlmoxarifado existing = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item não encontrado: " + id));
        existing.setNome(dto.getNome());
        existing.setCategoria(dto.getCategoria());
        existing.setUnidade(dto.getUnidade());
        existing.setEstoqueMinimo(dto.getEstoqueMinimo());
        existing.setLocalizacao(dto.getLocalizacao());
        existing.setObservacao(dto.getObservacao());
        return ItemAlmoxarifadoDTO.fromEntity(itemRepository.save(existing));
    }

    public void deletarItem(Long id) {
        itemRepository.deleteById(id);
    }

    public List<MovimentacaoAlmoxarifadoDTO> listarMovimentacoes() {
        return movimentacaoRepository.findAll().stream()
                .map(MovimentacaoAlmoxarifadoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MovimentacaoAlmoxarifadoDTO> listarMovimentacoesPorItem(Long itemId) {
        return movimentacaoRepository.findByItemId(itemId).stream()
                .map(MovimentacaoAlmoxarifadoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public MovimentacaoAlmoxarifadoDTO registrarMovimentacao(MovimentacaoAlmoxarifadoDTO dto) {
        ItemAlmoxarifado item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Item não encontrado: " + dto.getItemId()));
        int delta = "entrada".equalsIgnoreCase(dto.getTipo()) ? dto.getQuantidade() : -dto.getQuantidade();
        item.setQuantidadeAtual(Math.max(0, item.getQuantidadeAtual() + delta));
        itemRepository.save(item);

        MovimentacaoAlmoxarifado m = new MovimentacaoAlmoxarifado();
        m.setItem(item);
        m.setTipo(dto.getTipo());
        m.setQuantidade(dto.getQuantidade());
        m.setResponsavel(dto.getResponsavel());
        m.setMotivo(dto.getMotivo());
        m.setData(dto.getData() != null ? dto.getData() : java.time.LocalDateTime.now());
        return MovimentacaoAlmoxarifadoDTO.fromEntity(movimentacaoRepository.save(m));
    }
}
