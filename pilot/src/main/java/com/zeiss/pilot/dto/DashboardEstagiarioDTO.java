package com.zeiss.pilot.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class DashboardEstagiarioDTO {

    private TotaisDTO totais;
    private List<EstagiarioMetricasDTO> estagiarios;

    public DashboardEstagiarioDTO() {}

    public TotaisDTO getTotais() { return totais; }
    public void setTotais(TotaisDTO totais) { this.totais = totais; }
    public List<EstagiarioMetricasDTO> getEstagiarios() { return estagiarios; }
    public void setEstagiarios(List<EstagiarioMetricasDTO> estagiarios) { this.estagiarios = estagiarios; }

    public static class TotaisDTO {
        private int totalEstagiarios;
        private int totalTarefas;
        private int totalConcluidas;
        private Double mediaGeralNotas;

        public TotaisDTO() {}

        public int getTotalEstagiarios() { return totalEstagiarios; }
        public void setTotalEstagiarios(int totalEstagiarios) { this.totalEstagiarios = totalEstagiarios; }
        public int getTotalTarefas() { return totalTarefas; }
        public void setTotalTarefas(int totalTarefas) { this.totalTarefas = totalTarefas; }
        public int getTotalConcluidas() { return totalConcluidas; }
        public void setTotalConcluidas(int totalConcluidas) { this.totalConcluidas = totalConcluidas; }
        public Double getMediaGeralNotas() { return mediaGeralNotas; }
        public void setMediaGeralNotas(Double mediaGeralNotas) { this.mediaGeralNotas = mediaGeralNotas; }
    }

    public static class EstagiarioMetricasDTO {
        private Long id;
        private String nome;
        private String area;
        private String turno;
        private String orientador;
        private LocalDate inicioEstagio;
        private String email;
        private int totalCards;
        private Map<String, Integer> cardsPorColuna;
        private double taxaConclusao;
        private Double mediaNotas;
        private int vencidas;

        public EstagiarioMetricasDTO() {}

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
        public int getTotalCards() { return totalCards; }
        public void setTotalCards(int totalCards) { this.totalCards = totalCards; }
        public Map<String, Integer> getCardsPorColuna() { return cardsPorColuna; }
        public void setCardsPorColuna(Map<String, Integer> cardsPorColuna) { this.cardsPorColuna = cardsPorColuna; }
        public double getTaxaConclusao() { return taxaConclusao; }
        public void setTaxaConclusao(double taxaConclusao) { this.taxaConclusao = taxaConclusao; }
        public Double getMediaNotas() { return mediaNotas; }
        public void setMediaNotas(Double mediaNotas) { this.mediaNotas = mediaNotas; }
        public int getVencidas() { return vencidas; }
        public void setVencidas(int vencidas) { this.vencidas = vencidas; }
    }
}
