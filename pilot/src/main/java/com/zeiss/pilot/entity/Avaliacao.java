package com.zeiss.pilot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "avaliacoes")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vinculo;
    private String realizouServico;

    @Column(length = 1000)
    private String descServico;

    private int nps;

    @Column(length = 2000)
    private String comentario;

    private String tipoComentario;
    private String data;

    public Avaliacao() {}

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
