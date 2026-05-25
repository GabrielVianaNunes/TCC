package com.zeiss.pilot.dto;

import java.util.Map;

public class EventoRelatorioDTO {
    private long totalEventos;
    private double adesaoMedia;
    private Map<String, Long> distribuicaoMensal; // Mês -> Quantidade de eventos

    // Construtor padrão
    public EventoRelatorioDTO() {}

    public EventoRelatorioDTO(long totalEventos, double adesaoMedia, Map<String, Long> distribuicaoMensal) {
        this.totalEventos = totalEventos;
        this.adesaoMedia = adesaoMedia;
        this.distribuicaoMensal = distribuicaoMensal;
    }

    public long getTotalEventos() {
        return totalEventos;
    }

    public void setTotalEventos(long totalEventos) {
        this.totalEventos = totalEventos;
    }

    public double getAdesaoMedia() {
        return adesaoMedia;
    }

    public void setAdesaoMedia(double adesaoMedia) {
        this.adesaoMedia = adesaoMedia;
    }

    public Map<String, Long> getDistribuicaoMensal() {
        return distribuicaoMensal;
    }

    public void setDistribuicaoMensal(Map<String, Long> distribuicaoMensal) {
        this.distribuicaoMensal = distribuicaoMensal;
    }
}
