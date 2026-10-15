package com.zeiss.pilot.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import com.zeiss.pilot.PilotApplication;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

/**
 * Sobe a aplicação inteira num banco recém-criado e vazio — o cenário do CI e
 * de qualquer ambiente novo. Os demais testes rodam num banco que já foi
 * semeado, então não enxergam erro de ordem entre os inicializadores: o
 * DataSeeder precisa do admin (AdminInitializer) e das máquinas 1 a 4
 * (MaquinaDataInitializer), e nenhum dos dois é injetado nele.
 *
 * <p>Sem este teste, a ordem só quebrava em banco vazio, longe de quem mexeu
 * nos inicializadores. Cada execução cria um banco descartável próprio e o
 * remove no fim, sem tocar no banco de teste compartilhado.
 *
 * <p>O DataSeeder é dado de desenvolvimento e não roda no perfil "test" (senão
 * polui as tabelas que os outros testes assumem vazias). Por isso o contexto
 * aninhado sobe SEM o perfil "test" — reproduzindo uma subida de
 * desenvolvimento num banco novo, com o seeder ativo — e só reaproveita o
 * application-test.properties por importação explícita.
 */
@SpringBootTest
@ActiveProfiles("test")
class InicializacaoEmBancoVazioTest {

    @Autowired
    private Environment env;

    @Autowired
    private ApplicationContext aplicacao;

    @Test
    void seederDeDesenvolvimentoNaoRodaNoPerfilDeTeste() {
        assertFalse(aplicacao.containsBean("dataSeeder"),
                "DataSeeder semeia dados de dev e não pode existir no perfil de teste");
    }

    @Test
    void contextoSobeEmBancoVazioComOsInicializadoresNaOrdemCerta() throws Exception {
        String urlConfigurada = env.getRequiredProperty("spring.datasource.url");
        String usuario = env.getRequiredProperty("spring.datasource.username");
        String senha = env.getRequiredProperty("spring.datasource.password");

        String prefixoUrl = urlConfigurada.substring(0, urlConfigurada.lastIndexOf('/') + 1);
        String nomeBanco = "pilot_vazio_" + UUID.randomUUID().toString().replace("-", "");

        executarNoServidor(prefixoUrl, usuario, senha, "CREATE DATABASE " + nomeBanco);
        try {
            try (ConfigurableApplicationContext contexto = new SpringApplicationBuilder(PilotApplication.class)
                    .web(WebApplicationType.NONE)
                    .run("--spring.datasource.url=" + prefixoUrl + nomeBanco,
                         "--spring.config.import=classpath:application-test.properties",
                         "--ADMIN_BOOTSTRAP_PASSWORD=senha-do-teste-de-banco-vazio")) {

                assertTrue(contexto.getBean(UsuarioRepository.class).existsByRoleIgnoreCase("ADMIN"),
                        "AdminInitializer deveria ter criado o admin de bootstrap");
                assertEquals(4, contexto.getBean(MaquinaRepository.class).count(),
                        "MaquinaDataInitializer deveria ter cadastrado as 4 máquinas");
                assertTrue(contexto.getBean(ClienteRepository.class).count() > 0,
                        "DataSeeder deveria ter semeado clientes depois do admin e das máquinas");
            }
        } finally {
            executarNoServidor(prefixoUrl, usuario, senha, "DROP DATABASE IF EXISTS " + nomeBanco + " WITH (FORCE)");
        }
    }

    private static void executarNoServidor(String prefixoUrl, String usuario, String senha, String sql)
            throws SQLException {
        try (Connection conexao = DriverManager.getConnection(prefixoUrl + "postgres", usuario, senha);
                Statement comando = conexao.createStatement()) {
            comando.execute(sql);
        }
    }
}
