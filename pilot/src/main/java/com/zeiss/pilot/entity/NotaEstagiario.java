package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "notas_estagiarios")
public class NotaEstagiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long estagiariaId;
    private Long servicoId;
    private int nota;

    @Column(length = 2000)
    private String comentario;

    private String avaliadorNome;
    private LocalDate data;

    public NotaEstagiario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEstagiariaId() { return estagiariaId; }
    public void setEstagiariaId(Long estagiariaId) { this.estagiariaId = estagiariaId; }
    public Long getServicoId() { return servicoId; }
    public void setServicoId(Long servicoId) { this.servicoId = servicoId; }
    public int getNota() { return nota; }
    public void setNota(int nota) { this.nota = nota; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public String getAvaliadorNome() { return avaliadorNome; }
    public void setAvaliadorNome(String avaliadorNome) { this.avaliadorNome = avaliadorNome; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}
