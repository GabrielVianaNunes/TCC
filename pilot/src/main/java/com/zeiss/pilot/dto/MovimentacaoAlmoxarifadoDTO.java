package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.MovimentacaoAlmoxarifado;
import java.time.LocalDateTime;

import com.zeiss.pilot.validation.Nome;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class MovimentacaoAlmoxarifadoDTO {

    private Long id;

    @NotNull(message = "Item é obrigatório.")
    private Long itemId;

    @NotBlank(message = "Tipo é obrigatório.")
    @Pattern(regexp = "entrada|saida", message = "Tipo deve ser entrada ou saida.")
    private String tipo;

    @Min(value = 1, message = "Quantidade deve ser no mínimo 1.")
    private int quantidade;

    @NotBlank(message = "Responsável é obrigatório.")
    @Nome
    private String responsavel;

    private String motivo;
    private LocalDateTime data;

    public MovimentacaoAlmoxarifadoDTO() {}

    public static MovimentacaoAlmoxarifadoDTO fromEntity(MovimentacaoAlmoxarifado e) {
        MovimentacaoAlmoxarifadoDTO dto = new MovimentacaoAlmoxarifadoDTO();
        dto.setId(e.getId());
        dto.setItemId(e.getItem() != null ? e.getItem().getId() : null);
        dto.setTipo(e.getTipo());
        dto.setQuantidade(e.getQuantidade());
        dto.setResponsavel(e.getResponsavel());
        dto.setMotivo(e.getMotivo());
        dto.setData(e.getData());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }
}
