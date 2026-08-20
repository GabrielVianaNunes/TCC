package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.KanbanCardDTO;
import com.zeiss.pilot.entity.Estagiario;
import com.zeiss.pilot.entity.KanbanCard;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.EstagiarioRepository;
import com.zeiss.pilot.repository.KanbanCardRepository;
import com.zeiss.pilot.repository.UsuarioRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Quadro Kanban de atividades — cobre Estagiário (via estagiariaId, como
 * sempre foi), Técnico e Gestor (via usuarioId, novo). Regra de visibilidade
 * (pedida explicitamente pelo usuário, não é suposição):
 *
 * <p>Admin vê tudo. Gestor vê as próprias atividades (não as de outro
 * Gestor), todas as de Técnico e todas as de Estagiário. Técnico vê as
 * próprias (não as de outro Técnico), todas as de Estagiário, e nenhuma de
 * Gestor. Estagiário só vê as próprias.
 */
@Service
public class KanbanCardService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_GESTOR = "GESTOR";
    private static final String ROLE_TECNICO = "TECNICO";
    private static final String ROLE_ESTAGIARIO = "ESTAGIARIO";

    private final KanbanCardRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final EstagiarioRepository estagiarioRepository;

    public KanbanCardService(KanbanCardRepository repository, UsuarioRepository usuarioRepository,
                              EstagiarioRepository estagiarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.estagiarioRepository = estagiarioRepository;
    }

    public List<KanbanCardDTO> listarVisiveisPara(Usuario chamador) {
        return repository.findAll().stream()
                .filter(c -> podeVer(chamador, c))
                .map(KanbanCardDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<KanbanCardDTO> listarPorEstagiaria(Long estagiariaId) {
        return repository.findByEstagiariaId(estagiariaId).stream()
                .map(KanbanCardDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public KanbanCardDTO salvar(KanbanCardDTO dto, Usuario chamador) {
        KanbanCard entity = dto.toEntity();
        if (dto.getUsuarioId() != null) {
            validarAtribuicao(chamador, dto.getUsuarioId());
            aplicarUsuarioAlvo(entity, dto.getUsuarioId());
            entity.setAtribuidoPor(chamador);
        }
        return KanbanCardDTO.fromEntity(repository.save(entity));
    }

    /**
     * PATCH parcial de verdade: só sobrescreve o campo que veio preenchido no
     * corpo da requisição (ex.: arrastar um card entre colunas manda só
     * {"coluna": "..."}). A versão anterior fazia dto.toEntity() com o card
     * inteiro e salvava por cima — qualquer PATCH parcial apagava título,
     * descrição, prioridade etc. (null sobrescrevendo valor real). Corrigido
     * carregando a entidade existente e só trocando o que veio no DTO.
     */
    public KanbanCardDTO atualizar(Long id, KanbanCardDTO dto, Usuario chamador) {
        KanbanCard existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card não encontrado: " + id));

        if (existente.getUsuario() != null && !podeVer(chamador, existente)) {
            throw new AccessDeniedException("Você não tem permissão para alterar esta atividade.");
        }

        if (dto.getTitulo() != null) existente.setTitulo(dto.getTitulo());
        if (dto.getDescricao() != null) existente.setDescricao(dto.getDescricao());
        if (dto.getColuna() != null) existente.setColuna(dto.getColuna());
        if (dto.getPrioridade() != null) existente.setPrioridade(dto.getPrioridade());
        if (dto.getPrazo() != null) existente.setPrazo(dto.getPrazo());
        if (dto.getTags() != null) existente.setTags(dto.getTags());
        if (dto.getCriadoPor() != null) existente.setCriadoPor(dto.getCriadoPor());

        if (dto.getEstagiariaId() != null) {
            existente.setEstagiariaId(dto.getEstagiariaId());
            existente.setUsuario(null);
            existente.setAtribuidoPor(null);
        } else if (dto.getUsuarioId() != null) {
            validarAtribuicao(chamador, dto.getUsuarioId());
            aplicarUsuarioAlvo(existente, dto.getUsuarioId());
            if (existente.getAtribuidoPor() == null) existente.setAtribuidoPor(chamador);
        }

        return KanbanCardDTO.fromEntity(repository.save(existente));
    }

    public void deletar(Long id, Usuario chamador) {
        KanbanCard existente = repository.findById(id).orElse(null);
        if (existente == null) return;
        if (existente.getUsuario() != null && !podeVer(chamador, existente)) {
            throw new AccessDeniedException("Você não tem permissão para excluir esta atividade.");
        }
        repository.deleteById(id);
    }

    private void aplicarUsuarioAlvo(KanbanCard entity, Long usuarioId) {
        Usuario alvo = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + usuarioId));
        entity.setUsuario(alvo);
        entity.setEstagiariaId(null);
    }

    /** Quem pode atribuir uma atividade a este usuário-alvo (Técnico ou Gestor). */
    private void validarAtribuicao(Usuario chamador, Long usuarioAlvoId) {
        if (usuarioAlvoId == null) {
            return; // atividade de Estagiário — sem restrição, mesmo comportamento de sempre
        }
        Usuario alvo = usuarioRepository.findById(usuarioAlvoId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + usuarioAlvoId));

        boolean chamadorEhAdmin = ROLE_ADMIN.equalsIgnoreCase(chamador.getRole());
        boolean chamadorEhGestor = ROLE_GESTOR.equalsIgnoreCase(chamador.getRole());
        boolean paraSiMesmo = chamador.getId().equals(usuarioAlvoId);

        if (ROLE_TECNICO.equalsIgnoreCase(alvo.getRole())) {
            if (!chamadorEhAdmin && !chamadorEhGestor) {
                throw new AccessDeniedException("Só Gestor ou Admin atribui atividade a um Técnico.");
            }
            return;
        }
        if (ROLE_GESTOR.equalsIgnoreCase(alvo.getRole())) {
            if (!chamadorEhAdmin && !(chamadorEhGestor && paraSiMesmo)) {
                throw new AccessDeniedException("Só Admin atribui atividade a um Gestor; um Gestor só cria atividade para si mesmo.");
            }
            return;
        }
        throw new IllegalArgumentException("O usuário informado não tem papel Técnico ou Gestor.");
    }

    private boolean podeVer(Usuario chamador, KanbanCard card) {
        if (ROLE_ADMIN.equalsIgnoreCase(chamador.getRole())) {
            return true;
        }
        if (card.getEstagiariaId() != null) {
            if (ROLE_ESTAGIARIO.equalsIgnoreCase(chamador.getRole())) {
                return estagiarioRepository.findByUsuarioId(chamador.getId())
                        .map(Estagiario::getId)
                        .map(meuId -> meuId.equals(card.getEstagiariaId()))
                        .orElse(false);
            }
            return ROLE_GESTOR.equalsIgnoreCase(chamador.getRole()) || ROLE_TECNICO.equalsIgnoreCase(chamador.getRole());
        }
        if (card.getUsuario() != null) {
            boolean ehDono = card.getUsuario().getId().equals(chamador.getId());
            String alvoRole = card.getUsuario().getRole();
            if (ROLE_TECNICO.equalsIgnoreCase(alvoRole)) {
                return ROLE_GESTOR.equalsIgnoreCase(chamador.getRole()) || ehDono;
            }
            if (ROLE_GESTOR.equalsIgnoreCase(alvoRole)) {
                return ehDono;
            }
        }
        return false;
    }
}
