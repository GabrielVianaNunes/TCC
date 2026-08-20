-- O quadro Kanban (kanban_cards) passa a aceitar também atividades de
-- Técnico e Gestor, não só de Estagiário. Um card pertence a um Estagiário
-- (estagiaria_id, como já era) OU a um usuário Técnico/Gestor (usuario_id,
-- novo) — os dois são mutuamente exclusivos por construção da aplicação,
-- não há CHECK aqui porque estagiaria_id nunca teve FK própria (ver V1).
ALTER TABLE kanban_cards ADD COLUMN usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE kanban_cards ADD COLUMN atribuido_por_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX idx_kanban_cards_usuario_id ON kanban_cards(usuario_id);

-- Liga cada estagiário rastreado (estagiarios) à conta de login correspondente
-- (usuarios) — necessário para um Estagiário autenticado só ver as próprias
-- atividades no Kanban. Preenchido para os registros já existentes casando
-- por e-mail (mesmo valor nas duas tabelas, confirmado antes desta migração).
ALTER TABLE estagiarios ADD COLUMN usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL;

UPDATE estagiarios e
SET usuario_id = u.id
FROM usuarios u
WHERE u.email = e.email AND u.role = 'ESTAGIARIO';

CREATE INDEX idx_estagiarios_usuario_id ON estagiarios(usuario_id);
