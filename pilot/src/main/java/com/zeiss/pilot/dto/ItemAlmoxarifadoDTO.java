package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.ItemAlmoxarifado;

public class ItemAlmoxarifadoDTO {

    private Long id;
    private String nome;
    private String categoria;
    private String unidade;
    private int quantidadeAtual;
    private int estoqueMinimo;
    private String localizacao;
    private String observacao;

    public ItemAlmoxarifadoDTO() {}

    public static ItemAlmoxarifadoDTO fromEntity(ItemAlmoxarifado e) {
        ItemAlmoxarifadoDTO dto = new ItemAlmoxarifadoDTO();
        dto.setId(e.getId());
        dto.setNome(e.getNome());
        dto.setCategoria(e.getCategoria());
        dto.setUnidade(e.getUnidade());
        dto.setQuantidadeAtual(e.getQuantidadeAtual());
        dto.setEstoqueMinimo(e.getEstoqueMinimo());
        dto.setLocalizacao(e.getLocalizacao());
        dto.setObservacao(e.getObservacao());
        return dto;
    }

    public ItemAlmoxarifado toEntity() {
        ItemAlmoxarifado e = new ItemAlmoxarifado();
        e.setNome(this.nome);
        e.setCategoria(this.categoria);
        e.setUnidade(this.unidade);
        e.setQuantidadeAtual(this.quantidadeAtual);
        e.setEstoqueMinimo(this.estoqueMinimo);
        e.setLocalizacao(this.localizacao);
        e.setObservacao(this.observacao);
        return e;
    }

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
