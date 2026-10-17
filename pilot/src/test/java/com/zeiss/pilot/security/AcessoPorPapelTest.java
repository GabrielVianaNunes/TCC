package com.zeiss.pilot.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;

import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Matriz de acesso por papel imposta no servidor (SecurityConfig), espelhando
 * o que a interface já esconde em core.js (PAGE_ROLES/PERMS). Sem estas
 * regras, esconder o menu não impedia ninguém de chamar a URL ou a API direto.
 *
 * <p>Para as rotas restritas, "permitido" significa apenas "não 403": ids
 * inexistentes e corpos vazios devolvem 404/400, o que é irrelevante aqui — o
 * que se verifica é a decisão de autorização, que acontece antes do controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AcessoPorPapelTest {

    private static final List<String> SEM_ACESSO_GESTOR_E_ADMIN = List.of("ESTAGIARIO", "TECNICO");
    private static final List<String> COM_ACESSO_GESTOR_E_ADMIN = List.of("GESTOR", "ADMIN");
    private static final List<String> SEM_ACESSO_ADMIN = List.of("ESTAGIARIO", "TECNICO", "GESTOR");
    private static final List<String> TODOS_OS_PAPEIS = List.of("ESTAGIARIO", "TECNICO", "GESTOR", "ADMIN");

    @Autowired
    private MockMvc mockMvc;

    private int statusPara(HttpMethod metodo, String url, String papel) throws Exception {
        return mockMvc.perform(request(metodo, url)
                        .with(user("fixture-" + papel.toLowerCase() + "@zeiss.com").roles(papel))
                        .with(csrf()))
                .andReturn().getResponse().getStatus();
    }

    static Stream<Arguments> rotasGestorEAdmin() {
        return Stream.of(
                // páginas
                Arguments.of(HttpMethod.GET, "/usuarios"),
                Arguments.of(HttpMethod.GET, "/editais/lista"),
                Arguments.of(HttpMethod.GET, "/lista-editais"),
                Arguments.of(HttpMethod.GET, "/detalhes-edital"),
                Arguments.of(HttpMethod.GET, "/editais/1"),
                Arguments.of(HttpMethod.GET, "/dashboard-clientes"),
                Arguments.of(HttpMethod.GET, "/dashboardServicos"),
                Arguments.of(HttpMethod.GET, "/servicos/relatorio-servicos"),
                // APIs de editais e relatórios financeiros
                Arguments.of(HttpMethod.GET, "/api/editais"),
                Arguments.of(HttpMethod.POST, "/api/editais"),
                Arguments.of(HttpMethod.GET, "/servicos/relatorio-servicos/api"),
                Arguments.of(HttpMethod.GET, "/clientes/dashboard/dados"),
                // exclusões
                Arguments.of(HttpMethod.DELETE, "/api/clientes/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/servicos/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/projetos/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/eventos/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/visitas-tecnicas/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/amostras/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/estagiarios/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/almoxarifado/itens/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/maquinas/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/maquinas/1/manutencoes/999999"));
    }

    static Stream<Arguments> rotasSomenteAdmin() {
        return Stream.of(
                Arguments.of(HttpMethod.GET, "/documentos"));
    }

    /**
     * Rotas que Técnico e Estagiário usam no dia a dia e que NÃO podem ser
     * fechadas por engano: cancelar o próprio uso de máquina, mexer no próprio
     * kanban (o KanbanCardService decide por dono) e ler o que alimenta os
     * formulários.
     */
    static Stream<Arguments> rotasAbertasATodos() {
        return Stream.of(
                Arguments.of(HttpMethod.GET, "/clientes"),
                Arguments.of(HttpMethod.GET, "/api/clientes"),
                Arguments.of(HttpMethod.GET, "/clientes/relatorio"),
                Arguments.of(HttpMethod.GET, "/eventos/dashboard"),
                Arguments.of(HttpMethod.GET, "/kanban-estagiarios"),
                Arguments.of(HttpMethod.DELETE, "/api/kanban-cards/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/maquinas/1/sessoes/999999"),
                Arguments.of(HttpMethod.DELETE, "/api/maquinas/1/agendamentos/999999"));
    }

    @ParameterizedTest(name = "{0} {1}")
    @MethodSource("rotasGestorEAdmin")
    void rotaDeGestorEAdminBarraEstagiarioETecnico(HttpMethod metodo, String url) throws Exception {
        for (String papel : SEM_ACESSO_GESTOR_E_ADMIN) {
            assertEquals(403, statusPara(metodo, url, papel), papel + " deveria receber 403 em " + metodo + " " + url);
        }
    }

    @ParameterizedTest(name = "{0} {1}")
    @MethodSource("rotasGestorEAdmin")
    void rotaDeGestorEAdminLiberaGestorEAdmin(HttpMethod metodo, String url) throws Exception {
        for (String papel : COM_ACESSO_GESTOR_E_ADMIN) {
            assertNotEquals(403, statusPara(metodo, url, papel), papel + " não deveria receber 403 em " + metodo + " " + url);
        }
    }

    @ParameterizedTest(name = "{0} {1}")
    @MethodSource("rotasSomenteAdmin")
    void rotaSomenteAdminBarraTodosOsOutrosPapeis(HttpMethod metodo, String url) throws Exception {
        for (String papel : SEM_ACESSO_ADMIN) {
            assertEquals(403, statusPara(metodo, url, papel), papel + " deveria receber 403 em " + metodo + " " + url);
        }
        assertNotEquals(403, statusPara(metodo, url, "ADMIN"), "ADMIN não deveria receber 403 em " + metodo + " " + url);
    }

    @ParameterizedTest(name = "{0} {1}")
    @MethodSource("rotasAbertasATodos")
    void rotaAbertaContinuaLivreParaTodosOsPapeis(HttpMethod metodo, String url) throws Exception {
        for (String papel : TODOS_OS_PAPEIS) {
            assertNotEquals(403, statusPara(metodo, url, papel), papel + " não deveria receber 403 em " + metodo + " " + url);
        }
    }
}
