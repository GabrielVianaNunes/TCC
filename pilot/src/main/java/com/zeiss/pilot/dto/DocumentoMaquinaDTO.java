package com.zeiss.pilot.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DocumentoMaquinaDTO {

    private Long id;
    private Long maquinaId;
    private String nomeArquivo;
    private String tipoDocumento;
    private LocalDateTime dataUpload;
    private LocalDate dataExpiracao;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMaquinaId() { return maquinaId; }
    public void setMaquinaId(Long maquinaId) { this.maquinaId = maquinaId; }

    public String getNomeArquivo() { return nomeArquivo; }
    public void setNomeArquivo(String nomeArquivo) { this.nomeArquivo = nomeArquivo; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public LocalDateTime getDataUpload() { return dataUpload; }
    public void setDataUpload(LocalDateTime dataUpload) { this.dataUpload = dataUpload; }

    public LocalDate getDataExpiracao() { return dataExpiracao; }
    public void setDataExpiracao(LocalDate dataExpiracao) { this.dataExpiracao = dataExpiracao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
