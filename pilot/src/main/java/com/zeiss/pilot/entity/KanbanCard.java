package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "kanban_cards")
public class KanbanCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    private Long estagiariaId;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "atribuido_por_id")
    private Usuario atribuidoPor;

    private String coluna;
    private String prioridade;
    private LocalDate prazo;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "kanban_card_tags", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    private String criadoPor;
    private LocalDate criadoEm;

    public KanbanCard() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Long getEstagiariaId() { return estagiariaId; }
    public void setEstagiariaId(Long estagiariaId) { this.estagiariaId = estagiariaId; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Usuario getAtribuidoPor() { return atribuidoPor; }
    public void setAtribuidoPor(Usuario atribuidoPor) { this.atribuidoPor = atribuidoPor; }
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
