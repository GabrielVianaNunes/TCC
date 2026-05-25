package com.zeiss.pilot.security;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("Tentando autenticar usuário com email: " + email); // 👈 LOG IMPORTANTE

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("Usuário não encontrado com email: " + email); // 👈 SE NÃO ENCONTRAR
                    return new UsernameNotFoundException("Usuário não encontrado com o email: " + email);
                });

        System.out.println("Usuário encontrado: " + usuario.getEmail() + " | Role: " + usuario.getRole()); // 👈 SE ENCONTRAR

        return new org.springframework.security.core.userdetails.User(
                usuario.getEmail(),
                usuario.getSenha(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + usuario.getRole()))
        );
    }
}
