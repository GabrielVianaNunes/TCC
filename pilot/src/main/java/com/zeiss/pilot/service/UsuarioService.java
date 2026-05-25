package com.zeiss.pilot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.UsuarioDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UsuarioDTO criarUsuario(Usuario usuario) {
        // Derive security role from organizational cargo
        if (usuario.getCargo() != null && !usuario.getCargo().equalsIgnoreCase("ESTAGIARIO")) {
            usuario.setRole("ADMIN");
        } else {
            usuario.setRole("CLIENTE");
        }

        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new IllegalArgumentException("Senha obrigatória para criar usuário");
        }
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        Usuario salvo = usuarioRepository.save(usuario);
        return toDTO(salvo);
    }
    

    public List<UsuarioDTO> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO atualizarUsuario(Long id, Usuario usuarioAtualizado) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        existente.setNome(usuarioAtualizado.getNome());
        existente.setEmail(usuarioAtualizado.getEmail());

        if (usuarioAtualizado.getCargo() != null) {
            existente.setCargo(usuarioAtualizado.getCargo());
            String derivedRole = "ESTAGIARIO".equalsIgnoreCase(usuarioAtualizado.getCargo()) ? "CLIENTE" : "ADMIN";
            existente.setRole(derivedRole);
        }

        if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isBlank()) {
            existente.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
        }

        Usuario salvo = usuarioRepository.save(existente);
        return toDTO(salvo);
    }

    public void deletarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setRole(usuario.getRole());
        dto.setCargo(usuario.getCargo());
        dto.setDataCriacao(usuario.getDataCriacao());
        return dto;
    }

    public List<UsuarioDTO> listarUsuariosPorRole(String role) {
        return usuarioRepository.findAll()
                .stream()
                .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase(role))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }    

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o email: " + email));
    }    
    
}
