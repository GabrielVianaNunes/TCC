package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessoes_maquina")
public class SessaoMaquina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id", nullable = false)
    private Maquina maquina;

    @Column(nullable = false)
    private String usuario;

    private LocalDateTime dataLigada;
    private LocalDateTime dataDesligada;
    private Double horasUso;
    private String motivo;

    @Column(length = 1000)
    private String observacao;

    public SessaoMaquina() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Maquina getMaquina() { return maquina; }
    public void setMaquina(Maquina maquina) { this.maquina = maquina; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public LocalDateTime getDataLigada() { return dataLigada; }
    public void setDataLigada(LocalDateTime dataLigada) { this.dataLigada = dataLigada; }
    public LocalDateTime getDataDesligada() { return dataDesligada; }
    public void setDataDesligada(LocalDateTime dataDesligada) { this.dataDesligada = dataDesligada; }
    public Double getHorasUso() { return horasUso; }
    public void setHorasUso(Double horasUso) { this.horasUso = horasUso; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
