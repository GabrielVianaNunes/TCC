package com.zeiss.pilot.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zeiss.pilot.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);  
}
