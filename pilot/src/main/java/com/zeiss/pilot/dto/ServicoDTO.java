package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.entity.Servico;
import com.zeiss.pilot.validation.Nome;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ServicoDTO {

    private Long id;
    private String codigoOs;
    private String cliente;
    private Long clienteId;
    private String clienteNome;
    private Long maquinaId;
    private String maquinaNome;
    private Long tipoServicoId;
    private String solicitacao;

    @Min(value = 1, message = "Quantidade deve ser no mínimo 1.")
    @Max(value = 100000, message = "Quantidade deve ser no máximo 100000.")
    private int quantidade;

    @NotBlank(message = "Status é obrigatório.")
    private String status;

    @NotBlank(message = "Técnico responsável é obrigatório.")
    @Nome
    private String tecnicoResponsavel;

    @NotNull(message = "Valor é obrigatório.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que zero.")
    private BigDecimal valor;

    private LocalDate dataCriacao;

    @NotNull(message = "Data prevista é obrigatória.")
    private LocalDate dataPrevista;

    private LocalDate dataRealizada;
    private String observacao;

    public ServicoDTO() {}

    public static ServicoDTO fromEntity(Servico s) {
        ServicoDTO dto = new ServicoDTO();
        dto.setId(s.getId());
        dto.setCodigoOs(s.getCodigoOs());
        dto.setCliente(s.getCliente());
        if (s.getClienteEntidade() != null) {
            Cliente c = s.getClienteEntidade();
            dto.setClienteId(c.getId());
            dto.setClienteNome(c.getNome());
        }
        if (s.getMaquina() != null) {
            dto.setMaquinaId(s.getMaquina().getId());
            dto.setMaquinaNome(s.getMaquina().getNome());
        }
        if (s.getTipoServico() != null) {
            dto.setTipoServicoId(s.getTipoServico().getId());
        }
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

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getClienteNome() { return clienteNome; }
    public void setClienteNome(String clienteNome) { this.clienteNome = clienteNome; }

    public Long getMaquinaId() { return maquinaId; }
    public void setMaquinaId(Long maquinaId) { this.maquinaId = maquinaId; }

    public String getMaquinaNome() { return maquinaNome; }
    public void setMaquinaNome(String maquinaNome) { this.maquinaNome = maquinaNome; }

    public Long getTipoServicoId() { return tipoServicoId; }
    public void setTipoServicoId(Long tipoServicoId) { this.tipoServicoId = tipoServicoId; }

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
