package com.zeiss.pilot.dto;

import java.math.BigDecimal;

public class ClienteReceitaDTO {
    private Long clienteId;
    private String nome;
    private BigDecimal receitaMes;
    private long qtdOsMes;
    private BigDecimal receitaAno;
    private long qtdOsAno;

    public ClienteReceitaDTO() {}

    public ClienteReceitaDTO(Long clienteId, String nome, BigDecimal receitaMes, long qtdOsMes, BigDecimal receitaAno, long qtdOsAno) {
        this.clienteId = clienteId;
        this.nome = nome;
        this.receitaMes = receitaMes;
        this.qtdOsMes = qtdOsMes;
        this.receitaAno = receitaAno;
        this.qtdOsAno = qtdOsAno;
    }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public BigDecimal getReceitaMes() { return receitaMes; }
    public void setReceitaMes(BigDecimal receitaMes) { this.receitaMes = receitaMes; }

    public long getQtdOsMes() { return qtdOsMes; }
    public void setQtdOsMes(long qtdOsMes) { this.qtdOsMes = qtdOsMes; }

    public BigDecimal getReceitaAno() { return receitaAno; }
    public void setReceitaAno(BigDecimal receitaAno) { this.receitaAno = receitaAno; }

    public long getQtdOsAno() { return qtdOsAno; }
    public void setQtdOsAno(long qtdOsAno) { this.qtdOsAno = qtdOsAno; }
}
