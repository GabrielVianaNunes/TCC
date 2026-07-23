package com.zeiss.pilot.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DocumentoPDFDTO {
    private Long id;
    private String nomeArquivo;
    private String caminhoArquivo;
    private LocalDate dataExpiracao;
    private LocalDateTime dataUpload;
    private String status;

    private Long usuarioId;
    private String usuarioRole; // usado no front p/ verificar permissões (ADMIN/CLIENTE/STAKEHOLDER)

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeArquivo() { return nomeArquivo; }
    public void setNomeArquivo(String nomeArquivo) { this.nomeArquivo = nomeArquivo; }

    public String getCaminhoArquivo() { return caminhoArquivo; }
    public void setCaminhoArquivo(String caminhoArquivo) { this.caminhoArquivo = caminhoArquivo; }

    public LocalDate getDataExpiracao() { return dataExpiracao; }
    public void setDataExpiracao(LocalDate dataExpiracao) { this.dataExpiracao = dataExpiracao; }

    public LocalDateTime getDataUpload() { return dataUpload; }
    public void setDataUpload(LocalDateTime dataUpload) { this.dataUpload = dataUpload; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioRole() { return usuarioRole; }
    public void setUsuarioRole(String usuarioRole) { this.usuarioRole = usuarioRole; }
}
