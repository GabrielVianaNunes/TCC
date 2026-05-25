package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "manutencoes_maquina")
public class ManutencaoMaquina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id", nullable = false)
    private Maquina maquina;

    private String tipo;
    private String responsavel;
    private LocalDate data;
    private LocalDate proximaData;
    private String status;

    @Column(length = 1000)
    private String observacao;

    public ManutencaoMaquina() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Maquina getMaquina() { return maquina; }
    public void setMaquina(Maquina maquina) { this.maquina = maquina; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public LocalDate getProximaData() { return proximaData; }
    public void setProximaData(LocalDate proximaData) { this.proximaData = proximaData; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
