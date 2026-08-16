ALTER TABLE servicos DROP COLUMN data_execucao_prevista;
ALTER TABLE servicos DROP COLUMN data_execucao_realizada;
ALTER TABLE servicos ALTER COLUMN cpf_ou_cnpj DROP NOT NULL;
ALTER TABLE servicos ALTER COLUMN endereco DROP NOT NULL;
ALTER TABLE servicos ALTER COLUMN tecnico_responsavel DROP NOT NULL;
