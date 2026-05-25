package com.zeiss.pilot.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "edital")
public class Edital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_edital", nullable = false)
    private String nomeEdital;

    @Column(name = "instituicao_fornecedora", nullable = false)
    private String instituicaoFornecedora;

    @Column(name = "instituicao_parceira")
    private String instituicaoParceira;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "observacao")
    private String observacao;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeEdital() {
        return nomeEdital;
    }

    public void setNomeEdital(String nomeEdital) {
        this.nomeEdital = nomeEdital;
    }

    public String getInstituicaoFornecedora() {
        return instituicaoFornecedora;
    }

    public void setInstituicaoFornecedora(String instituicaoFornecedora) {
        this.instituicaoFornecedora = instituicaoFornecedora;
    }

    public String getInstituicaoParceira() {
        return instituicaoParceira;
    }

    public void setInstituicaoParceira(String instituicaoParceira) {
        this.instituicaoParceira = instituicaoParceira;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    // toString, equals e hashCode
    @Override
    public String toString() {
        return "Edital{" +
                "id=" + id +
                ", nomeEdital='" + nomeEdital + '\'' +
                ", instituicaoFornecedora='" + instituicaoFornecedora + '\'' +
                ", instituicaoParceira='" + instituicaoParceira + '\'' +
                ", status='" + status + '\'' +
                ", valor=" + valor +
                ", observacao='" + observacao + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Edital edital = (Edital) o;
        return id.equals(edital.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}