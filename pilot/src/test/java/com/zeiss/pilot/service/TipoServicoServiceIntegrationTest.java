package com.zeiss.pilot.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.zeiss.pilot.dto.TipoServicoDTO;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TipoServicoServiceIntegrationTest {

    @Autowired
    private TipoServicoService tipoServicoService;

    @Test
    void listarDevolveOCatalogoSemeadoPelaMigracao() {
        List<TipoServicoDTO> catalogo = tipoServicoService.listar();

        assertTrue(catalogo.size() >= 17, "Catálogo semeado por V9 deveria ter pelo menos 17 itens");
        assertTrue(catalogo.stream().anyMatch(t -> "Medição por Coordenadas (CMM)".equals(t.getCategoria())));
        assertTrue(catalogo.stream().anyMatch(t -> "Multi-sensor Óptico".equals(t.getCategoria())));
        assertTrue(catalogo.stream().anyMatch(t -> "Tomografia Computadorizada (CT)".equals(t.getCategoria())));
    }

    @Test
    void todoItemDoCatalogoTemCategoriaEDescricaoPreenchidas() {
        List<TipoServicoDTO> catalogo = tipoServicoService.listar();

        catalogo.forEach(t -> {
            assertFalse(t.getCategoria() == null || t.getCategoria().isBlank(), "categoria vazia no item id=" + t.getId());
            assertFalse(t.getDescricao() == null || t.getDescricao().isBlank(), "descricao vazia no item id=" + t.getId());
        });
    }
}
