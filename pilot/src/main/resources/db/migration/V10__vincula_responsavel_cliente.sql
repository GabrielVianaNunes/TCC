-- Amostra: "Recebido Por" e "Cliente/Empresa" passam a poder vincular a
-- Usuario/Cliente reais, mantendo as colunas de texto legado como estão
-- (autopreenchidas pelo sistema a partir de agora, não mais digitadas).
ALTER TABLE amostras ADD COLUMN responsavel_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE amostras ADD COLUMN cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL;
CREATE INDEX idx_amostras_responsavel_id ON amostras(responsavel_id);
CREATE INDEX idx_amostras_cliente_id ON amostras(cliente_id);

-- VisitaTecnica: "Responsável" e "Empresa" (quando for visita a cliente).
ALTER TABLE visitas_tecnicas ADD COLUMN responsavel_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE visitas_tecnicas ADD COLUMN cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL;
CREATE INDEX idx_visitas_tecnicas_responsavel_id ON visitas_tecnicas(responsavel_id);
CREATE INDEX idx_visitas_tecnicas_cliente_id ON visitas_tecnicas(cliente_id);

-- Evento: "Responsável" vira vínculo real; "Horário" vira obrigatório de
-- verdade no banco (não só em validação de formulário/backend).
ALTER TABLE eventos ADD COLUMN responsavel_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL;
CREATE INDEX idx_eventos_responsavel_id ON eventos(responsavel_id);
UPDATE eventos SET horario = '00:00' WHERE horario IS NULL;
ALTER TABLE eventos ALTER COLUMN horario SET NOT NULL;
