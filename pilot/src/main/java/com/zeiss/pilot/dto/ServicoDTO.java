package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.Servico;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ServicoDTO {

    private Long id;
    private String codigoOs;
    private String cliente;
    private String cpfOuCnpj;
    private String endereco;
    private String solicitacao;
    private int quantidade;
    private String status;
    private String tecnicoResponsavel;
    private BigDecimal valor;
    private LocalDate dataCriacao;
    private LocalDate dataPrevista;
    private LocalDate dataRealizada;
    private String observacao;

    public ServicoDTO() {}

    public static ServicoDTO fromEntity(Servico s) {
        ServicoDTO dto = new ServicoDTO();
        dto.setId(s.getId());
        dto.setCodigoOs(s.getCodigoOs());
        dto.setCliente(s.getCliente());
        dto.setCpfOuCnpj(s.getCpfOuCnpj());
        dto.setEndereco(s.getEndereco());
        dto.setSolicitacao(s.getSolicitacao());
        dto.setQuantidade(s.getQuantidade());
        dto.setStatus(s.getStatus());
        dto.setTecnicoResponsavel(s.getTecnicoResponsavel());
        dto.setValor(s.getValor());
        dto.setDataCriacao(s.getDataCriacao());
        dto.setDataPrevista(s.getDataPrevista());
        dto.setDataRealizada(s.getDataRealizada());
        dto.setObservacao(s.getObservacao());
        return dto;
    }

    // codigoOs não é copiado aqui de propósito — é sempre gerado pelo servidor em ServicoService.criarServico.
    public Servico toEntity() {
        Servico s = new Servico();
        s.setCliente(this.cliente);
        s.setCpfOuCnpj(this.cpfOuCnpj);
        s.setEndereco(this.endereco);
        s.setSolicitacao(this.solicitacao);
        s.setQuantidade(this.quantidade);
        s.setStatus(this.status);
        s.setTecnicoResponsavel(this.tecnicoResponsavel);
        s.setValor(this.valor);
        s.setDataCriacao(this.dataCriacao != null ? this.dataCriacao : LocalDate.now());
        s.setDataPrevista(this.dataPrevista);
        s.setDataRealizada(this.dataRealizada);
        s.setObservacao(this.observacao != null && !this.observacao.trim().isEmpty() ? this.observacao : null);
        return s;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigoOs() { return codigoOs; }
    public void setCodigoOs(String codigoOs) { this.codigoOs = codigoOs; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getCpfOuCnpj() { return cpfOuCnpj; }
    public void setCpfOuCnpj(String cpfOuCnpj) { this.cpfOuCnpj = cpfOuCnpj; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getSolicitacao() { return solicitacao; }
    public void setSolicitacao(String solicitacao) { this.solicitacao = solicitacao; }

    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTecnicoResponsavel() { return tecnicoResponsavel; }
    public void setTecnicoResponsavel(String tecnicoResponsavel) { this.tecnicoResponsavel = tecnicoResponsavel; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDate getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDate dataCriacao) { this.dataCriacao = dataCriacao; }

    public LocalDate getDataPrevista() { return dataPrevista; }
    public void setDataPrevista(LocalDate dataPrevista) { this.dataPrevista = dataPrevista; }

    public LocalDate getDataRealizada() { return dataRealizada; }
    public void setDataRealizada(LocalDate dataRealizada) { this.dataRealizada = dataRealizada; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
