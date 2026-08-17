-- Registro legado de avaliação totalmente vazio (sem data, sem vínculo, sem
-- comentário, nps = 0), provavelmente de um teste manual do formulário público.
-- Como o campo `data` é nulo, o dashboard criava um grupo de ano "1969"
-- (epoch zero) no seletor, além de contar um detrator inexistente.
DELETE FROM avaliacoes
WHERE nps = 0
  AND (data IS NULL OR data = '')
  AND (vinculo IS NULL OR vinculo = '')
  AND (comentario IS NULL OR comentario = '')
  AND (desc_servico IS NULL OR desc_servico = '')
  AND (realizou_servico IS NULL OR realizou_servico = '')
  AND (tipo_comentario IS NULL OR tipo_comentario = '');
