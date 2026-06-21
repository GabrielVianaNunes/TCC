package com.zeiss.pilot.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zeiss.pilot.dto.DocumentoPDFDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.service.DocumentoPDFService;
import com.zeiss.pilot.service.UsuarioService;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoPDFController {

    private final DocumentoPDFService service;

    private final UsuarioService usuarioService;

    public DocumentoPDFController(DocumentoPDFService service, UsuarioService usuarioService) {
        this.service = service;
        this.usuarioService = usuarioService;
    }

    /**
     * Upload de documento:
     * - Front chama /api/documentos/upload (documentos.js)
     * - subpastaId é obrigatório (amarração correta da listagem por subpasta)
     * - pastaId é opcional (mantido apenas por compatibilidade, se o service utilizar)
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentoPDFDTO> upload(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "subpastaId", required = false) Long subpastaId,
            @RequestParam("dataExpiracao") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataExpiracao,
            @RequestParam(value = "pastaId", required = false) Long pastaId
    ) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Usuario usuario = usuarioService.buscarPorEmail(email);

        // Mantive a assinatura esperada no service; ajuste se o seu service tiver outro nome/método
        DocumentoPDFDTO dto = service.salvarArquivo(arquivo, dataExpiracao, usuario, pastaId, subpastaId);
        return ResponseEntity.ok(dto);
    }

    /**
     * (Opcional) Se desejar manter compatibilidade com POST /api/documentos,
     * descomente este método abaixo e redirecione internamente para /upload:
     *
     * @PostMapping
     * @PreAuthorize("hasRole('ADMIN')")
     * public ResponseEntity<DocumentoPDFDTO> criarCompat(
     *         @RequestParam("arquivo") MultipartFile arquivo,
     *         @RequestParam("subpastaId") Long subpastaId,
     *         @RequestParam("dataExpiracao") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataExpiracao,
     *         @RequestParam(value = "pastaId", required = false) Long pastaId
     * ) throws IOException {
     *     return upload(arquivo, subpastaId, dataExpiracao, pastaId);
     * }
     */

    @GetMapping("/usuario/{usuarioId}")
    public List<DocumentoPDFDTO> listarPorUsuario(@PathVariable Long usuarioId) {
        return service.listarPorUsuario(usuarioId);
    }

    @GetMapping
    public ResponseEntity<List<DocumentoPDFDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/expiracao")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentoPDFDTO atualizarExpiracao(
            @PathVariable Long id,
            @RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        return service.editarDataExpiracao(id, data);
    }

    @GetMapping("/usuario/meus")
    public Page<DocumentoPDFDTO> listarMeusDocumentos(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String nome,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioService.buscarPorEmail(email);
        return service.listarPorUsuarioComFiltroPaginado(usuario.getId(), status, nome, page, size);
    }

    @GetMapping("/abrir/{id}")
    public ResponseEntity<Resource> abrirDocumento(@PathVariable Long id) {
        return service.abrirDocumentoComoResource(id);
    }

    @GetMapping("/subpasta/{idSubpasta}")
    public Page<DocumentoPDFDTO> listarPorSubpastaComFiltro(
            @PathVariable Long idSubpasta,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return service.listarPorSubpastaComFiltro(idSubpasta, status, nome, page, size);
    }
}
