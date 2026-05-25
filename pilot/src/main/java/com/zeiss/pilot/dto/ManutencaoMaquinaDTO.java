package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.ManutencaoMaquina;
import java.time.LocalDate;

public class ManutencaoMaquinaDTO {

    private Long id;
    private Long maquinaId;
    private String tipo;
    private String responsavel;
    private LocalDate data;
    private LocalDate proximaData;
    private String status;
    private String observacao;

    public ManutencaoMaquinaDTO() {}

    public static ManutencaoMaquinaDTO fromEntity(ManutencaoMaquina e) {
        ManutencaoMaquinaDTO dto = new ManutencaoMaquinaDTO();
        dto.setId(e.getId());
        dto.setMaquinaId(e.getMaquina() != null ? e.getMaquina().getId() : null);
        dto.setTipo(e.getTipo());
        dto.setResponsavel(e.getResponsavel());
        dto.setData(e.getData());
        dto.setProximaData(e.getProximaData());
        dto.setStatus(e.getStatus());
        dto.setObservacao(e.getObservacao());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMaquinaId() { return maquinaId; }
    public void setMaquinaId(Long maquinaId) { this.maquinaId = maquinaId; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public LocalDate getProximaData() { return proximaData; }
    public void setProximaData(LocalDate proximaData) { this.proximaData = proximaData; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
