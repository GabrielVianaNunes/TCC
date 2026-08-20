package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.KanbanCard;
import java.time.LocalDate;
import java.util.List;

public class KanbanCardDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private Long estagiariaId;
    private Long usuarioId;
    private String usuarioNome;
    private String usuarioRole;
    private Long atribuidoPorId;
    private String atribuidoPorNome;
    private String coluna;
    private String prioridade;
    private LocalDate prazo;
    private List<String> tags;
    private String criadoPor;
    private LocalDate criadoEm;

    public KanbanCardDTO() {}

    public static KanbanCardDTO fromEntity(KanbanCard e) {
        KanbanCardDTO dto = new KanbanCardDTO();
        dto.setId(e.getId());
        dto.setTitulo(e.getTitulo());
        dto.setDescricao(e.getDescricao());
        dto.setEstagiariaId(e.getEstagiariaId());
        if (e.getUsuario() != null) {
            dto.setUsuarioId(e.getUsuario().getId());
            dto.setUsuarioNome(e.getUsuario().getNome());
            dto.setUsuarioRole(e.getUsuario().getRole());
        }
        if (e.getAtribuidoPor() != null) {
            dto.setAtribuidoPorId(e.getAtribuidoPor().getId());
            dto.setAtribuidoPorNome(e.getAtribuidoPor().getNome());
        }
        dto.setColuna(e.getColuna());
        dto.setPrioridade(e.getPrioridade());
        dto.setPrazo(e.getPrazo());
        dto.setTags(e.getTags());
        dto.setCriadoPor(e.getCriadoPor());
        dto.setCriadoEm(e.getCriadoEm());
        return dto;
    }

    // Observação: não seta usuario/atribuidoPor aqui (são objetos Usuario) —
    // o service resolve esses relacionamentos a partir de usuarioId, porque
    // aqui o DTO só tem o id, não a entidade completa.
    public KanbanCard toEntity() {
        KanbanCard e = new KanbanCard();
        e.setTitulo(this.titulo);
        e.setDescricao(this.descricao);
        e.setEstagiariaId(this.estagiariaId);
        e.setColuna(this.coluna);
        e.setPrioridade(this.prioridade);
        e.setPrazo(this.prazo);
        if (this.tags != null) e.setTags(this.tags);
        e.setCriadoPor(this.criadoPor);
        e.setCriadoEm(this.criadoEm);
        return e;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Long getEstagiariaId() { return estagiariaId; }
    public void setEstagiariaId(Long estagiariaId) { this.estagiariaId = estagiariaId; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    public String getUsuarioRole() { return usuarioRole; }
    public void setUsuarioRole(String usuarioRole) { this.usuarioRole = usuarioRole; }
    public Long getAtribuidoPorId() { return atribuidoPorId; }
    public void setAtribuidoPorId(Long atribuidoPorId) { this.atribuidoPorId = atribuidoPorId; }
    public String getAtribuidoPorNome() { return atribuidoPorNome; }
    public void setAtribuidoPorNome(String atribuidoPorNome) { this.atribuidoPorNome = atribuidoPorNome; }
    public String getColuna() { return coluna; }
    public void setColuna(String coluna) { this.coluna = coluna; }
    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }
    public LocalDate getPrazo() { return prazo; }
    public void setPrazo(LocalDate prazo) { this.prazo = prazo; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }
    public LocalDate getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDate criadoEm) { this.criadoEm = criadoEm; }
}
