package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.NotaEstagiario;
import java.time.LocalDate;

public class NotaEstagiarioDTO {

    private Long id;
    private Long estagiariaId;
    private Long servicoId;
    private int nota;
    private String comentario;
    private String avaliadorNome;
    private LocalDate data;

    public NotaEstagiarioDTO() {}

    public static NotaEstagiarioDTO fromEntity(NotaEstagiario e) {
        NotaEstagiarioDTO dto = new NotaEstagiarioDTO();
        dto.setId(e.getId());
        dto.setEstagiariaId(e.getEstagiariaId());
        dto.setServicoId(e.getServicoId());
        dto.setNota(e.getNota());
        dto.setComentario(e.getComentario());
        dto.setAvaliadorNome(e.getAvaliadorNome());
        dto.setData(e.getData());
        return dto;
    }

    public NotaEstagiario toEntity() {
        NotaEstagiario e = new NotaEstagiario();
        e.setEstagiariaId(this.estagiariaId);
        e.setServicoId(this.servicoId);
        e.setNota(this.nota);
        e.setComentario(this.comentario);
        e.setAvaliadorNome(this.avaliadorNome);
        e.setData(this.data);
        return e;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEstagiariaId() { return estagiariaId; }
    public void setEstagiariaId(Long estagiariaId) { this.estagiariaId = estagiariaId; }
    public Long getServicoId() { return servicoId; }
    public void setServicoId(Long servicoId) { this.servicoId = servicoId; }
    public int getNota() { return nota; }
    public void setNota(int nota) { this.nota = nota; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public String getAvaliadorNome() { return avaliadorNome; }
    public void setAvaliadorNome(String avaliadorNome) { this.avaliadorNome = avaliadorNome; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}
