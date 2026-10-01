package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.Evento;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class EventoDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private LocalDate data;

    @NotBlank(message = "Horário é obrigatório.")
    private String horario;

    private String local;

    // Autopreenchido pelo service a partir de responsavelId — mantido só
    // para exibir texto legado de registros anteriores a este vínculo.
    private String responsavel;

    private Long responsavelId;

    private Integer numeroParticipantes;
    private Integer numeroConvidados;
    private String observacao;

    public EventoDTO() {}

    public static EventoDTO fromEntity(Evento e) {
        EventoDTO dto = new EventoDTO();
        dto.setId(e.getId());
        dto.setTitulo(e.getNome());
        dto.setDescricao(e.getDescricao());
        dto.setData(e.getDataEvento());
        dto.setHorario(e.getHorario());
        dto.setLocal(e.getLocal());
        dto.setResponsavel(e.getResponsavel());
        dto.setResponsavelId(e.getResponsavelUsuario() != null ? e.getResponsavelUsuario().getId() : null);
        dto.setNumeroParticipantes(e.getNumeroParticipantes());
        dto.setNumeroConvidados(e.getNumeroConvidados());
        dto.setObservacao(e.getObservacao());
        return dto;
    }

    public Evento toEntity() {
        Evento e = new Evento();
        e.setNome(this.titulo != null ? this.titulo : "");
        e.setTipo("Geral");
        e.setDataEvento(this.data != null ? this.data : LocalDate.now());
        e.setDescricao(this.descricao);
        e.setHorario(this.horario);
        e.setLocal(this.local);
        e.setNumeroParticipantes(this.numeroParticipantes);
        e.setNumeroConvidados(this.numeroConvidados != null ? this.numeroConvidados : 0);
        e.setNumeroPresentes(this.numeroParticipantes != null ? this.numeroParticipantes : 0);
        e.setObservacao(this.observacao);
        return e;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public Integer getNumeroParticipantes() { return numeroParticipantes; }
    public void setNumeroParticipantes(Integer numeroParticipantes) { this.numeroParticipantes = numeroParticipantes; }
    public Integer getNumeroConvidados() { return numeroConvidados; }
    public void setNumeroConvidados(Integer numeroConvidados) { this.numeroConvidados = numeroConvidados; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
