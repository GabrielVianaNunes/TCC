package com.zeiss.pilot.dto;

import java.math.BigDecimal;

public class RelatorioMensalDTO {
    private int ano;
    private int mes;
    private BigDecimal valorTotal;
    private long quantidadeServicos;

    public RelatorioMensalDTO(int ano, int mes, BigDecimal valorTotal, long quantidadeServicos) {
        this.ano = ano;
        this.mes = mes;
        this.valorTotal = valorTotal;
        this.quantidadeServicos = quantidadeServicos;
    }

    // Getters e Setters
    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public long getQuantidadeServicos() { return quantidadeServicos; }
    public void setQuantidadeServicos(long quantidadeServicos) { this.quantidadeServicos = quantidadeServicos; }
}
