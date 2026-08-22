package com.zeiss.pilot.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.zeiss.pilot.entity.Maquina;

@Entity
@Table(name = "servicos")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_os", nullable = false, unique = true, length = 20)
    private String codigoOs;

    @Column(nullable = false)
    private String cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente clienteEntidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id")
    private Maquina maquina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_servico_id")
    private TipoServico tipoServico;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String solicitacao;

    @Column(nullable = false)
    private int quantidade;

    @Column(nullable = false)
    private String status;

    private String tecnicoResponsavel;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate dataCriacao;

    private LocalDate dataPrevista;

    private LocalDate dataRealizada;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    public Servico() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigoOs() { return codigoOs; }
    public void setCodigoOs(String codigoOs) { this.codigoOs = codigoOs; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public Cliente getClienteEntidade() { return clienteEntidade; }
    public void setClienteEntidade(Cliente clienteEntidade) { this.clienteEntidade = clienteEntidade; }

    public Maquina getMaquina() { return maquina; }
    public void setMaquina(Maquina maquina) { this.maquina = maquina; }

    public TipoServico getTipoServico() { return tipoServico; }
    public void setTipoServico(TipoServico tipoServico) { this.tipoServico = tipoServico; }

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
