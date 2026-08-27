package com.zeiss.pilot.dto;

import java.math.BigDecimal;

public class ClienteReceitaMensalDTO {
    private Long clienteId;
    private String nome;
    private int ano;
    private int mes;
    private BigDecimal receita;
    private long qtdOs;

    public ClienteReceitaMensalDTO(Long clienteId, String nome, int ano, int mes, BigDecimal receita, long qtdOs) {
        this.clienteId = clienteId;
        this.nome = nome;
        this.ano = ano;
        this.mes = mes;
        this.receita = receita;
        this.qtdOs = qtdOs;
    }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }

    public BigDecimal getReceita() { return receita; }
    public void setReceita(BigDecimal receita) { this.receita = receita; }

    public long getQtdOs() { return qtdOs; }
    public void setQtdOs(long qtdOs) { this.qtdOs = qtdOs; }
}
