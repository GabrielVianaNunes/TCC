// package com.zeiss.pilot.config;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.crypto.password.PasswordEncoder;

// import com.zeiss.pilot.entity.Usuario;
// import com.zeiss.pilot.repository.UsuarioRepository;

// import jakarta.annotation.PostConstruct;

// @Configuration
// public class AdminInitializer {

//     @Autowired
//     private UsuarioRepository usuarioRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @PostConstruct
//     public void initAdmin() {
//         if (usuarioRepository.findByEmail("admin@zeiss.com").isEmpty()) {
//             Usuario admin = new Usuario();
//             admin.setNome("Administrador");
//             admin.setEmail("admin@zeiss.com");
//             admin.setRole("ADMIN");
//             admin.setSenha(passwordEncoder.encode("teste123"));
//             usuarioRepository.save(admin);
//             System.out.println("Usuário ADMIN criado com sucesso!");
//         }
//     }
// }
