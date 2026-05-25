package com.zeiss.pilot.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
  name = "pasta_documento",
  uniqueConstraints = {
    @UniqueConstraint(name = "uk_pasta_pai_nome", columnNames = {"pasta_pai_id", "nome"})
  }
)
public class PastaDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)       
    private String nome;

    @Column(nullable = false)
    private String tipoAcesso;

    // Agora vinculado corretamente pelo campo 'subpasta' em DocumentoPDF
    @OneToMany(mappedBy = "subpasta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentoPDF> documentos = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "pasta_pai_id")
    private PastaDocumento pastaPai;

    @OneToMany(mappedBy = "pastaPai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PastaDocumento> subpastas = new ArrayList<>();

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTipoAcesso() { return tipoAcesso; }
    public void setTipoAcesso(String tipoAcesso) { this.tipoAcesso = tipoAcesso; }

    public List<DocumentoPDF> getDocumentos() { return documentos; }
    public void setDocumentos(List<DocumentoPDF> documentos) { this.documentos = documentos; }

    public PastaDocumento getPastaPai() { return pastaPai; }
    public void setPastaPai(PastaDocumento pastaPai) { this.pastaPai = pastaPai; }

    public List<PastaDocumento> getSubpastas() { return subpastas; }
    public void setSubpastas(List<PastaDocumento> subpastas) { this.subpastas = subpastas; }
}
