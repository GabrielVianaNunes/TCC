package com.zeiss.pilot.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

class AdminInitializerTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private final ByteArrayOutputStream logCapture = new ByteArrayOutputStream();
    private PrintStream originalOut;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        when(passwordEncoder.encode(anyString())).thenAnswer(inv -> "ENC(" + inv.getArgument(0) + ")");
        originalOut = System.out;
        System.setOut(new PrintStream(logCapture));
    }

    @AfterEach
    void tearDown() {
        System.setOut(originalOut);
    }

    @Test
    void naoCriaAdminSeJaExisteUm() {
        when(usuarioRepository.existsByRoleIgnoreCase("ADMIN")).thenReturn(true);

        AdminInitializer initializer = new AdminInitializer(usuarioRepository, passwordEncoder, "");
        initializer.initAdmin();

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criaAdminComSenhaDaVariavelDeAmbienteQuandoDefinida() {
        when(usuarioRepository.existsByRoleIgnoreCase("ADMIN")).thenReturn(false);

        AdminInitializer initializer = new AdminInitializer(usuarioRepository, passwordEncoder, "minhaSenhaSegura123");
        initializer.initAdmin();

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        Usuario admin = captor.getValue();

        assertEquals("admin@zeiss.com", admin.getEmail());
        assertEquals("Administrador", admin.getNome());
        assertEquals("ADMIN", admin.getRole());
        assertEquals("ENC(minhaSenhaSegura123)", admin.getSenha());
        verify(passwordEncoder).encode("minhaSenhaSegura123");

        String log = logCapture.toString();
        assertTrue(log.contains("ADMIN_BOOTSTRAP_PASSWORD"));
        assertFalse(log.contains("minhaSenhaSegura123"));
    }

    @Test
    void geraSenhaAleatoriaQuandoVariavelNaoDefinida() {
        when(usuarioRepository.existsByRoleIgnoreCase("ADMIN")).thenReturn(false);

        AdminInitializer initializer = new AdminInitializer(usuarioRepository, passwordEncoder, "");
        initializer.initAdmin();

        ArgumentCaptor<Usuario> userCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(userCaptor.capture());
        Usuario admin = userCaptor.getValue();

        assertEquals("admin@zeiss.com", admin.getEmail());
        assertEquals("ADMIN", admin.getRole());
        assertTrue(admin.getSenha().startsWith("ENC("));

        ArgumentCaptor<String> senhaCaptor = ArgumentCaptor.forClass(String.class);
        verify(passwordEncoder).encode(senhaCaptor.capture());
        String senhaGerada = senhaCaptor.getValue();

        assertEquals(16, senhaGerada.length());
        assertTrue(senhaGerada.matches("[A-Za-z0-9]{16}"));

        String log = logCapture.toString();
        assertTrue(log.contains(senhaGerada));
        assertTrue(log.contains("admin@zeiss.com"));
    }
}
