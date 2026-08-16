# Production Readiness - Profissionais

Este runbook fecha a passagem do projeto Profissionais para staging real e
producao: DNS, SSL, observabilidade, backup/restore, smoke e rollback.

## Ordem de execucao no servidor

1. Apontar DNS para o IP de staging/producao:
   - `profiangola.ao`
   - `www.profiangola.ao`
   - `admin.profiangola.ao`
   - `operacoes.profiangola.ao`
   - `app.profiangola.ao`
2. Criar `.env.production` a partir de `docs/deploy/env.production.example`.
3. Subir banco e aplicacao:

```bash
docker compose --env-file .env.production -f compose.production.example.yaml build
docker compose --env-file .env.production -f compose.production.example.yaml up -d db
docker compose --env-file .env.production -f compose.production.example.yaml run --rm rails bin/rails db:prepare
docker compose --env-file .env.production -f compose.production.example.yaml run --rm rails bin/rails db:seed
docker compose --env-file .env.production -f compose.production.example.yaml up -d
```

4. Instalar Nginx com `docs/deploy/nginx-profissionais.example.conf`.
5. Emitir certificado SAN/wildcard.
6. Rodar preflight:

```bash
bash ./scripts/test_preflight_profissionais_staging.sh
bash ./scripts/test_check_profissionais_env.sh
bash ./scripts/test_staging_evidence_screenshots_profissionais.sh
bash ./scripts/test_staging_manual_qa_profissionais.sh
PROFISSIONAIS_PREFLIGHT_EXPECTED_IP=<IP_DE_STAGING> bash ./scripts/preflight_profissionais_staging.sh
```

7. Gerar pacote de evidencias de staging:

```bash
PROFISSIONAIS_ENV_FILE=.env.production \
PROFISSIONAIS_RUN_REMOTE_CHECKS=true \
PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true \
PROFISSIONAIS_RUN_SCREENSHOTS=true \
PROFISSIONAIS_SCREENSHOT_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_CLIENT_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_FRONTEND_SMOKE_REVIEW_CLIENT_EMAIL=cliente-avaliado-staging@example.com \
PROFISSIONAIS_FRONTEND_SMOKE_PROFESSIONAL_EMAIL=profissional-staging@example.com \
PROFISSIONAIS_FRONTEND_SMOKE_ADMIN_EMAIL=admin-staging@example.com \
PROFISSIONAIS_FRONTEND_SMOKE_PASSWORD=<senha_staging> \
PROFISSIONAIS_SMOKE_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
PROFISSIONAIS_SCREENSHOT_CLIENT_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_SCREENSHOT_PROFESSIONAL_EMAIL=profissional-staging@example.com \
PROFISSIONAIS_SCREENSHOT_ADMIN_EMAIL=admin-staging@example.com \
PROFISSIONAIS_SCREENSHOT_PASSWORD=<senha_staging> \
bash ./scripts/staging_evidence_profissionais.sh
```

Para gerar somente screenshots seguros de demo/local:

```bash
PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR=tmp/demo-screenshots/local \
bash ./scripts/capture_profissionais_demo_screenshots.sh
```

Para fechar o gate manual no browser real, gere e preencha o checklist:

```bash
PROFISSIONAIS_MANUAL_QA_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_RELEASE_ID=<release-ou-data> \
PROFISSIONAIS_MANUAL_QA_TESTER=<nome_do_testador> \
bash ./scripts/create_staging_manual_qa_checklist_profissionais.sh tmp/staging-evidence/manual-qa-checklist.md

bash ./scripts/check_staging_manual_qa_profissionais.sh tmp/staging-evidence/manual-qa-checklist.md
```

## Observabilidade minima

- `GET /up`: health Rails simples para proxy e container.
- `GET /api/v1/health`: JSON publico com status e check de banco.
- Healthcheck Docker no Rails e no Next em `compose.production.example.yaml`.
- Logs Docker com rotacao `10m` x `5` arquivos por servico.
- Nginx com `access_log` e tempos de upstream em `profissionais.access.log`.
- Eventos Rails estruturados em JSON para `auth.login_succeeded`,
  `auth.login_failed`, `auth.logout_succeeded`, `api.error`,
  `security.rate_limited` e `audit_log.recorded`, com PII/segredos filtrados.

Monitores recomendados:

- Uptime HTTPS para todos os hosts publicos.
- `https://profiangola.ao/api/v1/health` com alerta se status nao for `200`.
- Expiracao de certificado com alerta quando faltar menos de 14 dias.
- Uso de disco do volume Postgres e pasta de backups.
- Erros 5xx no Nginx/Rails acima do normal por 5 minutos.

## Backup e restore testado

Criar backup:

```bash
bash ./scripts/backup_profissionais_postgres.sh
```

Testar restore em database separado:

```bash
PROFISSIONAIS_RESTORE_CONFIRM=restore \
  bash ./scripts/restore_profissionais_postgres.sh backups/profissionais-YYYYMMDDTHHMMSSZ.sql.gz
```

Fluxo completo backup + restore de validacao:

```bash
PROFISSIONAIS_RESTORE_CONFIRM=restore bash ./scripts/test_backup_restore_profissionais.sh
```

Nunca restaure por cima da base principal sem validar primeiro em
`PROFISSIONAIS_RESTORE_DATABASE=profissionais_restore_validation`.

## Smoke contra dominios reais

Antes de validar dominios reais, rode o smoke integrado local. Ele sobe Rails e
Next em Docker, valida login/logout, cookie compartilhado, origem canonica e o
bloqueio autenticado de `budget_cents` interno para cliente:

```bash
bash ./scripts/smoke_integrated_session_profissionais.sh
```

Depois do SSL:

```bash
PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao bash ./scripts/smoke_profissionais_deploy.sh
```

Com um cliente de staging, rode o smoke remoto autenticado para validar login,
CSRF, logout e a regressao que bloqueia `budget_cents` interno:

```bash
PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_SMOKE_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/smoke_profissionais_deploy.sh
```

Antes de virar DNS, testando por IP:

```bash
PROFISSIONAIS_SMOKE_TARGET_IP=<IP_DE_STAGING> \
PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_SMOKE_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/smoke_profissionais_deploy.sh
```

## Rollback

Gerar plano de rollback para o incidente:

```bash
bash ./scripts/rollback_profissionais_plan.sh
```

O rollback operacional deve seguir esta ordem:

1. Congelar deploys.
2. Guardar logs e estado atual.
3. Voltar release/imagem anterior quando o problema for aplicacao.
4. Restaurar backup somente se houver corrupcao de dados confirmada.
5. Restaurar primeiro em database de validacao.
6. Rodar smoke depois da reversao.
7. Registrar causa, impacto, decisao e follow-up.

## Criterio de pronto

- Todos os hosts resolvem para o IP esperado.
- Certificados validos por mais de 14 dias.
- `bash ./scripts/check_profissionais_env.sh .env.production` passa e confirma
  cookies, timeout de sessao, rememberable, mailer sender e log level de
  producao.
- `bash ./scripts/test_check_profissionais_env.sh` prova que o checker aceita
  um env valido e rejeita limites/sessoes/logs inseguros.
- `bash ./scripts/test_staging_evidence_screenshots_profissionais.sh` prova a
  integracao entre pacote de evidencias e screenshots de demo.
- `bash ./scripts/test_staging_manual_qa_profissionais.sh` prova o gate de QA
  manual: checklist pendente falha e checklist aprovado passa.
- Teste local do preflight passa em Docker.
- Preflight real passa sem falhas, incluindo redirect HTTP para HTTPS, HSTS com
  `includeSubDomains`, headers defensivos e cookie de sessao com `Domain`,
  `Secure`, `HttpOnly` e `SameSite=Lax`.
- Backup foi criado e restore foi testado.
- Smoke integrado local passa e confirma que cliente autenticado nao consegue
  gravar `budget_cents` interno na criacao de pedido.
- Smoke real passa nos dominios; com credenciais de staging, o smoke remoto
  autenticado tambem confirma que cliente nao consegue gravar `budget_cents`
  interno.
- `bash ./scripts/staging_evidence_profissionais.sh` gera uma pasta em
  `tmp/staging-evidence/` com logs de env-check, compose-config, smoke,
  preflight local e checks remotos.
- O pacote contem `demo-screenshots/` quando
  `PROFISSIONAIS_RUN_SCREENSHOTS=true`, com capturas publicas e autenticadas
  usando apenas dados de staging/demo.
- Checklist de QA manual em browser real foi preenchido, marcado como
  `Resultado final: APROVADO` e validado por script.
- Plano de rollback foi gerado e revisado.
