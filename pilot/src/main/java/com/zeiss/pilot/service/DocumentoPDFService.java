package com.zeiss.pilot.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zeiss.pilot.dto.DocumentoPDFDTO;
import com.zeiss.pilot.entity.DocumentoPDF;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.DocumentoPDFRepository;

@Service
public class DocumentoPDFService {

    private final DocumentoPDFRepository documentoRepository;

    // Configurável via storage.pdf.base-path (env STORAGE_PDF_PATH) — o
    // padrão C:/PDFs vale para o ambiente de desenvolvimento local; em
    // Docker/produção o docker-compose.yml aponta para um caminho Linux
    // com volume nomeado, para o arquivo sobreviver a um redeploy.
    @Value("${storage.pdf.base-path:C:/PDFs}")
    private String pastaBase;

    public DocumentoPDFService(DocumentoPDFRepository documentoRepository) {
        this.documentoRepository = documentoRepository;
    }

    @Transactional
    public DocumentoPDFDTO salvarArquivo(MultipartFile file,
                                         LocalDate dataExpiracao,
                                         Usuario usuario) throws IOException {

        // --- armazenamento físico ---
        Long usuarioId = usuario.getId();
        String pastaUsuario = pastaBase + "/Usuario" + usuarioId;
        Files.createDirectories(Paths.get(pastaUsuario));

        String nomeArquivo = file.getOriginalFilename();
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            nomeArquivo = "documento.pdf";
        }
        String caminhoFinal = pastaUsuario + "/" + nomeArquivo;

        Path caminho = Paths.get(caminhoFinal);
        Files.copy(file.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

        DocumentoPDF doc = new DocumentoPDF();
        doc.setNomeArquivo(nomeArquivo);
        doc.setCaminhoArquivo(caminhoFinal);
        doc.setDataExpiracao(dataExpiracao);
        doc.setDataUpload(LocalDateTime.now());
        doc.setStatus(calcularStatus(dataExpiracao));
        doc.setUsuario(usuario);

        DocumentoPDF salvo = documentoRepository.save(doc);
        return toDTO(salvo);
    }

    public List<DocumentoPDFDTO> listarTodos() {
        return documentoRepository.findAll()
                .stream()
                .map(doc -> {
                    doc.setStatus(calcularStatus(doc.getDataExpiracao()));
                    return toDTO(doc);
                })
                .collect(Collectors.toList());
    }

    public List<DocumentoPDFDTO> listarPorUsuario(Long usuarioId) {
        return documentoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(doc -> {
                    doc.setStatus(calcularStatus(doc.getDataExpiracao()));
                    return toDTO(doc);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void remover(Long id) {
        documentoRepository.findById(id).ifPresent(doc -> {
            try {
                Files.deleteIfExists(Paths.get(doc.getCaminhoArquivo()));
            } catch (IOException e) {
                e.printStackTrace();
            }
            documentoRepository.deleteById(id);
        });
    }

    @Transactional
    public DocumentoPDFDTO editarDataExpiracao(Long id, LocalDate novaData) {
        Optional<DocumentoPDF> opt = documentoRepository.findById(id);
        if (opt.isPresent()) {
            DocumentoPDF doc = opt.get();
            doc.setDataExpiracao(novaData);
            doc.setStatus(calcularStatus(novaData)); // recalcula após edição
            return toDTO(documentoRepository.save(doc));
        }
        return null;
    }

    private String calcularStatus(LocalDate dataExpiracao) {
        if (dataExpiracao == null) return "indefinido";
        LocalDate hoje = LocalDate.now();
        if (dataExpiracao.isBefore(hoje)) {
            return "expirado";
        } else if (!dataExpiracao.isAfter(hoje.plusDays(30))) {
            return "prestes a vencer";
        } else {
            return "ativo";
        }
    }

    private DocumentoPDFDTO toDTO(DocumentoPDF doc) {
        DocumentoPDFDTO dto = new DocumentoPDFDTO();
        dto.setId(doc.getId());
        dto.setNomeArquivo(doc.getNomeArquivo());
        dto.setCaminhoArquivo(doc.getCaminhoArquivo());
        dto.setDataExpiracao(doc.getDataExpiracao());
        dto.setDataUpload(doc.getDataUpload());
        dto.setStatus(doc.getStatus());

        if (doc.getUsuario() != null) {
            dto.setUsuarioId(doc.getUsuario().getId());
            String role = doc.getUsuario().getRole();
            if (role != null && !role.isBlank()) {
                dto.setUsuarioRole(normalizeRole(role));
            }
        }
        return dto;
    }

    private String normalizeRole(String role) {
        String r = role.trim().toUpperCase();
        if (!r.startsWith("ROLE_")) {
            if (r.equals("ADMIN")) r = "ROLE_ADMIN";
            else if (r.equals("USER")) r = "ROLE_USER";
        }
        return r;
    }

    public List<DocumentoPDFDTO> listarPorUsuarioComFiltro(Long usuarioId, String status, String nome) {
        List<DocumentoPDF> documentos = documentoRepository.findByUsuarioId(usuarioId);

        return documentos.stream()
                .peek(doc -> doc.setStatus(calcularStatus(doc.getDataExpiracao())))
                .filter(doc -> {
                    boolean statusOK = true;
                    if (status != null && !status.isBlank()) {
                        String statusParam = status.replace("-", " ").toLowerCase();
                        statusOK = doc.getStatus() != null && doc.getStatus().equalsIgnoreCase(statusParam);
                    }

                    boolean nomeOK = true;
                    if (nome != null && !nome.isBlank()) {
                        String n = doc.getNomeArquivo() == null ? "" : doc.getNomeArquivo();
                        nomeOK = n.toLowerCase().contains(nome.toLowerCase());
                    }

                    return statusOK && nomeOK;
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ResponseEntity<Resource> abrirDocumentoComoResource(Long id) {
        DocumentoPDF doc = documentoRepository.findById(id).orElseThrow();
        Path path = Paths.get(doc.getCaminhoArquivo());
        Resource resource = new FileSystemResource(path);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    public Page<DocumentoPDFDTO> listarPorUsuarioComFiltroPaginado(Long usuarioId, String status, String nome, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String statusFiltro = (status == null || status.isEmpty()) ? "" : status.replace("-", " ").toLowerCase();
        String nomeFiltro   = (nome == null || nome.isEmpty())   ? "" : nome.toLowerCase();

        Page<DocumentoPDF> documentos = documentoRepository
                .findByUsuarioIdAndStatusIgnoreCaseContainingAndNomeArquivoIgnoreCaseContaining(
                        usuarioId, statusFiltro, nomeFiltro, pageable);

        return documentos.map(doc -> {
            String statusRecalculado = calcularStatus(doc.getDataExpiracao());
            if (doc.getStatus() == null || !statusRecalculado.equalsIgnoreCase(doc.getStatus())) {
                doc.setStatus(statusRecalculado);
                documentoRepository.save(doc);
            }
            return toDTO(doc);
        });
    }

    @Scheduled(cron = "0 0 14 * * *") // Todos os dias às 14h
    @Transactional
    public void atualizarStatusTodosOsDocumentos() {
        List<DocumentoPDF> documentos = documentoRepository.findAll();

        for (DocumentoPDF doc : documentos) {
            String novoStatus = calcularStatus(doc.getDataExpiracao());
            if (doc.getStatus() == null || !novoStatus.equalsIgnoreCase(doc.getStatus())) {
                doc.setStatus(novoStatus);
                documentoRepository.save(doc);
            }
        }
        System.out.println("[AGENDADO] Verificação e atualização de status concluída às 14h.");
    }
}
