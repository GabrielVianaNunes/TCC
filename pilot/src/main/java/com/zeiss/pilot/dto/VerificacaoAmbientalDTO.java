package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.VerificacaoAmbiental;

public class VerificacaoAmbientalDTO {

    private Long id;
    private String responsavel;
    private String periodo;
    private Double temperatura;
    private Boolean tempConforme;
    private Double umidade;
    private Boolean umidConforme;
    private String arCondicionado;
    private String naoConformidade;
    private String maquinasDesligadas;
    private Boolean prismoUso;
    private String dataHora;

    public VerificacaoAmbientalDTO() {}

    public static VerificacaoAmbientalDTO fromEntity(VerificacaoAmbiental e) {
        VerificacaoAmbientalDTO dto = new VerificacaoAmbientalDTO();
        dto.setId(e.getId());
        dto.setResponsavel(e.getResponsavel());
        dto.setPeriodo(e.getPeriodo());
        dto.setTemperatura(e.getTemperatura());
        dto.setTempConforme(e.getTempConforme());
        dto.setUmidade(e.getUmidade());
        dto.setUmidConforme(e.getUmidConforme());
        dto.setArCondicionado(e.getArCondicionado());
        dto.setNaoConformidade(e.getNaoConformidade());
        dto.setMaquinasDesligadas(e.getMaquinasDesligadas());
        dto.setPrismoUso(e.getPrismoUso());
        dto.setDataHora(e.getDataHora());
        return dto;
    }

    public VerificacaoAmbiental toEntity() {
        VerificacaoAmbiental e = new VerificacaoAmbiental();
        e.setResponsavel(this.responsavel);
        e.setPeriodo(this.periodo);
        e.setTemperatura(this.temperatura);
        e.setTempConforme(this.tempConforme);
        e.setUmidade(this.umidade);
        e.setUmidConforme(this.umidConforme);
        e.setArCondicionado(this.arCondicionado);
        e.setNaoConformidade(this.naoConformidade);
        e.setMaquinasDesligadas(this.maquinasDesligadas);
        e.setPrismoUso(this.prismoUso);
        e.setDataHora(this.dataHora);
        return e;
    }

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
