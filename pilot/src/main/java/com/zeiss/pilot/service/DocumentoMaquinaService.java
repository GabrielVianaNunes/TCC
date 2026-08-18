package com.zeiss.pilot.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zeiss.pilot.dto.DocumentoMaquinaDTO;
import com.zeiss.pilot.entity.DocumentoMaquina;
import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.repository.DocumentoMaquinaRepository;
import com.zeiss.pilot.repository.MaquinaRepository;

@Service
public class DocumentoMaquinaService {

    private static final Logger log = LoggerFactory.getLogger(DocumentoMaquinaService.class);

    private final DocumentoMaquinaRepository repository;

    private final MaquinaRepository maquinaRepository;

    // Mesma base de storage.pdf.base-path usada por DocumentoPDFService —
    // ver comentário lá para o porquê de ser configurável.
    @Value("${storage.pdf.base-path:C:/PDFs}")
    private String pastaBase;

    public DocumentoMaquinaService(DocumentoMaquinaRepository repository, MaquinaRepository maquinaRepository) {
        this.repository = repository;
        this.maquinaRepository = maquinaRepository;
    }

    @Transactional
    public DocumentoMaquinaDTO upload(MultipartFile file, Long maquinaId,
                                      LocalDate dataExpiracao, String tipoDocumento) throws IOException {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new IllegalArgumentException("Máquina não encontrada: " + maquinaId));

        String pasta = pastaBase + "/Maquina" + maquinaId;
        Files.createDirectories(Paths.get(pasta));

        String nomeArquivo = file.getOriginalFilename();
        if (nomeArquivo == null || nomeArquivo.isBlank()) nomeArquivo = "documento.pdf";

        Path destino = Paths.get(pasta + "/" + nomeArquivo);
        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        DocumentoMaquina doc = new DocumentoMaquina();
        doc.setMaquina(maquina);
        doc.setNomeArquivo(nomeArquivo);
        doc.setCaminhoArquivo(destino.toString());
        doc.setTipoDocumento(tipoDocumento);
        doc.setDataUpload(LocalDateTime.now());
        doc.setDataExpiracao(dataExpiracao);
        doc.setStatus(calcularStatus(dataExpiracao));

        return toDTO(repository.save(doc));
    }

    public List<DocumentoMaquinaDTO> listar(Long maquinaId) {
        return repository.findByMaquinaIdOrderByDataUploadDesc(maquinaId)
                .stream()
                .peek(doc -> doc.setStatus(calcularStatus(doc.getDataExpiracao())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void remover(Long id) {
        repository.findById(id).ifPresent(doc -> {
            try {
                Files.deleteIfExists(Paths.get(doc.getCaminhoArquivo()));
            } catch (IOException e) {
                log.warn("Falha ao excluir arquivo físico do documento {} ({})", id, doc.getCaminhoArquivo(), e);
            }
            repository.deleteById(id);
        });
    }

    public ResponseEntity<Resource> abrir(Long id) {
        DocumentoMaquina doc = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado: " + id));
        Path path = Paths.get(doc.getCaminhoArquivo());
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    private String calcularStatus(LocalDate dataExpiracao) {
        if (dataExpiracao == null) return "ativo";
        LocalDate hoje = LocalDate.now();
        if (dataExpiracao.isBefore(hoje)) return "expirado";
        if (!dataExpiracao.isAfter(hoje.plusDays(30))) return "prestes a vencer";
        return "ativo";
    }

    private DocumentoMaquinaDTO toDTO(DocumentoMaquina doc) {
        DocumentoMaquinaDTO dto = new DocumentoMaquinaDTO();
        dto.setId(doc.getId());
        dto.setMaquinaId(doc.getMaquina() != null ? doc.getMaquina().getId() : null);
        dto.setNomeArquivo(doc.getNomeArquivo());
        dto.setTipoDocumento(doc.getTipoDocumento());
        dto.setDataUpload(doc.getDataUpload());
        dto.setDataExpiracao(doc.getDataExpiracao());
        dto.setStatus(doc.getStatus());
        return dto;
    }
}
