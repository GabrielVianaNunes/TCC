package com.zeiss.pilot.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zeiss.pilot.entity.PastaDocumento;
import com.zeiss.pilot.repository.PastaDocumentoRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PastaDocumentoService {

    @Autowired
    private PastaDocumentoRepository repo;

    public List<PastaDocumento> listarRaiz() {
        return repo.findByPastaPaiIsNull();
    }

    public List<PastaDocumento> listarSubpastas(Long pastaPaiId) {
        return repo.findByPastaPaiId(pastaPaiId);
    }

    public PastaDocumento obter(Long id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Pasta não encontrada"));
    }

    public PastaDocumento criarPasta(String nome, String tipoAcesso, Long pastaPaiId) {
        Long pai = pastaPaiId; // null = raiz
        if (repo.existsByPastaPaiIdAndNome(pai, nome)) {
            throw new IllegalArgumentException("Já existe uma pasta com este nome neste nível.");
        }
        PastaDocumento pasta = new PastaDocumento();
        pasta.setNome(nome);
        pasta.setTipoAcesso(tipoAcesso);
        if (pastaPaiId != null) {
            pasta.setPastaPai(obter(pastaPaiId));
            // (opcional) herdar tipoAcesso do pai:
            // pasta.setTipoAcesso(pasta.getPastaPai().getTipoAcesso());
        }
        return repo.save(pasta);
    }

    public PastaDocumento atualizar(Long id, String nome, String tipoAcesso) {
        PastaDocumento pasta = obter(id);
        Long pai = pasta.getPastaPai() != null ? pasta.getPastaPai().getId() : null;
        if (!pasta.getNome().equals(nome) && repo.existsByPastaPaiIdAndNome(pai, nome)) {
            throw new IllegalArgumentException("Já existe uma pasta com este nome neste nível.");
        }
        pasta.setNome(nome);
        pasta.setTipoAcesso(tipoAcesso);
        return repo.save(pasta);
    }

    public void excluir(Long id) {
        PastaDocumento pasta = obter(id);
        if (!pasta.getSubpastas().isEmpty()) {
            throw new IllegalStateException("Exclusão bloqueada: existem subpastas.");
        }
        if (!pasta.getDocumentos().isEmpty()) {
            throw new IllegalStateException("Exclusão bloqueada: existem documentos vinculados.");
        }
        repo.delete(pasta);
    }

    // (Opcional) mover subpasta para outro pai
    public PastaDocumento mover(Long id, Long novoPaiId) {
        PastaDocumento pasta = obter(id);
        PastaDocumento novoPai = novoPaiId != null ? obter(novoPaiId) : null;
        if (repo.existsByPastaPaiIdAndNome(novoPaiId, pasta.getNome())) {
            throw new IllegalArgumentException("Já existe uma pasta com este nome no destino.");
        }
        pasta.setPastaPai(novoPai);
        return repo.save(pasta);
    }
}
