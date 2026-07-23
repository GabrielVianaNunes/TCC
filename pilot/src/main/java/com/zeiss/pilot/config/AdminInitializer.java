package com.zeiss.pilot.config;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

import jakarta.annotation.PostConstruct;

@Configuration
public class AdminInitializer {

    private static final String ADMIN_EMAIL = "admin@zeiss.com";
    private static final String ADMIN_NOME = "Administrador";
    private static final String PASSWORD_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int PASSWORD_LENGTH = 16;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminBootstrapPassword;

    public AdminInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String adminBootstrapPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminBootstrapPassword = adminBootstrapPassword;
    }

    @PostConstruct
    public void initAdmin() {
        if (usuarioRepository.existsByRoleIgnoreCase("ADMIN")) {
            return;
        }

        boolean senhaGerada = adminBootstrapPassword == null || adminBootstrapPassword.isBlank();
        String senha = senhaGerada ? gerarSenhaAleatoria() : adminBootstrapPassword;

        Usuario admin = new Usuario();
        admin.setNome(ADMIN_NOME);
        admin.setEmail(ADMIN_EMAIL);
        admin.setRole("ADMIN");
        admin.setSenha(passwordEncoder.encode(senha));
        usuarioRepository.save(admin);

        if (senhaGerada) {
            System.out.println("=".repeat(60));
            System.out.println("[INIT] Nenhum admin encontrado. Usuário ADMIN criado:");
            System.out.println("[INIT]   E-mail: " + ADMIN_EMAIL);
            System.out.println("[INIT]   Senha gerada (anote agora, não será exibida de novo): " + senha);
            System.out.println("[INIT]   Para definir a senha você mesmo, use a variável ADMIN_BOOTSTRAP_PASSWORD.");
            System.out.println("=".repeat(60));
        } else {
            System.out.println("[INIT] Usuário ADMIN criado com sucesso (senha definida via ADMIN_BOOTSTRAP_PASSWORD).");
        }
    }

    private String gerarSenhaAleatoria() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
