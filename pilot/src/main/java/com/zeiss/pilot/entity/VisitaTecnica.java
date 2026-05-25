package com.zeiss.pilot.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "visitas_tecnicas")
public class VisitaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String responsavel;
    private String empresaInstituicao;
    private LocalDate dataSolicitada;
    private LocalDate dataAgendada;
    private Boolean visitaRealizada;
    private Integer quantidadeVisitantes;
    private String localVisita;
    private String telefones;
    private String observacao;

    public VisitaTecnica() {}

    public VisitaTecnica(Long id, String responsavel, String empresaInstituicao, LocalDate dataSolicitada, 
                         LocalDate dataAgendada, Boolean visitaRealizada, Integer quantidadeVisitantes,
                         String localVisita, String telefones, String observacao) {
        this.id = id;
        this.responsavel = responsavel;
        this.empresaInstituicao = empresaInstituicao;
        this.dataSolicitada = dataSolicitada;
        this.dataAgendada = dataAgendada;
        this.visitaRealizada = visitaRealizada;
        this.quantidadeVisitantes = quantidadeVisitantes;
        this.localVisita = localVisita;
        this.telefones = telefones;
        this.observacao = observacao;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }

    public String getEmpresaInstituicao() { return empresaInstituicao; }
    public void setEmpresaInstituicao(String empresaInstituicao) { this.empresaInstituicao = empresaInstituicao; }

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
}