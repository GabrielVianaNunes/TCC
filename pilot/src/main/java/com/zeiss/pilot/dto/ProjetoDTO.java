package com.zeiss.pilot.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProjetoDTO {

    private Long id;
    private String nomeProjeto;
    private String objetivo;
    private String atividades;
    private Long responsavelId;
    private String responsavelNome;
    private String prioridade;
    private BigDecimal custoAnualPrevisto;
    private BigDecimal retornoPrevisto;
    private String status;
    private String observacao;
    private LocalDate previsaoInicio;
    private LocalDate previsaoTermino;
    private LocalDate dataRealFinalizacao;

    public ProjetoDTO() {}

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeProjeto() {
        return nomeProjeto;
    }

    public void setNomeProjeto(String nomeProjeto) {
        this.nomeProjeto = nomeProjeto;
    }

    public String getObjetivo() {
        return objetivo;
    }

    public void setObjetivo(String objetivo) {
        this.objetivo = objetivo;
    }

    public String getAtividades() {
        return atividades;
    }

    public void setAtividades(String atividades) {
        this.atividades = atividades;
    }

    public Long getResponsavelId() {
        return responsavelId;
    }

    public void setResponsavelId(Long responsavelId) {
        this.responsavelId = responsavelId;
    }

    public String getResponsavelNome() {
        return responsavelNome;
    }

    public void setResponsavelNome(String responsavelNome) {
        this.responsavelNome = responsavelNome;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public BigDecimal getCustoAnualPrevisto() {
        return custoAnualPrevisto;
    }

    public void setCustoAnualPrevisto(BigDecimal custoAnualPrevisto) {
        this.custoAnualPrevisto = custoAnualPrevisto;
    }

    public BigDecimal getRetornoPrevisto() {
        return retornoPrevisto;
    }

    public void setRetornoPrevisto(BigDecimal retornoPrevisto) {
        this.retornoPrevisto = retornoPrevisto;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDate getPrevisaoInicio() {
        return previsaoInicio;
    }

    public void setPrevisaoInicio(LocalDate previsaoInicio) {
        this.previsaoInicio = previsaoInicio;
    }

    public LocalDate getPrevisaoTermino() {
        return previsaoTermino;
    }

    public void setPrevisaoTermino(LocalDate previsaoTermino) {
        this.previsaoTermino = previsaoTermino;
    }

    public LocalDate getDataRealFinalizacao() {
        return dataRealFinalizacao;
    }

    public void setDataRealFinalizacao(LocalDate dataRealFinalizacao) {
        this.dataRealFinalizacao = dataRealFinalizacao;
    }
}
