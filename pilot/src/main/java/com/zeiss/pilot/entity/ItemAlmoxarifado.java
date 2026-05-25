package com.zeiss.pilot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "itens_almoxarifado")
public class ItemAlmoxarifado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String categoria;
    private String unidade;
    private int quantidadeAtual;
    private int estoqueMinimo;
    private String localizacao;

    @Column(length = 1000)
    private String observacao;

    public ItemAlmoxarifado() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public int getQuantidadeAtual() { return quantidadeAtual; }
    public void setQuantidadeAtual(int quantidadeAtual) { this.quantidadeAtual = quantidadeAtual; }
    public int getEstoqueMinimo() { return estoqueMinimo; }
    public void setEstoqueMinimo(int estoqueMinimo) { this.estoqueMinimo = estoqueMinimo; }
    public String getLocalizacao() { return localizacao; }
    public void setLocalizacao(String localizacao) { this.localizacao = localizacao; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
