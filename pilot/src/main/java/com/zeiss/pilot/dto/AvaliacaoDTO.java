package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.Avaliacao;

public class AvaliacaoDTO {

    private Long id;
    private String vinculo;
    private String realizouServico;
    private String descServico;
    private int nps;
    private String comentario;
    private String tipoComentario;
    private String data;

    public AvaliacaoDTO() {}

    public static AvaliacaoDTO fromEntity(Avaliacao e) {
        AvaliacaoDTO dto = new AvaliacaoDTO();
        dto.setId(e.getId());
        dto.setVinculo(e.getVinculo());
        dto.setRealizouServico(e.getRealizouServico());
        dto.setDescServico(e.getDescServico());
        dto.setNps(e.getNps());
        dto.setComentario(e.getComentario());
        dto.setTipoComentario(e.getTipoComentario());
        dto.setData(e.getData());
        return dto;
    }

    public Avaliacao toEntity() {
        Avaliacao e = new Avaliacao();
        e.setVinculo(this.vinculo);
        e.setRealizouServico(this.realizouServico);
        e.setDescServico(this.descServico);
        e.setNps(this.nps);
        e.setComentario(this.comentario);
        e.setTipoComentario(this.tipoComentario);
        e.setData(this.data);
        return e;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVinculo() { return vinculo; }
    public void setVinculo(String vinculo) { this.vinculo = vinculo; }
    public String getRealizouServico() { return realizouServico; }
    public void setRealizouServico(String realizouServico) { this.realizouServico = realizouServico; }
    public String getDescServico() { return descServico; }
    public void setDescServico(String descServico) { this.descServico = descServico; }
    public int getNps() { return nps; }
    public void setNps(int nps) { this.nps = nps; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public String getTipoComentario() { return tipoComentario; }
    public void setTipoComentario(String tipoComentario) { this.tipoComentario = tipoComentario; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}
