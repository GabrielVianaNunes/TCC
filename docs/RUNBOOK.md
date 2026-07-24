# Runbook de operação — Zeiss-Pilot

Documento de operação do sistema, pensado tanto para o uso atual quanto para a entrega futura da operação ao time de TI do SENAI. Cobre hoje: backup automatizado e restauração (Etapa 8). Seções de deploy/hospedagem serão adicionadas quando a Etapa 9 for concluída.

## Backup automatizado

O sistema roda um backup diário do banco (`pg_dump -Fc`, formato custom do Postgres) e envia para um storage compatível com S3 (Backblaze B2, Cloudflare R2, ou qualquer outro que fale a API S3). O job roda dentro do próprio processo Java (`BackupService`, `@Scheduled`) — não depende de cron do sistema operacional nem da hospedagem escolhida.

Se as variáveis de storage não estiverem configuradas, o backup fica **desabilitado silenciosamente** (só loga um aviso) — é o comportamento esperado em desenvolvimento local.

### Configuração (variáveis de ambiente)

| Variável | Obrigatória? | Descrição |
|---|---|---|
| `BACKUP_PG_DUMP_PATH` | Só se `pg_dump` não estiver no `PATH` | Caminho completo do binário `pg_dump` |
| `BACKUP_S3_ENDPOINT` | Sim, para habilitar backup | URL do endpoint S3-compatível do provedor escolhido |
| `BACKUP_S3_BUCKET` | Sim, para habilitar backup | Nome do bucket onde os backups serão salvos |
| `BACKUP_S3_ACCESS_KEY` | Sim, para habilitar backup | Chave de acesso da conta S3 |
| `BACKUP_S3_SECRET_KEY` | Sim, para habilitar backup | Chave secreta da conta S3 |
| `BACKUP_S3_REGION` | Não (padrão `us-east-1`) | Região — a maioria dos provedores S3-compatíveis aceita qualquer valor aqui, mas exige que o campo exista |
| `BACKUP_RETENTION_DAYS` | Não (padrão `30`) | Backups mais antigos que isso são apagados automaticamente do bucket a cada execução |
| `BACKUP_CRON` | Não (padrão `0 0 3 * * *`, diariamente às 3h) | Expressão cron de quando o backup automático roda |

**Passo pendente do usuário:** criar uma conta gratuita em um provedor S3-compatível (Backblaze B2 ou Cloudflare R2 são boas opções com camada gratuita) e gerar uma chave de acesso — isso não pode ser feito por uma sessão de IA, precisa ser feito manualmente.

**Cuidado ao configurar `BACKUP_S3_*` como variável de ambiente persistente** (mesmo mecanismo já usado para `DB_PASSWORD`/`BACKUP_PG_DUMP_PATH` neste projeto): uma vez configurado, **qualquer execução do app nesta máquina passa a rodar backups reais**, e a retenção **apaga objetos reais do bucket**. Isso é seguro em produção (é o comportamento desejado), mas evite configurar isso numa máquina de desenvolvimento onde `mvn test`/`mvn verify` rodam com frequência, a menos que você queira mesmo backups reais acontecendo a cada execução.

### Disparo manual

Além do agendamento automático diário, existe um endpoint para rodar um backup sob demanda — útil antes de qualquer deploy que inclua uma migração Flyway nova:

```bash
curl -X POST https://<host>/api/backup/executar \
  -H "Cookie: <sessão de um usuário ADMIN autenticado>"
```

Requer autenticação como `ADMIN` (mesma regra de `/api/usuarios/**`). Respostas:
- `200 OK` com `{"arquivo": "senai_zeiss-backup-20260724-030000.dump"}` — backup executado com sucesso.
- `503 Service Unavailable` — variáveis `BACKUP_S3_*` não configuradas (backup desabilitado).
- `500` — falha real durante `pg_dump` ou upload (verifique os logs da aplicação para o detalhe do erro).

## Restauração de backup

Procedimento **validado ao vivo** durante a implementação da Etapa 8 (2026-07-24), restaurando um dump real de `senai_zeiss_test` num banco descartável e comparando contagem de linhas com a origem (idênticas: `maquinas`=4, `usuarios`=1, `avaliacoes`=2).

**Pré-requisito:** ter `pg_dump`/`pg_restore` instalados, **da mesma versão major do Postgres do servidor** (hoje: Postgres 16) — usar uma versão diferente de `pg_restore` pode falhar ou restaurar incorretamente.

1. Baixe o arquivo de backup (`.dump`) do bucket S3-compatível para a máquina onde a restauração vai acontecer.

2. Crie um banco novo para restaurar (nunca restaure em cima de um banco em uso sem antes fazer um backup dele também):
   ```bash
   psql -U postgres -h <host> -c "CREATE DATABASE nome_do_banco_restaurado;"
   ```

3. Restaure o dump:
   ```bash
   pg_restore -h <host> -p 5432 -U postgres -d nome_do_banco_restaurado --no-owner --no-privileges caminho/para/o/arquivo.dump
   ```
   `--no-owner --no-privileges` evita erros de permissão quando o usuário que restaura é diferente do que gerou o backup originalmente.

4. Confirme que os dados vieram corretamente comparando contagens de algumas tabelas centrais:
   ```bash
   psql -U postgres -h <host> -d nome_do_banco_restaurado -c "SELECT count(*) FROM usuarios;"
   psql -U postgres -h <host> -d nome_do_banco_restaurado -c "SELECT count(*) FROM maquinas;"
   ```

5. Se for para substituir o banco de produção de verdade (não só testar a restauração), troque a variável `DB_URL`/`DB_NAME` da aplicação para apontar pro banco restaurado (ou renomeie os bancos), e reinicie a aplicação.

## Deploy

### 1. Provisionar a VM

Crie uma conta e uma instância "Always Free" na [Oracle Cloud](https://www.oracle.com/cloud/free/) (ou hospedagem equivalente que não hiberne por inatividade). Ao criar a instância:
- Escolha uma imagem Ubuntu LTS.
- Anote o IP público da instância.
- Nas regras de rede (Security List / VCN), libere as portas `80` (HTTP) e `443` (HTTPS) para entrada — sem isso o Caddy não consegue servir nada externamente.

### 2. Instalar Docker na VM

Conecte via SSH na VM e rode:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Desconecte e reconecte o SSH para o grupo `docker` ter efeito.

### 3. Clonar o repositório e configurar

```bash
git clone https://github.com/GabrielVianaNunes/TCC.git
cd TCC
cp .env.example .env
nano .env   # preencha POSTGRES_PASSWORD, ADMIN_BOOTSTRAP_PASSWORD, e as variáveis BACKUP_* quando tiver a conta S3
```

**Nunca** commite o `.env` preenchido — ele fica só na VM, local.

### 4. Subir a aplicação

```bash
docker compose up -d --build
```

Acompanhar os logs:

```bash
docker compose logs -f app
```

### 5. Apontar um domínio (quando disponível)

1. No provedor de DNS do seu domínio, crie um registro `A` apontando pro IP público da VM.
2. Edite `DOMAIN=seu-dominio.com` no `.env` da VM.
3. Reinicie o Caddy: `docker compose restart caddy` — ele obtém e renova o certificado Let's Encrypt automaticamente a partir daí.

Sem domínio configurado (`DOMAIN=localhost`, o padrão), o Caddy ainda faz upgrade automático pra HTTPS (certificado autoassinado, redirect de `:80` pra `:443`) — confirmado ao vivo na Task 2. A aplicação continua acessível pelo IP da VM, só que via HTTPS com aviso de certificado não confiável no navegador até um domínio real ser configurado.

### 6. Atualizar depois de mudanças no código

```bash
git pull
docker compose up -d --build
```

O `restart: unless-stopped` já configurado garante que a aplicação volta sozinha se a VM reiniciar (ex.: depois de uma atualização de sistema operacional) — não precisa de nenhuma ação manual pra isso.
