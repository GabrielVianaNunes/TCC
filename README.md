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

   > As tabelas são criadas/atualizadas automaticamente na inicialização (`spring.jpa.hibernate.ddl-auto=update`).

3. A aplicação sobe por padrão na porta `8090`.

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
