package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.AgendamentoMaquina;
import java.time.LocalDateTime;

public class AgendamentoMaquinaDTO {

    private Long id;
    private Long maquinaId;
    private String usuario;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private String motivo;
    private boolean confirmado;

    public AgendamentoMaquinaDTO() {}

    public static AgendamentoMaquinaDTO fromEntity(AgendamentoMaquina e) {
        AgendamentoMaquinaDTO dto = new AgendamentoMaquinaDTO();
        dto.setId(e.getId());
        dto.setMaquinaId(e.getMaquina() != null ? e.getMaquina().getId() : null);
        dto.setUsuario(e.getUsuario());
        dto.setDataInicio(e.getDataInicio());
        dto.setDataFim(e.getDataFim());
        dto.setMotivo(e.getMotivo());
        dto.setConfirmado(e.isConfirmado());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMaquinaId() { return maquinaId; }
    public void setMaquinaId(Long maquinaId) { this.maquinaId = maquinaId; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }
    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public boolean isConfirmado() { return confirmado; }
    public void setConfirmado(boolean confirmado) { this.confirmado = confirmado; }
}
