package com.zeiss.pilot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "maquinas")
public class Maquina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String modelo;
    private String tipoMedida;
    private String volumeMedicao;
    private String fabricante;
    private Integer anoInstalacao;
    private String patrimonioId;
    private String status;
    private boolean ligada = false;
    private String usuarioAtual;

    @Column(length = 1000)
    private String observacao;

    public Maquina() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getTipoMedida() { return tipoMedida; }
    public void setTipoMedida(String tipoMedida) { this.tipoMedida = tipoMedida; }
    public String getVolumeMedicao() { return volumeMedicao; }
    public void setVolumeMedicao(String volumeMedicao) { this.volumeMedicao = volumeMedicao; }
    public String getFabricante() { return fabricante; }
    public void setFabricante(String fabricante) { this.fabricante = fabricante; }
    public Integer getAnoInstalacao() { return anoInstalacao; }
    public void setAnoInstalacao(Integer anoInstalacao) { this.anoInstalacao = anoInstalacao; }
    public String getPatrimonioId() { return patrimonioId; }
    public void setPatrimonioId(String patrimonioId) { this.patrimonioId = patrimonioId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isLigada() { return ligada; }
    public void setLigada(boolean ligada) { this.ligada = ligada; }
    public String getUsuarioAtual() { return usuarioAtual; }
    public void setUsuarioAtual(String usuarioAtual) { this.usuarioAtual = usuarioAtual; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
