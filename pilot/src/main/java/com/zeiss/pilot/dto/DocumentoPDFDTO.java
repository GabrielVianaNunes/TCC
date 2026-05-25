package com.zeiss.pilot.dto;

import java.time.LocalDate;

public class DocumentoPDFDTO {
    private Long id;
    private String nomeArquivo;
    private String caminhoArquivo;
    private LocalDate dataExpiracao;
    private String status;

    private Long usuarioId;
    private String usuarioRole; // ✅ usado no front p/ verificar permissões (ADMIN/CLIENTE/STAKEHOLDER)

    private Long subpastaId;    // ✅ vínculo direto com subpasta
    private String nomeSubpasta;

    // Compatibilidade: pasta principal (pastaPai da subpasta)
    private Long pastaId;
    private String nomePasta;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeArquivo() { return nomeArquivo; }
    public void setNomeArquivo(String nomeArquivo) { this.nomeArquivo = nomeArquivo; }

    public String getCaminhoArquivo() { return caminhoArquivo; }
    public void setCaminhoArquivo(String caminhoArquivo) { this.caminhoArquivo = caminhoArquivo; }

    public LocalDate getDataExpiracao() { return dataExpiracao; }
    public void setDataExpiracao(LocalDate dataExpiracao) { this.dataExpiracao = dataExpiracao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioRole() { return usuarioRole; }
    public void setUsuarioRole(String usuarioRole) { this.usuarioRole = usuarioRole; }

    public Long getSubpastaId() { return subpastaId; }
    public void setSubpastaId(Long subpastaId) { this.subpastaId = subpastaId; }

    public String getNomeSubpasta() { return nomeSubpasta; }
    public void setNomeSubpasta(String nomeSubpasta) { this.nomeSubpasta = nomeSubpasta; }

    public Long getPastaId() { return pastaId; }
    public void setPastaId(Long pastaId) { this.pastaId = pastaId; }

    public String getNomePasta() { return nomePasta; }
    public void setNomePasta(String nomePasta) { this.nomePasta = nomePasta; }
}
