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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zeiss.pilot.dto.DocumentoPDFDTO;
import com.zeiss.pilot.entity.DocumentoPDF;
import com.zeiss.pilot.entity.PastaDocumento;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.DocumentoPDFRepository;
import com.zeiss.pilot.repository.PastaDocumentoRepository;

@Service
public class DocumentoPDFService {

    @Autowired
    private DocumentoPDFRepository documentoRepository;

    @Autowired
    private PastaDocumentoRepository pastaRepository;

    private final String PASTA_BASE = "C:/PDFs";

    @Transactional
    public DocumentoPDFDTO salvarArquivo(MultipartFile file,
                                         LocalDate dataExpiracao,
                                         Usuario usuario,
                                         Long pastaId,          // opcional (compat)
                                         Long subpastaId) throws IOException {

        if (subpastaId == null) {
            throw new IllegalArgumentException("subpastaId é obrigatório para o upload de documentos.");
        }

        // --- armazenamento físico ---
        Long usuarioId = usuario.getId();
        String pastaUsuario = PASTA_BASE + "/Usuario" + usuarioId;
        Files.createDirectories(Paths.get(pastaUsuario));

        String nomeArquivo = file.getOriginalFilename();
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            nomeArquivo = "documento.pdf";
        }
        String caminhoFinal = pastaUsuario + "/" + nomeArquivo;

        Path caminho = Paths.get(caminhoFinal);
        Files.copy(file.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

        // --- vínculos lógicos ---
        PastaDocumento subpasta = pastaRepository.findById(subpastaId)
                .orElseThrow(() -> new IllegalArgumentException("Subpasta não encontrada com ID: " + subpastaId));

        // Se o caller informou pastaId, valide a relação (subpasta -> pastaPai)
        if (pastaId != null) {
            if (subpasta.getPastaPai() == null || !subpasta.getPastaPai().getId().equals(pastaId)) {
                throw new IllegalArgumentException("Subpasta não pertence à pasta informada.");
            }
        }

        DocumentoPDF doc = new DocumentoPDF();
        doc.setNomeArquivo(nomeArquivo);
        doc.setCaminhoArquivo(caminhoFinal);
        doc.setDataExpiracao(dataExpiracao);
        doc.setDataUpload(LocalDateTime.now());
        doc.setStatus(calcularStatus(dataExpiracao));
        doc.setUsuario(usuario);

        // 🔗 associando corretamente à SUBPASTA (antes estava setando 'pasta')
        doc.setSubpasta(subpasta);

        DocumentoPDF salvo = documentoRepository.save(doc);
        return toDTO(salvo);
    }

    public List<DocumentoPDFDTO> listarPorUsuario(Long usuarioId) {
        return documentoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(doc -> {
                    // ✅ recalcula o status antes de retornar
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
            doc.setStatus(calcularStatus(novaData)); // ✅ recalcula após edição
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
        dto.setStatus(doc.getStatus());

        // Usuário
        if (doc.getUsuario() != null) {
            dto.setUsuarioId(doc.getUsuario().getId());
            String role = doc.getUsuario().getRole(); // <- é String no seu modelo
            if (role != null && !role.isBlank()) {
                dto.setUsuarioRole(normalizeRole(role));
            }
        }

        // Subpasta (principal)
        if (doc.getSubpasta() != null) {
            dto.setSubpastaId(doc.getSubpasta().getId());
            dto.setNomeSubpasta(doc.getSubpasta().getNome());

            // Compat: pasta pai
            if (doc.getSubpasta().getPastaPai() != null) {
                dto.setPastaId(doc.getSubpasta().getPastaPai().getId());
                dto.setNomePasta(doc.getSubpasta().getPastaPai().getNome());
            }
        }
        return dto;
    }

    private String normalizeRole(String role) {
        String r = role.trim().toUpperCase();
        // normaliza nomes comuns para o padrão ROLE_*
        if (!r.startsWith("ROLE_")) {
            if (r.equals("ADMIN")) r = "ROLE_ADMIN";
            else if (r.equals("USER")) r = "ROLE_USER";
            // adicione outros mapeamentos se houver (ex.: "GESTOR" -> "ROLE_GESTOR")
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

    public Page<DocumentoPDFDTO> listarPorSubpastaComFiltro(Long subpastaId, String status, String nome, int page, int size) {
        Pageable pageable   = PageRequest.of(page, size);

        String statusFiltro = (status == null || status.isBlank()) ? null : status.replace("-", " ");
        String nomeFiltro   = (nome   == null || nome.isBlank())   ? null : nome;

        Page<DocumentoPDF> documentos = documentoRepository.findBySubpastaComFiltro(subpastaId, statusFiltro, nomeFiltro, pageable);

        return documentos.map(doc -> {
            String statusRecalculado = calcularStatus(doc.getDataExpiracao());
            if (doc.getStatus() == null || !statusRecalculado.equalsIgnoreCase(doc.getStatus())) {
                doc.setStatus(statusRecalculado);
                documentoRepository.save(doc);
            }
            return toDTO(doc);
        });
    }
    
}
