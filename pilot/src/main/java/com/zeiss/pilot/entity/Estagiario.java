package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "estagiarios")
public class Estagiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String area;
    private String turno;
    private String orientador;
    private LocalDate inicioEstagio;
    private String email;
    private boolean ativo = true;

    public Estagiario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }
    public String getOrientador() { return orientador; }
    public void setOrientador(String orientador) { this.orientador = orientador; }
    public LocalDate getInicioEstagio() { return inicioEstagio; }
    public void setInicioEstagio(LocalDate inicioEstagio) { this.inicioEstagio = inicioEstagio; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
