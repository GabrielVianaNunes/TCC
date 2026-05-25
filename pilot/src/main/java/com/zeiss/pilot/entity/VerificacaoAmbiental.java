package com.zeiss.pilot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "verificacoes_ambientais")
public class VerificacaoAmbiental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String responsavel;
    private String periodo;
    private Double temperatura;
    private Boolean tempConforme;
    private Double umidade;
    private Boolean umidConforme;
    private String arCondicionado;

    @Column(length = 1000)
    private String naoConformidade;

    private String maquinasDesligadas;
    private Boolean prismoUso;
    private String dataHora;

    public VerificacaoAmbiental() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }
    public Double getTemperatura() { return temperatura; }
    public void setTemperatura(Double temperatura) { this.temperatura = temperatura; }
    public Boolean getTempConforme() { return tempConforme; }
    public void setTempConforme(Boolean tempConforme) { this.tempConforme = tempConforme; }
    public Double getUmidade() { return umidade; }
    public void setUmidade(Double umidade) { this.umidade = umidade; }
    public Boolean getUmidConforme() { return umidConforme; }
    public void setUmidConforme(Boolean umidConforme) { this.umidConforme = umidConforme; }
    public String getArCondicionado() { return arCondicionado; }
    public void setArCondicionado(String arCondicionado) { this.arCondicionado = arCondicionado; }
    public String getNaoConformidade() { return naoConformidade; }
    public void setNaoConformidade(String naoConformidade) { this.naoConformidade = naoConformidade; }
    public String getMaquinasDesligadas() { return maquinasDesligadas; }
    public void setMaquinasDesligadas(String maquinasDesligadas) { this.maquinasDesligadas = maquinasDesligadas; }
    public Boolean getPrismoUso() { return prismoUso; }
    public void setPrismoUso(Boolean prismoUso) { this.prismoUso = prismoUso; }
    public String getDataHora() { return dataHora; }
    public void setDataHora(String dataHora) { this.dataHora = dataHora; }
}
