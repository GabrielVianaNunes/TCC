package com.zeiss.pilot.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.zeiss.pilot.entity.VisitaTecnica;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VisitaTecnicaDTO {

    private Long id;

    // Autopreenchido pelo service a partir de responsavelId — mantido só
    // para exibir texto legado de registros anteriores a este vínculo.
    private String responsavel;

    private Long responsavelId;

    // Autopreenchido pelo service: nome do Cliente vinculado, ou o nome
    // fixo do CEM quando visitaInterna=true.
    private String empresaInstituicao;

    private Long clienteId;

    private Boolean visitaInterna;

    @NotNull(message = "Data solicitada é obrigatória.")
    private LocalDate dataSolicitada;

    private LocalDate dataAgendada;

    @NotNull(message = "Visita realizada é obrigatória.")
    private Boolean visitaRealizada;

    @NotNull(message = "Quantidade de visitantes é obrigatória.")
    @Min(value = 1, message = "Quantidade de visitantes deve ser no mínimo 1.")
    private Integer quantidadeVisitantes;

    @NotBlank(message = "Local é obrigatório.")
    private String localVisita;

    @NotBlank(message = "Telefone é obrigatório.")
    private String telefones;

    private String observacao;
    private LocalDateTime createdAt;

    public VisitaTecnicaDTO() {}

    public static VisitaTecnicaDTO fromEntity(VisitaTecnica entity) {
        VisitaTecnicaDTO dto = new VisitaTecnicaDTO();
        dto.setId(entity.getId());
        dto.setResponsavel(entity.getResponsavel());
        dto.setResponsavelId(entity.getResponsavelUsuario() != null ? entity.getResponsavelUsuario().getId() : null);
        dto.setEmpresaInstituicao(entity.getEmpresaInstituicao());
        dto.setClienteId(entity.getClienteEntidade() != null ? entity.getClienteEntidade().getId() : null);
        dto.setDataSolicitada(entity.getDataSolicitada());
        dto.setDataAgendada(entity.getDataAgendada());
        dto.setVisitaRealizada(entity.getVisitaRealizada());
        dto.setQuantidadeVisitantes(entity.getQuantidadeVisitantes());
        dto.setLocalVisita(entity.getLocalVisita());
        dto.setTelefones(entity.getTelefones());
        dto.setObservacao(entity.getObservacao());
        dto.setCreatedAt(null); // createdAt não existe na entidade
        return dto;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }

    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }

    public String getEmpresaInstituicao() { return empresaInstituicao; }
    public void setEmpresaInstituicao(String empresaInstituicao) { this.empresaInstituicao = empresaInstituicao; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Boolean getVisitaInterna() { return visitaInterna; }
    public void setVisitaInterna(Boolean visitaInterna) { this.visitaInterna = visitaInterna; }

    public LocalDate getDataSolicitada() { return dataSolicitada; }
    public void setDataSolicitada(LocalDate dataSolicitada) { this.dataSolicitada = dataSolicitada; }

    public LocalDate getDataAgendada() { return dataAgendada; }
    public void setDataAgendada(LocalDate dataAgendada) { this.dataAgendada = dataAgendada; }

    public Boolean getVisitaRealizada() { return visitaRealizada; }
    public void setVisitaRealizada(Boolean visitaRealizada) { this.visitaRealizada = visitaRealizada; }

    public Integer getQuantidadeVisitantes() { return quantidadeVisitantes; }
    public void setQuantidadeVisitantes(Integer quantidadeVisitantes) { this.quantidadeVisitantes = quantidadeVisitantes; }

    public String getLocalVisita() { return localVisita; }
    public void setLocalVisita(String localVisita) { this.localVisita = localVisita; }

    public String getTelefones() { return telefones; }
    public void setTelefones(String telefones) { this.telefones = telefones; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
