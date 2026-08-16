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
- [Segurança](#segurança)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Contribuindo](#contribuindo)
- [Regras do projeto](CONTRIBUTING.md)

## Stack

- **Backend:** Java 21 + Spring Boot 3.4 (Web, Data JPA, Security, Actuator)
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

O banco tem backup automatizado diário (`pg_dump -Fc` + upload para storage S3-compatível + retenção configurável), rodando dentro do próprio app — sem depender de cron do host. Configuração e passo a passo de restauração (já validado ao vivo) em [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Módulos principais

| Módulo | Descrição |
|---|---|
| **Máquinas** | Cadastro de equipamentos, agendamento, manutenção e documentos por máquina |
| **Amostras** | Controle de amostras recebidas para análise/calibração |
| **Almoxarifado** | Itens e movimentações de estoque |
| **Estagiários** | Cadastro, notas, dashboard e quadro Kanban de estagiários |
| **Visitas Técnicas** | Agendamento e acompanhamento de visitas ao CEM |
| **Verificação Ambiental** | Registro de condições ambientais do laboratório |
| **Eventos / Editais / Projetos** | Gestão de eventos, editais e projetos do centro |
| **Avaliação (NPS)** | Formulário público de satisfação com dashboard de respostas |
| **Documentos** | Upload e organização de PDFs e documentos por pasta/máquina |
| **Usuários** | Autenticação (Spring Security) e controle de acesso por papel (`ADMIN`) |

## Segurança

Autenticação via formulário (Spring Security), com senhas armazenadas com `DelegatingPasswordEncoder`. Endpoints sob `/api/usuarios/**` e operações administrativas (cadastro de eventos, documentos, etc.) exigem papel `ADMIN`. O endpoint de envio de avaliação (`POST /api/avaliacoes`) é público, para permitir respostas via QR code sem login.

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

O repositório de desenvolvimento é `origin` ([GabrielVianaNunes/TCC](https://github.com/GabrielVianaNunes/TCC)). Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `chore`, `docs`), com mensagens descritivas sobre o que mudou e por quê.

Antes de contribuir, veja [CONTRIBUTING.md](CONTRIBUTING.md) para as regras de git/segurança e as convenções de código adotadas no projeto.
