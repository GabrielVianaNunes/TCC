-- O registro legado OS-LEGACY-4 (cliente WEG) tinha valor = 54623086.75,
-- três ordens de grandeza acima de qualquer outro serviço na base (erro de
-- casa decimal). Corrige para a escala correta.
UPDATE servicos SET valor = 54623.09 WHERE codigo_os = 'OS-LEGACY-4';
