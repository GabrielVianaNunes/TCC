# Zeiss-Pilot — CEM SENAI Zeiss

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-blue)
![License](https://img.shields.io/badge/license-see%20LICENSE-lightgrey)

Sistema de gestão para o Centro de Excelência em Metrologia (CEM) do SENAI Zeiss: controle de máquinas e calibrações, amostras, almoxarifado, estagiários, visitas técnicas, eventos, documentos e avaliações de satisfação (NPS).

## Sumário

- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Executando](#executando)
- [Build](#build)
- [Testes](#testes)
- [Backup e restauração](#backup-e-restauração)
- [Módulos principais](#módulos-principais)
- [Idiomas (i18n)](#idiomas-i18n)
- [Tema claro/escuro](#tema-claroescuro)
- [Segurança](#segurança)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Contribuindo](#contribuindo)
- [Regras do projeto](CONTRIBUTING.md)

## Stack

- **Backend:** Java 21 + Spring Boot 3.4 (Web, Data JPA, Security, Actuator, Validation)
- **Banco de dados:** PostgreSQL
- **Frontend:** Thymeleaf (server-side) + HTML/CSS/JS estático (sem framework SPA)
- **Build:** Maven (via wrapper `mvnw` / `mvnw.cmd`)

## Pré-requisitos

- JDK 21
- PostgreSQL em execução localmente (ou acessível via rede)
- Maven (opcional — o projeto inclui o Maven Wrapper)

## Configuração

1. Crie o banco de dados:

   ```sql
   CREATE DATABASE senai_zeiss;
   ```

2. `application.properties` contém credenciais locais e **não é versionado** (está no `.gitignore`). Copie o template e ajuste os valores:

   ```bash
   cp pilot/src/main/resources/application.properties.example pilot/src/main/resources/application.properties
   ```

   As credenciais do banco são lidas de variáveis de ambiente, com fallback para valores padrão de desenvolvimento local:

   | Variável | Padrão (dev local) |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://localhost:5432/senai_zeiss` |
   | `DB_USERNAME` | `postgres` |
   | `DB_PASSWORD` | *(defina a sua — não há senha real versionada)* |
   | `SERVER_PORT` | `8090` |

   Para sobrescrever, defina as variáveis antes de iniciar a aplicação:

   ```bash
   export DB_URL=jdbc:postgresql://localhost:5432/senai_zeiss
   export DB_USERNAME=postgres
   export DB_PASSWORD=<sua_senha>
   ```

   > O schema é gerenciado por migrações Flyway (`spring.jpa.hibernate.ddl-auto=validate`) — ver seção [Migrações de banco (Flyway)](#migrações-de-banco-flyway) abaixo.

3. A aplicação sobe por padrão na porta `8090`.

### Primeiro acesso

Na primeira subida da aplicação com um banco vazio (nenhum usuário com papel `ADMIN` cadastrado), um usuário `admin@zeiss.com` com papel `ADMIN` é criado automaticamente:

- Se a variável `ADMIN_BOOTSTRAP_PASSWORD` estiver definida, essa é a senha do admin.
- Se não estiver definida, uma senha aleatória é gerada e impressa **uma única vez** no log de inicialização — copie-a dali para o primeiro login.

Isso só acontece se nenhum usuário com papel `ADMIN` já existir no banco; reiniciar a aplicação depois do primeiro admin criado não gera um novo.

### Migrações de banco (Flyway)

O schema é versionado com [Flyway](https://flywaydb.org/) — os arquivos ficam em `pilot/src/main/resources/db/migration/`. `spring.jpa.hibernate.ddl-auto=validate` está configurado para o Hibernate só conferir o schema, nunca alterá-lo.

Para criar uma nova migração, adicione um arquivo `V{N}__descricao_em_snake_case.sql` (incrementando `N` a partir da última migração existente) com o SQL da mudança. Nunca edite uma migração já aplicada — sempre crie uma nova.

Migrações também são usadas para **correção pontual de dados legados**, não só para mudança de schema (ex.: `V4` corrige um valor com casa decimal errada, `V5` remove um registro de teste vazio). Nesses casos, escreva o `WHERE` pela condição que caracteriza o problema, não pelo id — assim a migração é segura em qualquer ambiente, inclusive num banco onde aquela linha não exista.

## Executando

```bash
cd pilot
./mvnw spring-boot:run        # Linux/macOS
./mvnw.cmd spring-boot:run     # Windows
```

Acesse: [http://localhost:8090](http://localhost:8090)

## Build

```bash
cd pilot
./mvnw clean package
java -jar target/pilot-0.0.1-SNAPSHOT.jar
```

## Testes

A suíte roda contra um banco Postgres real dedicado (`senai_zeiss_test`), sem mocks — não usa H2 nem outro banco em memória. Antes de rodar os testes pela primeira vez, crie o banco:

```sql
CREATE DATABASE senai_zeiss_test;
```

O Flyway migra o schema automaticamente na primeira execução. Rodar a suíte:

```bash
cd pilot
./mvnw test          # roda os 105 testes
./mvnw verify         # roda os testes + checagem de cobertura mínima (JaCoCo)
```

`mvn verify` falha se a cobertura de linha cair abaixo de **35%** no projeto como um todo ou **30%** no pacote `service` — um piso contra regressão, não uma meta final. Veja [CONTRIBUTING.md](CONTRIBUTING.md#cobertura-de-testes) para os detalhes e a meta de longo prazo.

## Backup e restauração

O sistema tem backup automatizado diário do banco (`pg_dump -Fc`) e dos documentos anexados (compactados em `.zip`), ambos cifrados com AES-256-GCM antes do upload para storage S3-compatível, com retenção configurável — rodando dentro do próprio app, sem depender de cron do host. Configuração e passo a passo de restauração (já validado ao vivo) em [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Módulos principais

| Módulo | Descrição |
|---|---|
| **Máquinas** | Cadastro de equipamentos, agendamento, manutenção e documentos por máquina; cada Ordem de Serviço escolhe uma máquina e, em seguida, um tipo de serviço do catálogo real da Zeiss para a categoria daquela máquina (CMM, multissensor óptico ou tomografia computadorizada), em vez de texto livre |
| **Clientes** | Cadastro de clientes (nome, CPF/CNPJ único, endereço, telefone, e-mail) com dashboard de ranking de receita por mês/ano; toda Ordem de Serviço se vincula a um cliente cadastrado, em vez de texto livre |
| **Amostras** | Controle de amostras recebidas para análise/calibração |
| **Almoxarifado** | Itens e movimentações de estoque |
| **Estagiários** | Cadastro, notas, dashboard e quadro Kanban de atividades — de Estagiários, Técnicos e Gestores, cada papel vendo só o que tem permissão |
| **Visitas Técnicas** | Agendamento e acompanhamento de visitas ao CEM |
| **Verificação Ambiental** | Registro de condições ambientais do laboratório |
| **Eventos / Editais / Projetos** | Gestão de eventos, editais e projetos do centro |
| **Avaliação (NPS)** | Formulário público de satisfação com dashboard de respostas |
| **Documentos** | Upload e organização de PDFs e documentos por pasta/máquina |
| **Usuários** | Autenticação (Spring Security) e controle de acesso por papel (`ADMIN`, `GESTOR`, `TECNICO`, `ESTAGIARIO`) |

## Idiomas (i18n)

A interface está disponível em **português (pt-BR), inglês e alemão**. O seletor fica na barra superior das telas internas e também na própria tela de login — ou seja, dá para escolher o idioma **antes de entrar** no sistema. A escolha é gravada em `localStorage` (`zeiss_lang`) e **permanece valendo** dali em diante — entre páginas, depois do login, após recarregar e mesmo depois de sair — até que o próprio usuário escolha outro idioma.

O sistema **não envia e-mails** (não há dependência de mail, `JavaMailSender` nem configuração SMTP), então não existe conteúdo de e-mail a traduzir. As notificações são as do sino, renderizadas no próprio navegador e já traduzidas. Se um dia forem adicionados e-mails automáticos (o candidato natural é o job de documentos vencendo), a tradução deles terá de ser feita no servidor — o `i18n.js` só atua no cliente.

A tradução é feita no cliente por `static/js/i18n.js`, que percorre os nós de texto da página e troca qualquer string reconhecida pelo dicionário — não é preciso marcar cada elemento com `data-i18n`.

**O que é traduzido e o que não é:**

| Traduzido | Não traduzido (proposital) |
|---|---|
| Rótulos, títulos, botões, mensagens e textos de formulário | Nomes de clientes, empresas e pessoas |
| Valores de lista fixa (status, prioridade, categoria, tipo de documento, forma de recebimento…) | Descrições de peças, observações e notas escritas pelo usuário |
| Rótulos de eixo e categoria dos gráficos | Nomes de produtos (ATOS Q, T-SCAN Hawk 2), normas (ISO 17025, NR-12) e dados legais |

Dados **novos** entram traduzidos automaticamente quando vêm de campo de lista fixa (`<select>` ou coluna com `CHECK`), porque todo o domínio desses campos já está no dicionário. Texto livre digitado pelo usuário permanece como foi escrito — é conteúdo, não rótulo. Ao **adicionar uma opção nova** a um `<select>` (ou um valor novo a um `CHECK`), acrescente a entrada correspondente em `i18n.js`; ver [CONTRIBUTING.md](CONTRIBUTING.md#internacionalização-i18n).

## Tema claro/escuro

O sistema tem tema claro e escuro, alternado pelo botão na barra superior e **também na tela de login**. A escolha fica em `localStorage` (`zp-theme`) e acompanha o usuário entre as telas e entre sessões, como o idioma.

O tema é aplicado por um atributo `data-theme` no elemento raiz, e as cores vêm de variáveis CSS definidas em `design-system.css` — telas novas herdam os dois temas automaticamente desde que usem as variáveis (`var(--text-primary)`, `var(--color-surface)`…) em vez de cores fixas.

Os dois temas foram auditados contra o **WCAG AA** (mínimo de 4.5:1 para texto normal, 3:1 para texto grande), medindo o contraste de cada elemento de texto contra o fundo real: 15 telas × 2 temas, sem falhas. Ao criar tela nova, note que existem **duas famílias de token de cor**: `--color-danger` e companhia são para *preencher* (fundo de botão, ponto de badge), enquanto `--color-danger-text` e companhia são para *texto*, com um valor por tema. Ver [CONTRIBUTING.md](CONTRIBUTING.md#tema-claroescuro).

## Segurança

Autenticação via formulário (Spring Security), com senhas armazenadas com `DelegatingPasswordEncoder`. Endpoints sob `/api/usuarios/**` e operações administrativas (cadastro de eventos, documentos, etc.) exigem papel `ADMIN`. O endpoint de envio de avaliação (`POST /api/avaliacoes`) é público, para permitir respostas via QR code sem login. Documentos gerais do laboratório (certificados/laudos, `/api/documentos/**`) são de acesso **exclusivo do Admin** — Gestor, Técnico e Estagiário não têm acesso, nem via API nem via UI (diferente dos documentos por máquina, abertos a quem já tinha acesso à máquina).

**Hierarquia de papéis:** `ESTAGIARIO` < `TECNICO` < `GESTOR` < `ADMIN` (Diretor do CEM). Um Gestor cria/gerencia Estagiários e Técnicos, nunca outro Gestor ou Admin. Todas as atividades (Estagiário, Técnico e Gestor) vivem no mesmo quadro Kanban (`/kanban-estagiarios`), com visibilidade em cascata: Estagiário só vê as próprias; Técnico vê as próprias e todas as de Estagiário (mas nenhuma de Gestor ou de outro Técnico); Gestor vê as próprias, todas as de Técnico e todas as de Estagiário (mas nenhuma de outro Gestor); Admin vê tudo. Um Gestor pode se auto-atribuir atividade; atribuir a um Técnico é papel de Gestor/Admin; atribuir a um Gestor é só do Admin (ou do próprio Gestor, para si mesmo).

**Endurecimento de implantação:** o contêiner roda com usuário de sistema sem privilégio (não root), o log de segurança fica em `WARN` por padrão (sem detalhe de autenticação em produção), documentos anexados usam volume Docker nomeado (sobrevivem a redeploy), e o CI roda varredura de dependência vulnerável (`dependency-review-action` a cada PR + Dependabot contínuo). Detalhes e o porquê de cada escolha em [CONTRIBUTING.md](CONTRIBUTING.md#checklist-de-produção).

**Endurecimento adicional (18/08/2026):** mensagem de erro nunca expõe detalhe interno ao cliente (handler dedicado às rotas de API, páginas de erro 404/500 estáticas e genéricas), fonte servida localmente (sem CDN público), cookie de sessão com flag `Secure` em produção, e `Content-Security-Policy` (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`) em toda resposta.

**Criptografia de dado pessoal no banco:** CPF/CNPJ e endereço de `Cliente` são criptografados com AES-256-GCM (`CryptoConverter`, JPA `AttributeConverter`), de forma transparente — API e UI continuam vendo o valor em texto claro, só a coluna no Postgres guarda a versão cifrada. Duplicata de CPF/CNPJ é impedida por um índice cego (`clientes.cpf_ou_cnpj_hash`, SHA-256, `UNIQUE` no banco), já que o nonce aleatório da cifra impede `UNIQUE` na própria coluna criptografada. Requer `FIELD_ENCRYPTION_KEY` (ver [`docs/RUNBOOK.md`](docs/RUNBOOK.md)). Esses dados viveram em `servicos` até 20/08/2026, quando o cadastro de Clientes foi introduzido; as colunas legadas em `servicos` (e os *runners* de migração que as recriptografavam) foram removidas em 22/08/2026, já com todo o dado migrado para `Cliente`.

**Log de auditoria e cobertura de teste de autorização (20/08/2026):** toda escrita (`POST`/`PUT`/`PATCH`/`DELETE`) sob `/api/**` gera uma linha no logger `AUDIT` (usuário, verbo, rota, status), capturando tanto negação grosseira de `SecurityConfig` quanto de `@PreAuthorize` (`AuditLogFilter`, ver [`docs/RUNBOOK.md`](docs/RUNBOOK.md#log-de-auditoria)). `SecurityConfigTest` ganhou cobertura sistemática das regras de papel que ainda não tinham teste (`/api/usuarios/admins`, upload/edição/remoção de documentos gerais e por máquina, criação de evento).

**Normalização e validação de campos:** máscaras e validações reutilizáveis de nome, CPF/CNPJ (dígito verificador mod-11 real) e telefone — `window.Mask`/`window.Valid` em `ui.js` no frontend, anotações Bean Validation (`@Nome`, `@CpfOuCnpj`, `@Telefone`, pacote `com.zeiss.pilot.validation`) no backend (infraestrutura, 23/08/2026). Ligado nos formulários de Clientes, Usuários e Serviços (23/08/2026), Visitas Técnicas, Editais e Projetos (23/08/2026), Almoxarifado (23/08/2026) e Máquinas — Sessão/Uso, Manutenção e Agendamento (23/08/2026) — cada tela também ganhou checagem de obrigatoriedade nos campos que faziam sentido de negócio ser obrigatórios mas não tinham nenhuma garantia real (ex.: `cargo` de Usuário virava `CLIENTE` silenciosamente se viesse em branco; várias telas tinham coluna `NOT NULL` no banco sem `required` no HTML nem checagem no backend; movimentação de estoque do Almoxarifado tratava qualquer `tipo` não reconhecido como saída, decrementando estoque silenciosamente). Ainda falta Amostras.

## Estrutura do repositório

```
pilot/
  src/main/java/com/zeiss/pilot/
    controller/   # endpoints REST e páginas Thymeleaf
    service/      # regras de negócio
    repository/   # acesso a dados (Spring Data JPA)
    entity/       # entidades JPA
    dto/          # objetos de transferência
    security/     # configuração de autenticação/autorização
    config/       # inicializadores e configurações gerais
  src/main/resources/
    templates/    # páginas Thymeleaf
    static/       # JS, CSS e assets
docs/             # documentação adicional
```

## Contribuindo

Projeto desenvolvido por:

- João Vítor Mamede
- Thiago Matheus Pinheiro
- Gabriel Viana Nunes

Todos os direitos são reservados aos três autores — ver [LICENSE](LICENSE) para os termos completos (em português, inglês e alemão), incluindo o uso acadêmico concedido ao SENAI FATESG.

O repositório de desenvolvimento é `origin` ([GabrielVianaNunes/TCC](https://github.com/GabrielVianaNunes/TCC)). Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `chore`, `docs`), com mensagens descritivas sobre o que mudou e por quê.

Antes de contribuir, veja [CONTRIBUTING.md](CONTRIBUTING.md) para as regras de git/segurança e as convenções de código adotadas no projeto.
