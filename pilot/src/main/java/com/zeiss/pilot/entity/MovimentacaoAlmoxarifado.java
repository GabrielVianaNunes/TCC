package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimentacoes_almoxarifado")
public class MovimentacaoAlmoxarifado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ItemAlmoxarifado item;

    private String tipo;
    private int quantidade;
    private String responsavel;
    private String motivo;
    private LocalDateTime data;

    public MovimentacaoAlmoxarifado() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ItemAlmoxarifado getItem() { return item; }
    public void setItem(ItemAlmoxarifado item) { this.item = item; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }
}
