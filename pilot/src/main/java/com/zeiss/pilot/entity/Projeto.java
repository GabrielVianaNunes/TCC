package com.zeiss.pilot.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "projetos")
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_projeto", nullable = false)
    private String nomeProjeto;

    private String objetivo;

    private String atividades;

    @ManyToOne
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    private String prioridade;

    @Column(name = "custo_anual_previsto")
    private BigDecimal custoAnualPrevisto;

    @Column(name = "retorno_previsto")
    private BigDecimal retornoPrevisto;

    private String status;

    private String observacao;

    @Column(name = "previsao_inicio")
    private LocalDate previsaoInicio;

    @Column(name = "previsao_termino")
    private LocalDate previsaoTermino;

    @Column(name = "data_real_finalizacao")
    private LocalDate dataRealFinalizacao;

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

    public Usuario getResponsavel() {
        return responsavel;
    }

    public void setResponsavel(Usuario responsavel) {
        this.responsavel = responsavel;
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
