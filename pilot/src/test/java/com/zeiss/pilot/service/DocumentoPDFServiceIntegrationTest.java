package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.DocumentoPDFDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.DocumentoPDFRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DocumentoPDFServiceIntegrationTest {

    @Autowired
    private DocumentoPDFService documentoPDFService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DocumentoPDFRepository documentoPDFRepository;

    private Usuario usuario;
    private final Set<Path> arquivosCriados = new HashSet<>();

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setNome("Usuario Teste Etapa6");
        usuario.setEmail("teste.etapa6@zeiss.com");
        usuario.setSenha("x");
        usuario.setRole("CLIENTE");
        usuario = usuarioRepository.save(usuario);
    }

    @AfterEach
    void tearDown() {
        Set<Path> pastas = new HashSet<>();
        for (Path caminho : arquivosCriados) {
            try {
                Files.deleteIfExists(caminho);
                pastas.add(caminho.getParent());
            } catch (IOException ignored) {
                // arquivo já removido pelo próprio teste (ex.: teste de remover())
            }
        }
        for (Path pasta : pastas) {
            try {
                Files.deleteIfExists(pasta);
            } catch (IOException ignored) {
                // pasta ainda tem outros arquivos deste usuário nesta execução — ok
            }
        }
    }

    private DocumentoPDFDTO salvar(String nomeArquivo, LocalDate dataExpiracao) throws IOException {
        MockMultipartFile arquivo = new MockMultipartFile(
                "arquivo", nomeArquivo, "application/pdf", "conteudo de teste".getBytes());
        DocumentoPDFDTO dto = documentoPDFService.salvarArquivo(arquivo, dataExpiracao, usuario);
        arquivosCriados.add(Paths.get(dto.getCaminhoArquivo()));
        return dto;
    }

    @Test
    void salvarArquivoComDataExpiradaRetornaStatusExpirado() throws IOException {
        DocumentoPDFDTO dto = salvar("expirado.pdf", LocalDate.now().minusDays(1));
        assertEquals("expirado", dto.getStatus());
    }

    @Test
    void salvarArquivoComDataProximaRetornaStatusPrestesAVencer() throws IOException {
        DocumentoPDFDTO dto = salvar("prestes-a-vencer.pdf", LocalDate.now().plusDays(10));
        assertEquals("prestes a vencer", dto.getStatus());
    }

    @Test
    void salvarArquivoComDataDistanteRetornaStatusAtivo() throws IOException {
        DocumentoPDFDTO dto = salvar("ativo.pdf", LocalDate.now().plusDays(60));
        assertEquals("ativo", dto.getStatus());
    }

    @Test
    void salvarArquivoPersisteArquivoFisicoEEntidade() throws IOException {
        DocumentoPDFDTO dto = salvar("persistencia.pdf", LocalDate.now().plusDays(60));

        assertTrue(Files.exists(Paths.get(dto.getCaminhoArquivo())));
        assertTrue(documentoPDFRepository.findById(dto.getId()).isPresent());
    }

    @Test
    void editarDataExpiracaoAtualizaDataEStatus() throws IOException {
        DocumentoPDFDTO original = salvar("editar.pdf", LocalDate.now().plusDays(60));

        LocalDate novaData = LocalDate.now().minusDays(1);
        DocumentoPDFDTO editado = documentoPDFService.editarDataExpiracao(original.getId(), novaData);

        assertEquals(novaData, editado.getDataExpiracao());
        assertEquals("expirado", editado.getStatus());
    }

    @Test
    void removerDeletaRegistroEArquivoFisico() throws IOException {
        DocumentoPDFDTO dto = salvar("remover.pdf", LocalDate.now().plusDays(60));
        Path caminho = Paths.get(dto.getCaminhoArquivo());

        documentoPDFService.remover(dto.getId());

        assertTrue(documentoPDFRepository.findById(dto.getId()).isEmpty());
        assertFalse(Files.exists(caminho));
    }

    @Test
    void listarPorUsuarioComFiltroPaginadoFiltraPorStatusENome() throws IOException {
        salvar("relatorio-mensal.pdf", LocalDate.now().plusDays(60));
        salvar("relatorio-expirado.pdf", LocalDate.now().minusDays(1));
        salvar("outro-documento.pdf", LocalDate.now().plusDays(60));

        Page<DocumentoPDFDTO> porNome = documentoPDFService
                .listarPorUsuarioComFiltroPaginado(usuario.getId(), null, "relatorio", 0, 10);
        assertEquals(2, porNome.getTotalElements());

        Page<DocumentoPDFDTO> porStatus = documentoPDFService
                .listarPorUsuarioComFiltroPaginado(usuario.getId(), "expirado", null, 0, 10);
        assertEquals(1, porStatus.getTotalElements());
        assertEquals("relatorio-expirado.pdf", porStatus.getContent().get(0).getNomeArquivo());
    }
}
