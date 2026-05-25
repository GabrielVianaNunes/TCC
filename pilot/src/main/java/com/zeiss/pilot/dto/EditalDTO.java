package com.zeiss.pilot.dto;

import java.math.BigDecimal;

import com.zeiss.pilot.entity.Edital;

public class EditalDTO {

    private Long id;
    private String nomeEdital;
    private String instituicaoFornecedora;
    private String instituicaoParceira;
    private String status;
    private BigDecimal valor;
    private String observacao;

    // Construtor padrão (sem argumentos) - Necessário para o Jackson
    public EditalDTO() {
    }

    // Construtor com todos os campos
    public EditalDTO(Long id, String nomeEdital, String instituicaoFornecedora, String instituicaoParceira, String status, BigDecimal valor, String observacao) {
        this.id = id;
        this.nomeEdital = nomeEdital;
        this.instituicaoFornecedora = instituicaoFornecedora;
        this.instituicaoParceira = instituicaoParceira;
        this.status = status;
        this.valor = valor;
        this.observacao = observacao;
    }

    // Construtor que recebe uma entidade Edital
    public EditalDTO(Edital edital) {
        this.id = edital.getId();
        this.nomeEdital = edital.getNomeEdital();
        this.instituicaoFornecedora = edital.getInstituicaoFornecedora();
        this.instituicaoParceira = edital.getInstituicaoParceira();
        this.status = edital.getStatus();
        this.valor = edital.getValor();
        this.observacao = edital.getObservacao();
    }

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

    // Método toString para facilitar a visualização do objeto
    @Override
    public String toString() {
        return "EditalDTO{" +
                "id=" + id +
                ", nomeEdital='" + nomeEdital + '\'' +
                ", instituicaoFornecedora='" + instituicaoFornecedora + '\'' +
                ", instituicaoParceira='" + instituicaoParceira + '\'' +
                ", status='" + status + '\'' +
                ", valor=" + valor +
                ", observacao='" + observacao + '\'' +
                '}';
    }
}