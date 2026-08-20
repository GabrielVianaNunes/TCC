package com.zeiss.pilot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zeiss.pilot.dto.UsuarioDTO;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private static final String CARGO_ESTAGIARIO = "ESTAGIARIO";
    private static final String CARGO_TECNICO = "TECNICO";
    private static final String CARGO_GESTOR = "GESTOR";
    private static final String CARGO_DIRETOR_CEM = "DIRETOR_CEM";
    private static final String ROLE_GESTOR = "GESTOR";

    private final UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioDTO criarUsuario(Usuario usuario, Usuario chamador) {
        verificarEscopoGestor(chamador, usuario.getCargo());
        usuario.setRole(derivarRole(usuario.getCargo()));

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

    public UsuarioDTO atualizarUsuario(Long id, Usuario usuarioAtualizado, Usuario chamador) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        verificarEscopoGestor(chamador, existente.getCargo());
        if (usuarioAtualizado.getCargo() != null) {
            verificarEscopoGestor(chamador, usuarioAtualizado.getCargo());
        }

        existente.setNome(usuarioAtualizado.getNome());
        existente.setEmail(usuarioAtualizado.getEmail());

        if (usuarioAtualizado.getCargo() != null) {
            existente.setCargo(usuarioAtualizado.getCargo());
            existente.setRole(derivarRole(usuarioAtualizado.getCargo()));
        }

        if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isBlank()) {
            existente.setSenha(passwordEncoder.encode(usuarioAtualizado.getSenha()));
        }

        Usuario salvo = usuarioRepository.save(existente);
        return toDTO(salvo);
    }

    public void deletarUsuario(Long id, Usuario chamador) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        verificarEscopoGestor(chamador, existente.getCargo());
        usuarioRepository.deleteById(id);
    }

    private String derivarRole(String cargo) {
        if (CARGO_ESTAGIARIO.equalsIgnoreCase(cargo)) {
            return "ESTAGIARIO";
        }
        if (CARGO_TECNICO.equalsIgnoreCase(cargo)) {
            return "TECNICO";
        }
        if (CARGO_GESTOR.equalsIgnoreCase(cargo)) {
            return "GESTOR";
        }
        if (CARGO_DIRETOR_CEM.equalsIgnoreCase(cargo)) {
            return "ADMIN";
        }
        return "CLIENTE";
    }

    private void verificarEscopoGestor(Usuario chamador, String cargoAlvo) {
        if (!ROLE_GESTOR.equalsIgnoreCase(chamador.getRole())) {
            return;
        }
        // Gestor gerencia quem está abaixo dele na hierarquia (Estagiário e
        // Técnico), nunca outro Gestor ou Diretor — isso continua exclusivo do Admin.
        boolean cargoPermitido = CARGO_ESTAGIARIO.equalsIgnoreCase(cargoAlvo) || CARGO_TECNICO.equalsIgnoreCase(cargoAlvo);
        if (!cargoPermitido) {
            throw new AccessDeniedException("Gestor só pode gerenciar usuários com cargo Estagiário ou Técnico.");
        }
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
