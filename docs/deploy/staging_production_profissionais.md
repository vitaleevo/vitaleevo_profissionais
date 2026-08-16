# Staging e Producao - Projeto Profissionais

Este guia prepara o produto Profissionais/ProfiAngola para staging ou producao.
O escopo ativo e: clientes, profissionais, pedidos de servico, matching,
pagamentos, documentos profissionais e operacao/admin.

## Hosts recomendados

- `profiangola.ao`: produto publico e catalogo de servicos.
- `www.profiangola.ao`: alias publico.
- `admin.profiangola.ao`: operacao/admin.
- `operacoes.profiangola.ao`: alias operacional.
- `app.profiangola.ao`: conta do cliente/profissional.

## Arquitetura recomendada

O navegador acessa o Next.js. O Next chama o Rails por rede interna
(`RAILS_API_BASE_URL=http://rails:80` no Compose ou `http://127.0.0.1:3000`
em bare metal). O reverse proxy expoe `/api/`, `/assets/`,
`/rails/active_storage/` e `/up` para o Rails; as demais rotas vao para o Next.

Esse desenho reduz CORS, centraliza o cookie em `.profiangola.ao` e mantem o
Rails como backend de autenticacao, regras de negocio e dados.

## DNS e SSL

Crie registros `A` ou `CNAME` para:

- `profiangola.ao`
- `www.profiangola.ao`
- `admin.profiangola.ao`
- `operacoes.profiangola.ao`
- `app.profiangola.ao`

Use um certificado unico SAN ou wildcard. Exemplo com Certbot:

```bash
certbot --nginx \
  -d profiangola.ao \
  -d www.profiangola.ao \
  -d admin.profiangola.ao \
  -d operacoes.profiangola.ao \
  -d app.profiangola.ao
```

O exemplo de Nginx fica em `docs/deploy/nginx-profissionais.example.conf`.

## Variaveis de ambiente

Use `docs/deploy/env.production.example` como checklist de secrets e
configuracao. Pontos obrigatorios:

- `PROFISSIONAIS_ROOT_DOMAIN=profiangola.ao`.
- `DEVISE_MAILER_SENDER=no-reply@profiangola.ao`.
- `RAILS_HOSTS` com hosts publicos e internos (`rails`, `localhost`,
  `127.0.0.1`).
- `SESSION_COOKIE_KEY=_profiangola_session`.
- `SESSION_COOKIE_DOMAIN=.profiangola.ao`.
- `SESSION_COOKIE_SECURE=true`.
- `SESSION_TIMEOUT_MINUTES=720` ou valor equivalente aprovado.
- `DEVISE_REMEMBER_FOR_DAYS=7` ou valor equivalente aprovado.
- `FRONTEND_PUBLIC_BASE_URL=https://profiangola.ao` como origem canonica de
  redirects do Next.
- `FRONTEND_ALLOWED_HOSTS` com os hosts publicos aceitos pelo Next.
- `RAILS_FORCE_SSL=true` e `RAILS_ASSUME_SSL=true`.
- `RAILS_API_BASE_URL=http://rails:80` para o Next dentro do Compose.
- `client_max_body_size 20m` no Nginx deve permanecer alinhado ao limite total
  de anexos do Rails.

## Subida inicial

```bash
cp docs/deploy/env.production.example .env.production
# editar secrets reais antes de subir
bash ./scripts/check_profissionais_env.sh .env.production
docker compose --env-file .env.production -f compose.production.example.yaml build
docker compose --env-file .env.production -f compose.production.example.yaml up -d db
docker compose --env-file .env.production -f compose.production.example.yaml run --rm rails bin/rails db:prepare
docker compose --env-file .env.production -f compose.production.example.yaml run --rm rails bin/rails db:seed
docker compose --env-file .env.production -f compose.production.example.yaml up -d
```

Em staging, rode `db:seed` para dados demonstrativos. Em producao real, use uma
base limpa quando ja houver clientes reais.

## Backup e restore

Criar backup do banco:

```bash
bash ./scripts/backup_profissionais_postgres.sh
```

Criar backup dos ficheiros/anexos do Active Storage:

```bash
bash ./scripts/backup_profissionais_storage.sh
```

Testar restore do banco em base separada:

```bash
PROFISSIONAIS_RESTORE_CONFIRM=restore \
  ./scripts/restore_profissionais_postgres.sh backups/profissionais-YYYYMMDDTHHMMSSZ.sql.gz
```

Restaurar ficheiros/anexos exige janela operacional e confirmacao explicita,
porque o destino de storage e limpo antes da extracao:

```bash
PROFISSIONAIS_STORAGE_RESTORE_CONFIRM=restore-storage \
  ./scripts/restore_profissionais_storage.sh backups/profissionais-storage-YYYYMMDDTHHMMSSZ.tar.gz
```

Fluxo completo de validacao:

```bash
PROFISSIONAIS_RESTORE_CONFIRM=restore ./scripts/test_backup_restore_profissionais.sh
```

Esse fluxo valida Postgres e tambem executa backup/restore de storage em
volumes Docker descartaveis, sem tocar nos anexos reais.

## Smoke de deploy

Antes de publicar ou depois de mudar autenticacao, proxy ou cookies, rode o
smoke integrado local com Rails e Next vivos em Docker:

```bash
bash ./scripts/smoke_integrated_session_profissionais.sh
bash ./scripts/test_preflight_profissionais_staging.sh
bash ./scripts/test_check_profissionais_env.sh
bash ./scripts/test_staging_evidence_screenshots_profissionais.sh
bash ./scripts/test_staging_manual_qa_profissionais.sh
```

Esse smoke sobe Rails em ambiente de teste, cria uma imagem de producao do
Next, roda o frontend com filesystem read-only, `cap_drop: ALL`,
`no-new-privileges`, valida login/logout por proxy, cookie de sessao,
`/api/v1/me`, bloqueio autenticado de `budget_cents` interno para cliente e
fallback canonico quando `Host`/`X-Forwarded-Host` nao sao permitidos. O teste
local do preflight sobe Nginx em Docker e prova que os headers defensivos e
cookie seguro passam, e que cookie de sessao sem `HttpOnly` falha.

Depois do deploy e do SSL:

```bash
PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao bash ./scripts/smoke_profissionais_deploy.sh
```

Para validar tambem login, CSRF, logout e bloqueio de `budget_cents` interno em
staging real, use credenciais de um cliente de teste:

```bash
PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_SMOKE_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/smoke_profissionais_deploy.sh
```

Para testar um servidor antes de virar DNS:

```bash
PROFISSIONAIS_SMOKE_TARGET_IP=203.0.113.10 \
PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_SMOKE_EMAIL=cliente-staging@example.com \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/smoke_profissionais_deploy.sh
```

O smoke cobre home, servicos, operacao/admin, conta, `/up`, `/api/v1/health`,
`/api/v1/marketplace/home` e `/api/v1/service_categories`. Quando
`PROFISSIONAIS_SMOKE_EMAIL` e `PROFISSIONAIS_SMOKE_PASSWORD` estao definidos,
tambem valida login, CSRF autenticado, bloqueio de `budget_cents` interno para
cliente e logout.

## Pacote de evidencias

Antes de marcar staging como pronto para demo externa, gere um pacote local de
evidencias com os checks executados:

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

O script grava logs em `tmp/staging-evidence/<timestamp>/`, incluindo
`env-check.log`, `compose-config.log`, `integrated-smoke.log`,
`local-preflight.log`, `remote-preflight.log`, `remote-smoke.log`,
`remote-frontend-smoke.log`, `manual-qa-template.log` e
`manual-qa-checklist.md` quando os checks estiverem habilitados. Esse diretorio
deve ser anexado ao handoff de deploy ou issue de liberacao, sem incluir
secrets.

O gate `PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true` exige credenciais
explicitas de cliente, cliente com pedido ja avaliado, profissional e admin.
Ele falha cedo se as variaveis `PROFISSIONAIS_FRONTEND_SMOKE_*` nao estiverem
definidas, evitando rodar por engano contra defaults locais.

O gate de browser manual no dominio real usa um checklist versionado. Gere o
arquivo, preencha no browser real com cliente/profissional/admin e valide:

```bash
PROFISSIONAIS_MANUAL_QA_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_RELEASE_ID=<release-ou-data> \
PROFISSIONAIS_MANUAL_QA_TESTER=<nome_do_testador> \
bash ./scripts/create_staging_manual_qa_checklist_profissionais.sh tmp/staging-evidence/manual-qa-checklist.md

# depois de marcar todos os itens com [x] e Resultado final: APROVADO
bash ./scripts/check_staging_manual_qa_profissionais.sh tmp/staging-evidence/manual-qa-checklist.md
```

Quando quiser que o pacote de evidencias falhe se o checklist manual ainda nao
estiver aprovado:

```bash
PROFISSIONAIS_REQUIRE_MANUAL_QA=true \
PROFISSIONAIS_MANUAL_QA_FILE=tmp/staging-evidence/manual-qa-checklist.md \
bash ./scripts/staging_evidence_profissionais.sh
```

Para gerar apenas screenshots de demo no ambiente local ou staging ja acessivel:

```bash
PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR=tmp/demo-screenshots/local \
bash ./scripts/capture_profissionais_demo_screenshots.sh
```

## Checklist de liberacao

- `bash ./scripts/check_profissionais_env.sh .env.production` passa sem `FAIL`.
- `bash ./scripts/test_check_profissionais_env.sh` passa no ambiente de
  preparacao antes de qualquer deploy.
- `bash ./scripts/test_staging_evidence_screenshots_profissionais.sh` confirma
  que o pacote de evidencias gera screenshots de demo quando habilitado.
- `bash ./scripts/test_staging_manual_qa_profissionais.sh` confirma que o gate
  de QA manual rejeita checklist pendente e aceita checklist aprovado.
- `PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true bash ./scripts/staging_evidence_profissionais.sh`
  gera `remote-frontend-smoke.log` com rotas autenticadas de cliente,
  profissional e admin no dominio real, desde que as credenciais
  `PROFISSIONAIS_FRONTEND_SMOKE_*` estejam definidas.
- `docker compose --env-file .env.production -f compose.production.example.yaml config`
  confirma `no-new-privileges` nos servicos e frontend com usuario nao-root,
  filesystem read-only, `/tmp` temporario e `cap_drop: ALL`.
- `bash ./scripts/capture_profissionais_demo_screenshots.sh` gera capturas sem
  overflow horizontal, sem `Application error` e sem imagens carregadas
  quebradas.
- DNS aponta para o proxy correto.
- Certificados emitem e renovam automaticamente.
- Rails aceita os hosts reais e o host interno do Next.
- Cookie `_profiangola_session` aparece com `Domain=.profiangola.ao`, `Secure`
  e `SameSite=Lax`.
- Logs Rails em STDOUT contem eventos JSON estruturados de login, logout,
  `api.error`, `security.rate_limited` e `audit_log.recorded`, sem email,
  password, token, cookie ou session em claro.
- Preflight confirma CSP, HSTS, `nosniff`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `COOP`, `HttpOnly` no cookie de
  sessao, HSTS com `includeSubDomains` e redirect HTTP para HTTPS nos hosts
  reais.
- `/`, `/servicos`, `/operacoes`, `/profissional`, `/conta` e `/pedidos` abrem.
- Cliente cria pedido, matching calcula candidatos e operador/profissional
  consegue atualizar o estado.
- Smoke integrado e smoke remoto autenticado confirmam que cliente autenticado
  nao consegue gravar `budget_cents` interno na criacao de pedido.
- Profissional cadastra perfil e documentos; operador aprova/rejeita documentos.
- Nginx aplica HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` e flags seguras em cookies proxied.
- Backup de Postgres e `rails_storage` foi gerado; restore do banco foi testado
  em base separada e restore de storage foi testado em volumes Docker
  descartaveis.
- Smoke integrado local e smoke remoto de deploy passam sem falhas.
- Checklist de QA manual no browser real foi marcado como `Resultado final:
  APROVADO` e validado por
  `bash ./scripts/check_staging_manual_qa_profissionais.sh`.
