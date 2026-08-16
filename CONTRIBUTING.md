# Regras do projeto — CEM SENAI Zeiss (Zeiss-Pilot)

Este documento reúne as regras de git/segurança e as convenções de código já adotadas no projeto, para que qualquer pessoa que abra o repositório (incluindo avaliação futura do TCC) entenda rapidamente como ele é organizado e por quê.

## Git e segurança

### Repositório oficial

O único remote de desenvolvimento é `origin`, apontando para [GabrielVianaNunes/TCC](https://github.com/GabrielVianaNunes/TCC). Este repositório não tem histórico compartilhado com nenhum outro fork ou repositório anterior do projeto.

### Padrão de commit

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `refactor`, `chore`, `docs`, `security`, com mensagem descritiva sobre o que mudou e por quê (não só o quê).

```
feat: adiciona endpoint de listagem de documentos por subpasta
fix: corrige cálculo de status de amostra vencida
refactor: extrai RelatorioController dos controllers de Evento/Serviço
docs: atualiza README com passo de configuração do banco
```

### Credenciais nunca são versionadas

- Nenhuma senha, usuário ou token real deve aparecer em qualquer arquivo commitado — nem mesmo como valor de fallback (`${DB_PASSWORD:senha_real}` é proibido; use `${DB_PASSWORD:changeme}` ou exija a variável sem fallback).
- `pilot/src/main/resources/application.properties` é local e **não é versionado** (`pilot/.gitignore`). Use `application.properties.example` como referência e copie para configurar seu ambiente:
  ```bash
  cp pilot/src/main/resources/application.properties.example pilot/src/main/resources/application.properties
  ```
- Se uma credencial real acabar sendo commitada por engano, não basta parar de rastrear o arquivo dali pra frente — é preciso reescrever o histórico (`git filter-repo`) e rotacionar a credencial exposta, porque ela continua acessível em qualquer commit antigo até esse ponto.

### O que fica fora do repositório (`.gitignore` da raiz)

**Regra geral:** qualquer coisa que seja informação de segurança/sigilosa (credenciais, dados pessoais), ou que seja ferramental/acompanhamento interno do desenvolvimento sem valor como entregável do projeto, entra no `.gitignore` — nunca vai para o GitHub, mesmo que pareça inofensivo.

Hoje isso cobre:
- `graphify-out/`, `.claude/`, `CLAUDE.md` — grafo de conhecimento e configuração de assistente de IA.
- `PROJECT_STATUS.md` — documento de acompanhamento interno, não entregável do projeto.
- `docs/superpowers/` — specs e planos de implementação gerados durante desenvolvimento assistido por IA; `.superpowers/sdd/` — artefatos de execução (briefs de tarefa, relatórios de subagente, pacotes de diff de revisão).

Ao criar um arquivo novo, pergunte: "isso é algo que o orientador/banca/qualquer pessoa clonando o repo precisa ver?" Se a resposta for não, ele vai no `.gitignore`. Na dúvida, trate como sigiloso/desnecessário até decidir o contrário — é mais fácil versionar depois do que remover do histórico já publicado (ver seção "Credenciais nunca são versionadas" acima sobre o custo de corrigir isso depois).

**Limpeza de documentos de processo:** specs (`docs/superpowers/specs/`) e planos (`docs/superpowers/plans/`) de uma etapa já concluída e mesclada devem ser apagados depois que o resumo dela entrar no "Histórico" do `PROJECT_STATUS.md` — não vale a pena mantê-los como arquivo à parte, e eles inflam o grafo do `graphify` com nós de ruído (títulos de seção genéricos tipo "Self-review"/"Preocupações"/"Commit" viram nós "isolados" sem relação real com o código). O mesmo vale para `.superpowers/sdd/` — briefs, relatórios de subagente e diffs de revisão são artefatos de execução de uma tarefa específica, não histórico a preservar; apague-os ao final de cada rodada, mantendo só `.superpowers/sdd/progress.md` (o ledger contínuo). Depois de qualquer limpeza desses arquivos, rode `graphify update .` de novo.

## Convenções de código do backend

### Arquitetura em camadas

Toda funcionalidade nova segue a mesma separação, sem pular camadas:

```
Controller (REST)  →  Service (regra de negócio)  →  Repository (Spring Data JPA)  →  Entity
                                    ↓
                                   DTO (nunca expor Entity direto na resposta da API)
```

Controllers não acessam Repository diretamente, e não deve haver regra de negócio dentro do Controller — isso vai para o Service.

### Rotas REST

- Todo controller de recurso usa `@RequestMapping("/api/[recurso-no-plural]")` (ex.: `/api/projetos`, `/api/visitas-tecnicas`, `/api/kanban-cards`).
- Sub-recursos aninhados usam o padrão `/api/[recurso-pai]/{id}/[sub-recurso]` (ex.: `/api/maquinas/{maquinaId}/sessoes`, `/api/maquinas/{maquinaId}/documentos`).
- Exceções documentadas e intencionais: `GET /eventos/relatorios` e `GET /servicos/relatorio-servicos/api` mantêm o path legado em `RelatorioController` por compatibilidade com o frontend já existente — não renomeie sem atualizar o frontend junto.

### Verbos HTTP: quando usar cada um

- `GET` / `GET {id}` — listagem e busca, sempre devolvendo DTO.
- `POST` — criação.
- `PUT {id}` — atualização completa do recurso (ex.: Projeto, Serviço, Edital, Usuário, Visita Técnica, Amostra).
- `PATCH {id}` — atualização parcial (ex.: mover card do Kanban, atualizar sessão/manutenção/agendamento de Máquina, atualizar Estagiário).
- **Módulos somente-registro não têm PUT/PATCH/DELETE de propósito** — Avaliação/NPS, Nota de Estagiário, Verificação Ambiental e movimentações de Almoxarifado são registros de uma vez só (não fazem sentido editar depois de enviados). Não adicione edição nesses módulos sem antes confirmar que a regra de negócio mudou.

### DTOs

Toda resposta de API usa DTO, nunca a Entity diretamente. O padrão adotado é `DTO.fromEntity(entity)` / `dto.toEntity()` para conversão — siga esse padrão em DTOs novos em vez de expor os setters da Entity no controller.

**`status` (e campos parecidos) tem vocabulário fixo por módulo — não presuma que um valor válido em um módulo vale em outro.** Vários módulos têm uma coluna `status` com `CHECK` constraint própria no banco (ex.: `Projeto.status` é ciclo de vida de projeto — "A iniciar", "Em andamento", "Concluído"...; `Servico.status` é funil comercial — "1º Contato", "Elaboração de proposta", "Venda finalizada"...). São vocabulários **diferentes e não intercambiáveis**, mesmo com nome de coluna idêntico. Antes de escrever um teste de integração ou popular dados para um módulo, confira o `CHECK` real da tabela (`V1__baseline.sql`, buscando `_status_check`) em vez de reaproveitar um valor visto em outro módulo.

**Endpoint de listagem paginado (`Page<T>`) vs. lista simples (`List<T>`) — confira o contrato antes de consumir no frontend.** A maioria dos controllers `GET` de listagem devolve `List<T>` direto (ex.: `/api/projetos`, `/api/visitas-tecnicas`, `/api/documentos`), mas alguns devolvem `Page<T>` paginado com `{content, totalElements, ...}` (ex.: `/api/servicos`, `/api/amostras`). Código de frontend genérico que espera um formato fixo pra todo endpoint (ex.: um card de KPI reaproveitado pra vários módulos) quebra silenciosamente contra o outro formato — `data.totalElements` é `undefined` num array puro, sem lançar erro. Ver `PROJECT_STATUS.md`, Histórico 2026-08-16, para o bug real que isso causou (cards de KPI do Dashboard Executivo sempre mostrando 0).

### Tratamento de erro

Erros são centralizados em `GlobalExceptionHandler` (`@RestControllerAdvice`). Não adicione blocos `try/catch` genéricos em controllers só para formatar resposta de erro — deixe a exceção subir e trate lá, a menos que o erro exija uma resposta HTTP muito específica daquele endpoint.

### Segurança

Regras de autorização ficam centralizadas em `SecurityConfig` (matchers por rota/verbo), não espalhadas em `@PreAuthorize` por controller, exceto quando o próprio endpoint precisa (ex.: upload de documento). Rotas públicas (sem login) são exceção documentada e explícita — hoje são `/login`, `/avaliacao`, `/qrcode-avaliacao` e `POST /api/avaliacoes`, para permitir o fluxo de avaliação via QR code sem autenticação. Qualquer nova rota pública precisa de justificativa equivalente.

### Migrações de banco

Toda mudança de schema (nova tabela, nova coluna, alteração de tipo) precisa de uma migração Flyway em `pilot/src/main/resources/db/migration/`, nomeada `V{N}__descricao_em_snake_case.sql` — nunca edite uma migração já aplicada, sempre crie uma nova. `ddl-auto=validate` vai barrar a subida da aplicação se uma entidade não bater com o schema, então crie a migração antes de mudar a entidade correspondente.

**Coluna do banco sem mapeamento na Entity não gera erro — falha silenciosa em runtime.** Como o `V1__baseline.sql` foi gerado via `pg_dump --schema-only` de um banco com dados legados, algumas colunas `NOT NULL` (sem `DEFAULT`) ficaram sem `@Column` correspondente em nenhuma Entity — isso não quebra a compilação nem `ddl-auto=validate` (que só reclama de coluna que a Entity espera e o banco não tem, nunca o contrário), só quebra em runtime, com `DataIntegrityViolation`, na primeira tentativa de `INSERT`. Foi assim que `Servico.codigo_os` ficou anos sem mapeamento — `POST /api/servicos` falhava sempre, e ninguém percebeu porque a rota nunca tinha sido exercitada de ponta a ponta (ver `PROJECT_STATUS.md`, Histórico 2026-08-16). Ao adicionar uma Entity nova ou revisar uma existente, confira as colunas `NOT NULL` reais da tabela (`\d+ tabela` no `psql`, ou grep no `V1__baseline.sql`) contra os campos mapeados — não confie só na compilação.

### Cobertura de testes

O projeto usa JaCoCo (`pilot/pom.xml`) para travar contra regressão de cobertura — `mvn verify` falha se a cobertura de linha cair abaixo de:
- **35%** no projeto como um todo.
- **30%** no pacote `com.zeiss.pilot.service` (camada de regra de negócio, por isso tem uma trava própria além da geral).

Esses números são um **piso**, não uma meta — foram calibrados com margem abaixo da cobertura real no momento em que a regra foi criada (~40% geral, ~37% em `service`), só para impedir que a cobertura regrida (ex.: remover um teste sem perceber, ou adicionar bastante código novo sem teste). `mvn test` continua funcionando normalmente sem essa checagem; só `mvn verify` (e portanto qualquer pipeline de CI futuro que rode `verify`) a aplica.

**Meta de longo prazo** (não imposta por ferramenta ainda, é o norte para onde o piso deve subir a cada rodada futura que adicionar testes de service): 70-80% em `service`, 60-70% no projeto como um todo, 50-60% em `controller` (esperado ficar mais baixo — controllers devem ser finos e delegar a lógica para o service).

Todo service ou endpoint novo deveria vir acompanhado de teste — mesmo sem uma meta alta imposta hoje, é assim que o piso sobe organicamente em vez de regredir.

### Frontend

Páginas novas seguem o padrão modular já estabelecido: um template Thymeleaf em `templates/`, carregando `i18n.js` + `core.js` + `api.js` + `ui.js` + `modules/notifications.js` + um módulo próprio em `static/js/modules/[pagina].js`. Não crie arquivos JS soltos na raiz de `static/js/` (esse era o padrão antigo, já descontinuado — ver `PROJECT_STATUS.md` para a lista de arquivos legados pendentes de remoção).
