package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.Estagiario;
import java.time.LocalDate;

public class EstagiarioDTO {

    private Long id;
    private String nome;
    private String area;
    private String turno;
    private String orientador;
    private LocalDate inicioEstagio;
    private String email;
    private boolean ativo;

    public EstagiarioDTO() {}

    public static EstagiarioDTO fromEntity(Estagiario e) {
        EstagiarioDTO dto = new EstagiarioDTO();
        dto.setId(e.getId());
        dto.setNome(e.getNome());
        dto.setArea(e.getArea());
        dto.setTurno(e.getTurno());
        dto.setOrientador(e.getOrientador());
        dto.setInicioEstagio(e.getInicioEstagio());
        dto.setEmail(e.getEmail());
        dto.setAtivo(e.isAtivo());
        return dto;
    }

    public Estagiario toEntity() {
        Estagiario e = new Estagiario();
        e.setNome(this.nome);
        e.setArea(this.area);
        e.setTurno(this.turno);
        e.setOrientador(this.orientador);
        e.setInicioEstagio(this.inicioEstagio);
        e.setEmail(this.email);
        e.setAtivo(this.ativo);
        return e;
    }

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
