package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.SessaoMaquina;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SessaoMaquinaDTO {

    private Long id;
    private Long maquinaId;

    @NotBlank(message = "Usuário responsável é obrigatório.")
    private String usuario;

    @NotNull(message = "Data/hora de ligação é obrigatória.")
    private LocalDateTime dataLigada;
    private LocalDateTime dataDesligada;
    private Double horasUso;
    private String motivo;
    private String observacao;

    public SessaoMaquinaDTO() {}

    public static SessaoMaquinaDTO fromEntity(SessaoMaquina e) {
        SessaoMaquinaDTO dto = new SessaoMaquinaDTO();
        dto.setId(e.getId());
        dto.setMaquinaId(e.getMaquina() != null ? e.getMaquina().getId() : null);
        dto.setUsuario(e.getUsuario());
        dto.setDataLigada(e.getDataLigada());
        dto.setDataDesligada(e.getDataDesligada());
        dto.setHorasUso(e.getHorasUso());
        dto.setMotivo(e.getMotivo());
        dto.setObservacao(e.getObservacao());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMaquinaId() { return maquinaId; }
    public void setMaquinaId(Long maquinaId) { this.maquinaId = maquinaId; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public LocalDateTime getDataLigada() { return dataLigada; }
    public void setDataLigada(LocalDateTime dataLigada) { this.dataLigada = dataLigada; }
    public LocalDateTime getDataDesligada() { return dataDesligada; }
    public void setDataDesligada(LocalDateTime dataDesligada) { this.dataDesligada = dataDesligada; }
    public Double getHorasUso() { return horasUso; }
    public void setHorasUso(Double horasUso) { this.horasUso = horasUso; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
