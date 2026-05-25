package com.zeiss.pilot.dto;

public class PastaDocumentoDTO {
    private Long id;
    private String nome;
    private String tipoAcesso;
    private Long pastaPaiId;

    // Getters e Setters
    public Long getId() { 
        return id; 
    
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getNome() { 
        return nome; 
    }
    public void setNome(String nome) { 
        this.nome = nome; 
    }

    public String getTipoAcesso() { 
        return tipoAcesso; 
    }

    public void setTipoAcesso(String tipoAcesso) { 
        this.tipoAcesso = tipoAcesso; 
    }

    public Long getPastaPaiId() {
        return pastaPaiId;
    }

    public void setPastaPaiId(Long pastaPaiId) {
        this.pastaPaiId = pastaPaiId;
    }
}
