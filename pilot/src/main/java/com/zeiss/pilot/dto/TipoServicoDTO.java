package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.TipoServico;

public class TipoServicoDTO {

    private Long id;
    private String categoria;
    private String descricao;

    public TipoServicoDTO() {}

    public static TipoServicoDTO fromEntity(TipoServico t) {
        TipoServicoDTO dto = new TipoServicoDTO();
        dto.setId(t.getId());
        dto.setCategoria(t.getCategoria());
        dto.setDescricao(t.getDescricao());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
