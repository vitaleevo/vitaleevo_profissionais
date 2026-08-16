# AGENT_MEMORY - Projeto Profissionais

## Ultima etapa concluida: gate de smoke frontend remoto no pacote de staging

Objetivo: avancar a trilha de staging profissional deixando o pacote de
evidencias cobrir tambem o smoke frontend autenticado por perfil no dominio
real, sem usar credenciais/demo defaults por engano.

Foi feito:

- `scripts/staging_evidence_profissionais.sh` ganhou o gate
  `PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE`.
- Quando esse gate esta ativo, o script exige explicitamente:
  - `PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL`;
  - `PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL`;
  - emails de cliente, cliente com pedido avaliado, profissional e admin;
  - `PROFISSIONAIS_FRONTEND_SMOKE_PASSWORD`.
- O pacote de evidencias agora registra `remote-frontend-smoke.log` quando o
  smoke frontend remoto estiver habilitado.
- `docs/deploy/env.production.example` passou a listar as variaveis do smoke
  frontend remoto.
- `docs/deploy/staging_production_profissionais.md` e
  `docs/deploy/production_readiness_profissionais.md` passaram a documentar o
  gate `PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true`.
- `docs/deploy/nginx-profissionais.example.conf` passou a declarar
  `Cross-Origin-Opener-Policy: same-origin`, alinhando o exemplo ao preflight.
- `scripts/test_staging_evidence_screenshots_profissionais.sh` agora tambem
  prova que o gate de smoke frontend remoto falha cedo quando faltam
  credenciais explicitas.

Arquivos principais:

- `scripts/staging_evidence_profissionais.sh`
- `scripts/test_staging_evidence_screenshots_profissionais.sh`
- `docs/deploy/env.production.example`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/nginx-profissionais.example.conf`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/staging_evidence_profissionais.sh scripts/test_staging_evidence_screenshots_profissionais.sh scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_staging_evidence_screenshots_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_check_profissionais_env.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_staging_manual_qa_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_preflight_profissionais_staging.sh'
```

Resultado:

- Sintaxe shell passou.
- `OK staging evidence screenshots`.
- `OK check_profissionais_env`.
- `OK staging manual QA gate`.
- `OK preflight bloqueou cookie sem HttpOnly`.

Estado atual:

- O pacote de staging agora cobre env, compose, smoke integrado local,
  preflight local, preflight remoto, smoke remoto API/web, smoke frontend remoto
  por perfil, screenshots e QA manual.
- Ainda falta executar contra um dominio/IP real com credenciais de staging.

## Proximo passo recomendado

Rodar o staging real quando houver dominio/IP e credenciais:

```bash
PROFISSIONAIS_ENV_FILE=.env.production \
PROFISSIONAIS_RUN_REMOTE_CHECKS=true \
PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true \
PROFISSIONAIS_RUN_SCREENSHOTS=true \
PROFISSIONAIS_SCREENSHOT_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_CLIENT_EMAIL=<cliente_staging> \
PROFISSIONAIS_FRONTEND_SMOKE_REVIEW_CLIENT_EMAIL=<cliente_com_pedido_avaliado> \
PROFISSIONAIS_FRONTEND_SMOKE_PROFESSIONAL_EMAIL=<profissional_staging> \
PROFISSIONAIS_FRONTEND_SMOKE_ADMIN_EMAIL=<admin_staging> \
PROFISSIONAIS_FRONTEND_SMOKE_PASSWORD=<senha_staging> \
PROFISSIONAIS_SMOKE_EMAIL=<cliente_staging> \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/staging_evidence_profissionais.sh
```

## Ultima etapa concluida: metricas de SLA e qualidade no dashboard operacional

Objetivo: dar a operacao indicadores acionaveis de SLA/qualidade e alertas de
risco antes das filas operacionais, avancando a profissionalizacao do admin sem
expor dados fora do endpoint operacional protegido.

Foi feito:

- Criado `OperationsDashboardMetrics` para calcular pedidos atrasados, pedidos
  em risco, resposta media, taxa de conclusao, taxa de disputa, qualidade media,
  cobertura de reviews e alertas priorizados.
- `GET /api/v1/dashboard` agora retorna `service_quality`, `risk_alerts` e
  novos campos em `stats`.
- O OpenAPI ganhou schemas explicitos para `OperationsStats`,
  `OperationsServiceQuality` e `OperationsRiskAlert`.
- O dashboard `/operacoes` ganhou a secao "SLA e qualidade" com metricas
  compactas e alertas clicaveis para pedidos em risco.
- O `AppShell` mobile deixou de usar navegacao horizontal com scrollbar e passou
  a usar grid responsiva em 320px.
- O smoke frontend passou a validar "SLA e qualidade" e "Alertas de risco".
- `frontend/src/lib/api/schema.ts` foi regenerado a partir do OpenAPI.

Arquivos principais:

- `app/services/operations_dashboard_metrics.rb`
- `app/controllers/api/v1/dashboard_controller.rb`
- `test/integration/api_v1_contract_test.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/schema.ts`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/components/layout/app-shell.tsx`
- `scripts/smoke_frontend_routes_profissionais.sh`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run generate:api'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run typecheck'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run lint'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run build'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'PROFISSIONAIS_FRONTEND_SMOKE_CURL_TIMEOUT=120 bash scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh'
```

Resultado:

- Typecheck, lint e build do frontend passaram.
- Teste de contrato focado passou: `27 runs, 159 assertions, 0 failures`.
- Smoke frontend autenticado passou em `http://127.0.0.1:3001`.
- Suite Rails completa passou: `110 runs, 571 assertions, 0 failures`.
- Browser integrado validou `/operacoes` em desktop e 320px com
  `hasHorizontalOverflow=false`, `navOverflows=false`, "SLA e qualidade",
  "Alertas de risco" e "Auditoria operacional" presentes.
- Ambiente local foi reativado no final: Rails `/up` em `3000` e frontend
  `/login` em `3001` responderam `200`.

Estado atual:

- Fase/trilha atual: profissionalizacao operacional local avancada.
- Solido agora: auditoria filtravel, perfil operacional do profissional,
  revisao documental, filtros, fila operacional, metricas de SLA/qualidade,
  alertas de risco e mobile 320px sem overflow real no shell interno.
- Falta imediato: staging real externo com dominio/TLS/Nginx, smoke remoto
  autenticado e QA manual no dominio real.

## Proximo passo recomendado

Executar a trilha de staging profissional: preparar `.env.production` fora do
repo, validar Nginx/DNS/TLS, subir staging, rodar preflight remoto, smoke
autenticado remoto e QA manual no dominio real.

## Ultima etapa concluida: auditoria filtravel no dashboard operacional

Objetivo: tornar a auditoria operacional visivel e navegavel no dashboard,
com ultimas acoes criticas, filtro por tipo e links para pedidos ou
profissionais relacionados.

Foi feito:

- `GET /api/v1/dashboard` agora aceita `audit_action` com enum fechado em
  `AuditLog::ACTIONS`.
- O dashboard operacional retorna `audit_actions` e `recent_audit_logs`
  serializados com actor, auditable, metadata e data.
- Filtros invalidos de auditoria retornam `422` com
  `invalid_audit_action`, sem renderizar resposta duplicada.
- A pagina `/operacoes` ganhou a secao "Auditoria operacional", com:
  - filtro por tipo de acao;
  - estado vazio para auditoria geral e filtrada;
  - cards compactos com actor, data, detalhe da acao e link "Abrir";
  - links para `/pedidos/:id` quando o auditable e `ServiceRequest`;
  - links para `/operacoes/profissionais/:id` quando o auditable e
    `Professional` ou quando o metadata do documento traz `professional_id`.
- `db/seeds.rb` agora limpa `AuditLog` antigo e cria eventos seedados de
  atribuicao, mudanca de estado e atualizacao operacional de profissional.
- O smoke frontend passou a validar a secao de auditoria e o filtro
  `service_request.status_updated`.
- O screenshot QA do dashboard operacional passou a exigir
  "Auditoria operacional".
- `frontend/src/lib/api/schema.ts` foi regenerado a partir do OpenAPI.
- Hot reload foi reativado no final em `http://127.0.0.1:3001`.

Arquivos principais:

- `app/controllers/api/v1/dashboard_controller.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/account.ts`
- `frontend/src/lib/api/schema.ts`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `test/integration/api_v1_contract_test.rb`
- `db/seeds.rb`
- `scripts/smoke_frontend_routes_profissionais.sh`
- `scripts/qa/capture_profissionais_demo_screenshots.mjs`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run generate:api'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run typecheck'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run lint'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb test/models/audit_log_test.rb'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'PROFISSIONAIS_FRONTEND_SMOKE_CURL_TIMEOUT=120 bash scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR=tmp/demo-screenshots/audit-dashboard bash scripts/capture_profissionais_demo_screenshots.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run build'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'rm -f tmp/pids/server.pid && docker compose up -d db web && docker compose exec -T web bin/rails db:migrate db:seed && bash scripts/start_frontend_dev_profissionais.sh'
```

Resultado:

- Frontend `generate:api`, `typecheck`, `lint` e `build` passaram.
- Testes focados passaram: `29 runs, 148 assertions, 0 failures, 0 errors`.
- Smoke frontend autenticado passou: `OK frontend route smoke passed:
  http://127.0.0.1:3001`.
- Screenshot QA passou com 15 capturas em
  `tmp/demo-screenshots/audit-dashboard`.
- Suite Rails completa passou: `109 runs, 547 assertions, 0 failures`.
- Checagem final: Rails `/up` em `3000` e frontend `/login` em `3001`
  responderam `200`.

Notas de ambiente:

- O Browser integrado abriu `http://localhost:3001/login`, mas a automacao
  de digitacao ficou limitada pela ausencia de clipboard/teclado virtual da
  ferramenta. A validacao autenticada da UI foi coberta por smoke e screenshot
  QA com login real.
- O WSL apresentou um erro transitorio `Wsl/Service/0x8007274c` em um check
  paralelo, mas a sessao recuperou sem precisar `terminate`; smoke, screenshots,
  build, suite completa e hot reload final passaram depois disso.
- `tmp/frontend-dev.log` terminou com `EADDRINUSE` porque ja havia uma
  instancia Next ativa em `0.0.0.0:3001`; `ss` confirmou `next-server` em
  `3001` e `/login` respondeu `200`.

Estado atual:

- A operacao agora tem uma trilha recente de auditoria visivel e filtravel no
  dashboard.
- O feed nao expoe dados internos alem do serializer operacional ja aprovado.
- O filtro e seguro porque usa enum fechado, payload limitado a 12 itens e
  endpoint ja protegido por `DashboardPolicy#index?`.
- Hot reload local continua ativo em `http://127.0.0.1:3001`.
- O produto completo ainda nao esta pronto no "Z": faltam staging real externo,
  dominio/TLS/Nginx, smoke remoto autenticado e QA manual no dominio real.

Estado do projeto:

- Fase/trilha atual: profissionalizacao da operacao/admin e hardening local.
- Solido agora: fila operacional priorizada, perfil profissional operacional,
  notas internas, revisao documental, historico/auditoria no perfil e feed de
  auditoria filtravel no dashboard.
- Falta imediato: metricas operacionais de SLA/qualidade mais uteis e staging
  real externo.
- Distancia do fim: a trilha operacional local esta quase no fim; o produto
  completo ainda nao chegou ao fim porque falta evidencia externa de producao.

## Proximo passo recomendado

Implementar metricas operacionais de SLA e qualidade no dashboard, com pedidos
atrasados, tempo medio de resposta, taxa de conclusao/disputa e alertas de
risco para a operacao decidir prioridade sem abrir cada pedido.

AVISO: O proximo passo e criar/implementar metricas operacionais de SLA e qualidade no dashboard, com pedidos atrasados, tempo medio de resposta, taxa de conclusao/disputa e alertas de risco. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar `app/controllers/api/v1/dashboard_controller.rb`,
  `app/models/service_request.rb` e os serializers/escopos de pedidos.
- Definir metricas uteis sem criar payload pesado nem queries sem indice.
- Renderizar os indicadores no dashboard com estados claros e links para filas
  filtradas.
- Verificar com teste Rails/API, OpenAPI, `npm run typecheck`, `npm run lint`,
  smoke e screenshot do dashboard.

## Ultima etapa concluida: perfil profissional operacional com notas e auditoria

Objetivo: transformar o detalhe operacional do profissional num perfil de
trabalho real para admin/operador, com documentos, estado, nota interna e
historico de acoes criticas sem vazar dados internos para cliente/profissional.

Foi feito:

- Criada a coluna `professionals.operator_notes` para notas internas da
  operacao.
- Adicionado limite de 2.000 caracteres para notas internas no model
  `Professional`.
- Adicionada a acao de auditoria
  `professional.operational_profile_updated`.
- `GET /api/v1/professionals/:id` agora inclui `operator_notes` e
  `operational_activity` somente para `admin`/`operator`.
- Criado `PATCH /api/v1/professionals/:id/operational_profile` com whitelist
  apenas para `status` e `operator_notes`, protegido por
  `ProfessionalPolicy#update_operations?`.
- Criado `Api::V1::AuditLogSerializer` para expor atividade operacional segura.
- A pagina `/operacoes/profissionais/[id]` ganhou:
  - painel de controle operacional;
  - select de estado publico;
  - textarea de nota interna;
  - historico operacional com documentos, atribuicoes, estados e notas.
- O smoke frontend agora descobre o ID do profissional pela API e valida o
  detalhe operacional.
- O screenshot QA agora captura o detalhe operacional em desktop e mobile 320px.
- `scripts/test_rails_compose.sh` foi corrigido para nao falhar no cleanup
  quando `docker compose down` retorna erro mesmo apos testes verdes.
- `db/seeds.rb` passou a incluir nota operacional seedada para Joaquim Mateus.

Arquivos principais:

- `db/migrate/20260603154500_add_operator_notes_to_professionals.rb`
- `db/schema.rb`
- `app/models/professional.rb`
- `app/models/audit_log.rb`
- `app/policies/professional_policy.rb`
- `app/controllers/api/v1/professionals_controller.rb`
- `app/serializers/api/v1/audit_log_serializer.rb`
- `app/serializers/api/v1/professional_serializer.rb`
- `test/integration/professional_documents_test.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/schema.ts`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/actions.ts`
- `scripts/smoke_frontend_routes_profissionais.sh`
- `scripts/qa/capture_profissionais_demo_screenshots.mjs`
- `scripts/capture_profissionais_demo_screenshots.sh`
- `scripts/test_rails_compose.sh`
- `db/seeds.rb`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh test/integration/professional_documents_test.rb test/models/audit_log_test.rb'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run generate:api && npm run typecheck && npm run lint'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb test/integration/security_hardening_test.rb'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'PROFISSIONAIS_FRONTEND_SMOKE_CURL_TIMEOUT=120 bash scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'node --check scripts/qa/capture_profissionais_demo_screenshots.mjs && PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR=tmp/demo-screenshots/professional-operations-mobile bash scripts/capture_profissionais_demo_screenshots.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run build'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh'
```

Resultado:

- Testes focados passaram: `19 runs, 97 assertions, 0 failures, 0 errors`.
- Contrato API + hardening passaram: `40 runs, 174 assertions, 0 failures`.
- Suite Rails completa passou: `108 runs, 539 assertions, 0 failures`.
- `npm run generate:api`, `npm run typecheck`, `npm run lint` e
  `npm run build` passaram.
- Smoke frontend autenticado passou com timeout 120 porque a primeira
  compilacao da rota dinamica levou cerca de 40s em dev.
- Screenshots passaram com 15 capturas.
- `operations-professional-detail-desktop` e
  `operations-professional-detail-mobile` confirmaram texto esperado, sem
  overflow horizontal, sem imagens quebradas e sem `Application error`.
- Checagem final: frontend `/demo` em `3001` e Rails `/up` em `3000`
  responderam `200`; hot reload voltou ativo em `http://127.0.0.1:3001`.

Notas de ambiente:

- O WSL apresentou `Wsl/Service/E_UNEXPECTED` algumas vezes apos ciclos Docker.
  A recuperacao usada foi `wsl.exe --terminate Ubuntu`, seguida de subida
  limpa de DB/Rails, `db:migrate db:seed` e `start_frontend_dev_profissionais`.
- O produto completo ainda nao pode ser marcado como pronto porque falta
  staging real externo com dominio/TLS/Nginx, smoke remoto autenticado e QA
  manual no dominio real.

Estado do projeto:

- Fase/trilha atual: operacao/admin e hardening de seguranca/observabilidade.
- Solido agora: lista operacional priorizada, detalhe profissional operacional,
  notas internas, revisao documental, historico auditado, RBAC e screenshots
  desktop/mobile locais.
- Falta imediato: tornar auditoria/logs mais navegaveis no dashboard
  operacional, melhorar metricas uteis para operacao e fechar staging real.
- Distancia do fim: a trilha operacional local esta mais madura, mas o produto
  completo ainda esta no meio/final local, nao no "Z", por falta de staging
  externo validado.

## Proximo passo recomendado

Implementar uma area de auditoria/logs no dashboard operacional, com ultimas
acoes criticas, filtros por tipo de acao e links para pedido/profissional.

AVISO: O proximo passo e criar/implementar uma area de auditoria/logs no dashboard operacional com ultimas acoes criticas, filtros por tipo e links para pedido/profissional. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar `app/controllers/api/v1/dashboard_controller.rb`,
  `app/models/audit_log.rb` e `frontend/src/app/(operations)/operacoes/page.tsx`.
- Expor um resumo operacional de auditoria somente para admin/operador.
- Renderizar lista compacta no dashboard, com estado vazio e links seguros.
- Verificar com teste Rails, `npm run typecheck`, `npm run lint`, smoke e
  screenshot do dashboard.

## Ultima etapa concluida: fila operacional priorizada por urgencia

Objetivo: avancar a profissionalizacao da operacao fazendo a lista de pedidos
funcionar como fila de trabalho real, onde itens prioritarios e urgentes sobem
antes de pedidos normais mais recentes.

Foi feito:

- Criado o escopo `ServiceRequest.operational_queue`, com ordenacao constante
  por `priority`, `urgent`, `normal`, estado operacional e `created_at`.
- `GET /api/v1/service_requests` agora usa a fila priorizada apenas para
  `admin`/`operator`; cliente e profissional continuam vendo pedidos recentes.
- Adicionado teste de contrato provando que um pedido `priority` antigo aparece
  antes de `urgent` e `normal` na fila operacional filtrada.
- O cartao de pedido passou a destacar `priority`/`urgent` com badge e icone,
  sem alterar o contrato da API.
- O grid de filtros de `/pedidos` foi ajustado para quatro filtros em desktop:
  estado, categoria, provincia e urgencia.
- `scripts/qa/capture_profissionais_demo_screenshots.mjs` agora captura a fila
  operacional filtrada em `operations-requests-desktop`.

Arquivos principais:

- `app/models/service_request.rb`
- `app/controllers/api/v1/service_requests_controller.rb`
- `test/integration/api_v1_contract_test.rb`
- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/components/domain/service-requests/request-summary-card.tsx`
- `scripts/qa/capture_profissionais_demo_screenshots.mjs`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run typecheck && npm run lint'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'rm -f tmp/pids/server.pid && docker compose up -d db web && docker compose exec -T web bin/rails db:seed && bash scripts/start_frontend_dev_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/smoke_frontend_routes_profissionais.sh && bash scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'node --check scripts/qa/capture_profissionais_demo_screenshots.mjs && PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR=tmp/demo-screenshots/priority-queue bash scripts/capture_profissionais_demo_screenshots.sh'
```

Resultado:

- API contract passou: `25 runs, 127 assertions, 0 failures, 0 errors`.
- Frontend `typecheck` e `lint` passaram.
- Smoke frontend autenticado passou: `OK frontend route smoke passed:
  http://127.0.0.1:3001`.
- Screenshots passaram com 13 capturas.
- `operations-requests-desktop` confirmou texto esperado, sem overflow
  horizontal, sem imagens quebradas e sem `Application error`.
- Checagem final: frontend `/demo` em `3001` e Rails `/up` em `3000`
  responderam `200`.

Estado atual:

- A operacao agora tem filtros por estado, categoria, provincia e urgencia,
  alem de ordenacao priorizada da fila.
- Hot reload local continua ativo em `http://127.0.0.1:3001`.
- O produto completo ainda nao esta pronto no "Z": faltam staging real externo,
  dominio/TLS/Nginx, smoke remoto autenticado e QA manual no dominio real.

Estado do projeto:

- Fase/trilha atual: profissionalizacao da operacao e hardening de evidencias.
- Solido agora: fila operacional local autenticada, API contratada, UI sem
  overflow no screenshot desktop e smoke multi-perfil verde.
- Falta imediato: perfil profissional operacional com documentos/notas internas
  mais denso, aprovacao/rejeicao documental mais evidente na UI, auditoria
  visivel para a operacao e staging real externo.
- Distancia do fim: esta trilha esta no meio; a base esta solida, mas ainda
  faltam telas operacionais profundas e evidencia externa de staging.

## Proximo passo recomendado

Implementar a pagina de perfil profissional operacional com documentos, status,
notas internas e historico/auditoria visivel para admin/operador.

AVISO: O proximo passo e criar/implementar o perfil profissional operacional com documentos, status, notas internas e historico/auditoria visivel. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar `frontend/src/app/(client)/profissionais` ou rotas de
  `operacoes/profissionais`, serializers de `Professional` e testes de
  documentos profissionais.
- Implementar uma tela operacional mais densa sem expor dados indevidos a
  cliente/profissional.
- Verificar com teste Rails/API, `npm run typecheck`, `npm run lint`, smoke e
  screenshot da rota operacional.

## Ultima etapa concluida: filtros operacionais e hot reload confirmados

Objetivo: avancar a profissionalizacao da operacao com filtros reais na fila de
pedidos e preservar o frontend local em modo dev/hot reload na porta `3001`.

Foi feito:

- `GET /api/v1/service_requests` passou a aceitar `province` e `urgency`,
  mantendo `policy_scope` antes dos filtros.
- A UI operacional de `/pedidos` ganhou filtros por provincia e urgencia,
  alem dos filtros existentes por categoria e estado.
- `docs/api/openapi.yaml` foi atualizado e `frontend/src/lib/api/schema.ts`
  foi regenerado.
- `frontend/src/lib/api/service-requests.ts` passou a montar query params de
  provincia e urgencia.
- `test/integration/api_v1_contract_test.rb` agora prova a combinacao
  `status + category_slug + province + urgency`.
- `scripts/smoke_frontend_routes_profissionais.sh` agora cobre uma rota admin
  filtrada por provincia e urgencia.
- Hot reload local foi reconfirmado em `http://127.0.0.1:3001/demo`.

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run generate:api && npm run typecheck'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run lint'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc './scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/smoke_frontend_routes_profissionais.sh && bash scripts/smoke_frontend_routes_profissionais.sh'
```

Resultado:

- `npm run typecheck` passou depois de limpar apenas o cache gerado
  `frontend/.next/dev`, que estava corrompido por reinicio anterior.
- `npm run lint` passou.
- Rails contract test passou: `24 runs, 125 assertions, 0 failures, 0 errors`.
- Smoke frontend passou: `OK frontend route smoke passed:
  http://127.0.0.1:3001`.
- Checagem final retornou `frontend=200` em `/demo` e `rails=200` em `/up`.
- Processo ativo confirmado: `npm run dev -H 0.0.0.0 -p 3001`.
- `git status` continua indisponivel/fora de repositorio:
  `no-git-repository`.

Nota:

- O browser embutido foi tentado para verificacao visual, mas a automacao ficou
  bloqueada pelo clipboard virtual do Browser. A validacao HTTP/smoke ficou
  verde.
- O objetivo maior ainda nao pode ser marcado como concluido porque falta
  staging real externo: `.env.production` real fora do repo, servidor/Nginx,
  DNS/TLS, deploy, preflight remoto, smoke remoto autenticado e QA manual no
  dominio real.

## Ultima etapa concluida: smoke frontend cobre detalhe avaliado do cliente

Objetivo: reforcar a evidencia do fluxo principal cliente -> pedido -> estado
concluido -> avaliacao no produto renderizado, nao apenas na API Rails.

Foi feito:

- Auditados o detalhe do pedido e a API de reviews:
  - `frontend/src/app/(client)/pedidos/[id]/page.tsx`;
  - `frontend/src/app/(client)/pedidos/[id]/actions.ts`;
  - `app/controllers/api/v1/reviews_controller.rb`;
  - `test/integration/service_request_review_test.rb`.
- Confirmado que o formulario/estado de avaliacao ja existia no detalhe do
  pedido e que o backend ja cobre criacao de review, bloqueio antes de
  conclusao, bloqueio para profissional e review unica.
- `scripts/smoke_frontend_routes_profissionais.sh` foi ampliado para:
  - aceitar `PROFISSIONAIS_FRONTEND_SMOKE_REVIEW_CLIENT_EMAIL`;
  - aceitar `PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL`;
  - usar `node` para descobrir o ID do pedido pelo titulo via API Rails;
  - entrar com o cliente seed `operacoes@kiala.co.ao`;
  - abrir o detalhe do pedido "Revisao de contrato de fornecedor";
  - validar textos `Avaliacao do cliente`, `Servico avaliado` e o comentario
    "Parecer claro";
  - validar tambem a mensagem de feedback `Avaliacao enviada com sucesso.`;
  - usar timeout configuravel
    `PROFISSIONAIS_FRONTEND_SMOKE_CURL_TIMEOUT` com padrao `40`.
- `README.md` foi atualizado para documentar o smoke ampliado e variaveis de
  ambiente para local/staging.

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/smoke_frontend_routes_profissionais.sh && bash scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/smoke_frontend_routes_profissionais.sh; curl -Is http://127.0.0.1:3001/demo | head -n 1; xargs -r -a tmp/frontend-dev.pid ps -fp 2>/dev/null || true'
```

Resultado:

- `OK frontend route smoke passed: http://127.0.0.1:3001`.
- Hot reload local continuou ativo em `http://127.0.0.1:3001/demo`.
- `git status` continua indisponivel/fora de repositorio:
  `no-git-repository`.

Estado atual:

- O fluxo de avaliacao ja tinha backend e UI; agora o smoke frontend permanente
  prova que o cliente consegue ver um pedido concluido/avaliado no detalhe.
- Ainda falta staging real externo para fechar o "Z" do plano.

## Ultima etapa concluida: gate de QA manual de staging versionado

Objetivo: transformar o requisito "browser manual no dominio real" em artefato
operacional testavel, para o staging profissional nao depender de memoria solta
ou checklist informal.

Foi feito:

- Criado `scripts/create_staging_manual_qa_checklist_profissionais.sh`:
  - gera um checklist Markdown para QA manual no dominio real;
  - cobre publico, rotas protegidas sem sessao, cliente, operacao/admin,
    profissional, responsivo e evidencias obrigatorias;
  - usa `PROFISSIONAIS_MANUAL_QA_BASE_URL`, `PROFISSIONAIS_RELEASE_ID`,
    `PROFISSIONAIS_MANUAL_QA_TESTER` e `PROFISSIONAIS_MANUAL_QA_FILE`.
- Criado `scripts/check_staging_manual_qa_profissionais.sh`:
  - rejeita checklist com itens `- [ ]`;
  - exige pelo menos 40 itens aprovados;
  - exige `Resultado final: APROVADO`;
  - rejeita campos `PENDENTE`.
- Criado `scripts/test_staging_manual_qa_profissionais.sh`, provando que:
  - checklist pendente falha;
  - checklist aprovado passa;
  - checklist com um item reaberto volta a falhar.
- `scripts/staging_evidence_profissionais.sh` agora:
  - gera `manual-qa-checklist.md` no pacote de evidencias;
  - registra `manual-qa-template.log`;
  - permite exigir aprovacao manual com
    `PROFISSIONAIS_REQUIRE_MANUAL_QA=true`.
- `scripts/test_staging_evidence_screenshots_profissionais.sh` agora tambem
  valida que o checklist manual entra no pacote de evidencias.
- `docs/deploy/env.production.example`,
  `docs/deploy/staging_production_profissionais.md` e
  `docs/deploy/production_readiness_profissionais.md` foram atualizados com as
  variaveis e comandos do gate manual.
- Removido o arquivo residuo `-b` da raiz do projeto.

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/create_staging_manual_qa_checklist_profissionais.sh scripts/check_staging_manual_qa_profissionais.sh scripts/test_staging_manual_qa_profissionais.sh scripts/staging_evidence_profissionais.sh scripts/test_staging_evidence_screenshots_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_staging_manual_qa_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_staging_evidence_screenshots_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_check_profissionais_env.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'curl -Is http://127.0.0.1:3001/demo | head -n 1; xargs -r -a tmp/frontend-dev.pid ps -fp 2>/dev/null || true'
```

Resultado:

- `OK staging manual QA gate`.
- `OK staging evidence screenshots`.
- `OK check_profissionais_env`.
- Hot reload local continua ativo em `http://127.0.0.1:3001/demo` com
  `HTTP/1.1 200 OK`.
- `git status` continua indisponivel/fora de repositorio:
  `no-git-repository`.

Estado atual:

- O gate manual de staging agora existe e e validavel por script.
- Ainda nao ha staging real aprovado porque faltam `.env.production` real fora
  do repo, servidor/Nginx ativo, DNS/TLS, deploy, preflight remoto real, smoke
  remoto autenticado e checklist manual preenchido no dominio real.

Proximo passo recomendado:

1. Criar `.env.production` real fora do repo/gestor de secrets.
2. Subir `compose.production.example.yaml` no servidor de staging.
3. Instalar Nginx com `docs/deploy/nginx-profissionais.example.conf` e emitir
   TLS.
4. Rodar:

```bash
PROFISSIONAIS_ENV_FILE=.env.production \
PROFISSIONAIS_RUN_REMOTE_CHECKS=true \
PROFISSIONAIS_RUN_SCREENSHOTS=true \
PROFISSIONAIS_REQUIRE_MANUAL_QA=true \
PROFISSIONAIS_SCREENSHOT_BASE_URL=https://profiangola.ao \
bash ./scripts/staging_evidence_profissionais.sh
```

AVISO: O proximo passo real depende de infraestrutura externa: env real,
servidor, Nginx, DNS/TLS e credenciais de staging. Sem isso, o projeto pode
continuar a melhorar localmente, mas nao deve ser marcado como pronto no "Z".

## Ultima etapa concluida: hot reload local do frontend ativado

Objetivo: parar o ciclo de rebuild do frontend local e deixar o MVP em modo de
desenvolvimento com hot reload na porta `3001`, mantendo Rails/API em `3000`.

Foi feito:

- Criado `scripts/run_frontend_dev_profissionais.sh` como runner foreground do
  `next dev`, com env local padrao para Rails em `http://127.0.0.1:3000`.
- Criado `scripts/start_frontend_dev_profissionais.sh` para:
  - remover apenas o container production local `profissionais-next-local`;
  - parar PID antigo de dev, quando existir;
  - subir o frontend Next em modo dev/hot reload na porta `3001`;
  - gravar PID em `tmp/frontend-dev.pid` e log em `tmp/frontend-dev.log`;
  - esperar `/demo` responder antes de retornar OK.
- Criado `scripts/stop_frontend_dev_profissionais.sh` para parar o processo dev
  registrado no PID file.
- `README.md` foi atualizado para usar o script de hot reload em vez de orientar
  rebuild/manual `npm run dev` solto.
- O browser embutido foi recarregado em `http://127.0.0.1:3001/demo`.

Estado local atual:

- `http://127.0.0.1:3001` esta rodando `next dev` com Turbopack/hot reload.
- `http://127.0.0.1:3000` continua sendo Rails/API via Docker.
- O container production local `profissionais-next-local` foi removido para nao
  disputar a porta `3001`.

Comandos uteis:

```bash
bash scripts/start_frontend_dev_profissionais.sh
bash scripts/stop_frontend_dev_profissionais.sh
tail -f tmp/frontend-dev.log
```

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/start_frontend_dev_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'xargs -r -a tmp/frontend-dev.pid ps -fp; ss -ltnp 2>/dev/null | grep ":3001" || true; curl -Is http://127.0.0.1:3001/demo | head -n 1'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/smoke_frontend_routes_profissionais.sh'
```

Resultado:

- Processo `npm run dev -H 0.0.0.0 -p 3001` ficou ativo.
- `curl -I http://127.0.0.1:3001/demo` retornou `HTTP/1.1 200 OK`.
- `bash scripts/smoke_frontend_routes_profissionais.sh` passou.
- Browser embutido confirmou URL `/demo`, titulo `ProfiAngola` e H1
  `Teste o marketplace de ponta a ponta.`

AVISO: O frontend local agora deve ser trabalhado via hot reload em `3001`, nao
via rebuild do container Next a cada ajuste. O proximo gate de produto continua
sendo staging real com DNS/TLS/Nginx, smoke remoto autenticado, screenshots
seguros e QA manual multi-perfil. Antes de continuar, leia este arquivo para
retomar sem desfazer o modo dev local.

## Ultima etapa concluida: screenshots de demo e evidencia visual automatizada

Objetivo: fechar a lacuna de "screenshots/demo do fluxo" do plano comercial,
criando um gate reproduzivel para capturas seguras em local/staging.

Foi feito:

- Criado `scripts/capture_profissionais_demo_screenshots.sh`:
  - usa Docker com a imagem Playwright/Chromium ja disponivel;
  - por padrao captura via rede `host`, preservando URLs locais de Next e Rails;
  - aceita `PROFISSIONAIS_SCREENSHOT_BASE_URL`,
    `PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR` e credenciais por perfil;
  - gera `README.md`, `manifest.json` e PNGs em `tmp/demo-screenshots/...`.
- Criado `scripts/qa/capture_profissionais_demo_screenshots.mjs` sem
  dependencias npm novas:
  - controla Chromium via Chrome DevTools Protocol;
  - captura public home, demo, cliente, profissionais e ajuda;
  - autentica cliente, profissional e admin para capturar pedidos, novo pedido,
    vagas, carteira, dashboard operacional e rede operacional;
  - valida texto esperado, ausencia de `Application error`, ausencia de
    overflow horizontal e ausencia de imagens carregadas quebradas;
  - grava dump de debug quando alguma captura falha.
- Criado `scripts/test_staging_evidence_screenshots_profissionais.sh`, provando
  que o pacote de evidencias consegue gerar screenshots quando
  `PROFISSIONAIS_RUN_SCREENSHOTS=true`.
- `scripts/staging_evidence_profissionais.sh` passou a aceitar
  `PROFISSIONAIS_RUN_SCREENSHOTS` e anexar `demo-screenshots/` ao pacote.
- `docs/deploy/env.production.example`,
  `docs/deploy/production_readiness_profissionais.md` e
  `docs/deploy/staging_production_profissionais.md` foram atualizados com as
  variaveis e comandos de screenshots seguros.
- A copy da hero de `/demo` foi encurtada para melhorar 320px:
  "Teste o marketplace de ponta a ponta."

Arquivos principais:

- `scripts/capture_profissionais_demo_screenshots.sh`
- `scripts/qa/capture_profissionais_demo_screenshots.mjs`
- `scripts/test_staging_evidence_screenshots_profissionais.sh`
- `scripts/staging_evidence_profissionais.sh`
- `scripts/test_check_profissionais_env.sh`
- `frontend/src/app/(public)/demo/page.tsx`
- `docs/deploy/env.production.example`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run verify'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/capture_profissionais_demo_screenshots.sh scripts/staging_evidence_profissionais.sh scripts/test_check_profissionais_env.sh && node --check scripts/qa/capture_profissionais_demo_screenshots.mjs && bash scripts/test_check_profissionais_env.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR=tmp/demo-screenshots/test-local bash scripts/capture_profissionais_demo_screenshots.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_staging_evidence_screenshots_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_check_profissionais_env.sh && bash scripts/smoke_frontend_routes_profissionais.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'git status --short 2>/dev/null || echo no-git-repository'
```

Resultado:

- `npm run verify` passou: OpenAPI, ESLint, typecheck e build Next.
- Build Docker do frontend passou e container local em `127.0.0.1:3001` foi
  reconstruido.
- `bash scripts/capture_profissionais_demo_screenshots.sh` gerou 12 capturas em
  `tmp/demo-screenshots/test-local`:
  - public-home-desktop;
  - public-demo-mobile;
  - public-demo-desktop;
  - public-client-tablet;
  - public-professionals-desktop;
  - public-help-mobile;
  - client-orders-desktop;
  - client-new-request-mobile;
  - professional-jobs-desktop;
  - professional-wallet-mobile;
  - operations-dashboard-desktop;
  - operations-network-tablet.
- `manifest.json` confirmou para as capturas:
  - sem overflow horizontal;
  - sem `Application error`;
  - sem imagens carregadas quebradas;
  - textos esperados encontrados.
- `bash scripts/test_staging_evidence_screenshots_profissionais.sh` passou e
  confirmou integracao com `tmp/staging-evidence/test-screenshots`.
- `bash scripts/test_check_profissionais_env.sh` e
  `bash scripts/smoke_frontend_routes_profissionais.sh` passaram.
- `git status` continua retornando `no-git-repository`.

Estado atual:

- A exigencia local de screenshots/demo do fluxo agora tem evidencia concreta e
  automacao reutilizavel.
- Os screenshots foram gerados com dados de seed/local; para demonstracao real,
  ainda devem ser gerados novamente no dominio de staging com credenciais de
  staging e sem dados sensiveis.
- O produto ainda nao esta no "Z" porque falta staging externo validado com
  DNS/TLS/Nginx, smoke remoto autenticado e QA manual no dominio real.

Estado do projeto:

- Fase/trilha atual: preparacao comercial/QA visual local concluida; staging
  real continua sendo o gate principal restante.
- Solido agora: UX publica, demo guiada, onboarding/FAQ/contactos, screenshots
  locais publicos e autenticados, RBAC, sessao/cookies, auditoria, logs runtime,
  gates locais de staging.
- Falta imediato: executar o mesmo pacote no dominio real com
  `PROFISSIONAIS_RUN_REMOTE_CHECKS=true` e
  `PROFISSIONAIS_RUN_SCREENSHOTS=true`; validar manualmente mobile/tablet/desktop
  no dominio externo.
- Distancia do fim: quase fim local; nao completo por falta de infraestrutura
  externa e evidencias remotas.

## Proximo passo recomendado

Rodar a validacao completa no dominio real quando DNS/TLS/Nginx e credenciais de
staging estiverem prontos:

```bash
PROFISSIONAIS_ENV_FILE=.env.production \
PROFISSIONAIS_RUN_REMOTE_CHECKS=true \
PROFISSIONAIS_RUN_SCREENSHOTS=true \
PROFISSIONAIS_SCREENSHOT_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_SMOKE_EMAIL=<cliente_staging> \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
PROFISSIONAIS_SCREENSHOT_CLIENT_EMAIL=<cliente_staging> \
PROFISSIONAIS_SCREENSHOT_PROFESSIONAL_EMAIL=<profissional_staging> \
PROFISSIONAIS_SCREENSHOT_ADMIN_EMAIL=<admin_staging> \
PROFISSIONAIS_SCREENSHOT_PASSWORD=<senha_staging> \
bash ./scripts/staging_evidence_profissionais.sh
```

AVISO: O proximo passo e criar/implementar a validacao de staging real em dominio com DNS/TLS/Nginx, smoke remoto autenticado, screenshots seguros e QA manual multi-perfil. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: preparacao comercial e demo guiada publica

Objetivo: avancar a parte comercial do plano profissional para que uma pessoa
externa entenda e consiga testar o MVP sem explicacao tecnica.

Foi feito:

- Criada a rota publica `frontend/src/app/(public)/demo/page.tsx` com:
  - hero visual usando asset real de operacao;
  - roteiro por perfil: cliente, operacao e profissional;
  - cenas do fluxo cliente -> operacao -> profissional com imagens existentes;
  - checklist de aceitacao para demonstracao comercial;
  - notas de staging seguro para evitar secrets/dados reais em screenshots;
  - CTA final para criar pedido e ver rede profissional.
- A home (`frontend/src/app/page.tsx`) agora aponta para a demo guiada na CTA
  final, mantendo privacidade acessivel.
- A pagina de ajuda (`frontend/src/app/(public)/ajuda/page.tsx`) ganhou:
  - link para demo guiada;
  - FAQ ampliado com entrada profissional, teste antes de apresentacao e
    contactos;
  - secao de contactos separando suporte operacional e privacidade.
- A pagina publica de profissionais
  (`frontend/src/app/(public)/profissionais/page.tsx`) ganhou onboarding
  profissional com passos de cadastro, documentos, categorias e area privada.
- `frontend/src/app/(public)/privacidade/page.tsx` e
  `frontend/src/app/(public)/termos/page.tsx` tiveram copy ajustada para
  ProfiAngola e email `privacidade@profiangola.ao`.
- `frontend/src/components/layout/public-footer.tsx` agora mostra
  `suporte@profiangola.ao` alem do canal de privacidade.
- `scripts/smoke_frontend_routes_profissionais.sh` passou a cobrir `/demo`.

Arquivos principais:

- `frontend/src/app/(public)/demo/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/(public)/ajuda/page.tsx`
- `frontend/src/app/(public)/profissionais/page.tsx`
- `frontend/src/app/(public)/privacidade/page.tsx`
- `frontend/src/app/(public)/termos/page.tsx`
- `frontend/src/components/layout/public-footer.tsx`
- `scripts/smoke_frontend_routes_profissionais.sh`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run lint'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run typecheck'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run build'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais/frontend -- bash -lc 'npm run verify'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/smoke_frontend_routes_profissionais.sh && echo smoke-syntax-ok'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
Browser interno em `http://127.0.0.1:3001/demo` com viewport 320x900
```

Resultado:

- `npm run verify` passou: OpenAPI gerado, ESLint, typecheck e build Next.
- Build Docker do frontend passou e a rota `/demo` aparece no mapa do Next.
- Container Next local foi reconstruido e substituido em `127.0.0.1:3001`.
- Checks HTTP confirmaram:
  - `/demo` HTTP 200, contem "Demo guiada" e nao contem "Application error";
  - `/ajuda` HTTP 200, contem `suporte@profiangola.ao` e sem erro;
  - `/` HTTP 200, contem "Ver demo guiada" e sem erro.
- Smoke completo de frontend passou em `http://127.0.0.1:3001`, incluindo a
  nova rota `/demo` e rotas autenticadas de cliente, profissional e admin.
- Browser interno em 320px confirmou:
  - `viewportWidth: 320`;
  - `documentScrollWidth/bodyScrollWidth: 305`;
  - sem overflow horizontal;
  - sem imagens carregadas quebradas;
  - sem erros de console;
  - H1 e CTA/conteudo de demo presentes.
- Captura de screenshot pelo browser interno expirou duas vezes no comando CDP
  `Page.captureScreenshot`; portanto nao ha screenshot visual anexado como
  evidencia desta etapa.
- `git status` continua retornando `no-git-repository`; este diretorio ainda
  nao e um repositorio Git.

Estado atual:

- A frente comercial publica ficou mais demonstravel: existe uma pagina de demo
  guiada, onboarding profissional publico, FAQ melhor e canais de suporte.
- O MVP local continua validado por build, smoke e audit mobile 320px.
- Ainda falta staging real com dominio externo, `.env.production` real fora do
  repo, Nginx, DNS/TLS, smoke remoto autenticado e QA manual multi-perfil.

Estado do projeto:

- Fase/trilha atual: preparacao comercial local concluida parcialmente; staging
  real e QA externo continuam como proximos gates obrigatorios.
- Solido agora: UX publica principal, demo guiada, suporte/FAQ, onboarding
  profissional, RBAC/sessao/auditoria/logs e gates locais de staging.
- Falta imediato: validar visualmente em browser desktop amplo quando possivel,
  gerar screenshots/demo no dominio real, provisionar staging externo e rodar
  pacote completo de evidencias.
- Distancia do fim: quase fim local e comercialmente mais apresentavel; ainda
  nao esta no "Z" porque nao ha dominio real validado nem screenshots/QA de
  staging externo.

## Proximo passo recomendado

Provisionar/usar staging real e executar a validacao externa completa. Quando o
dominio estiver apontado e as credenciais de staging existirem:

```bash
PROFISSIONAIS_ENV_FILE=.env.production \
PROFISSIONAIS_RUN_REMOTE_CHECKS=true \
PROFISSIONAIS_SMOKE_EMAIL=<cliente_staging> \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/staging_evidence_profissionais.sh
```

Depois abrir `/demo`, `/cliente`, `/profissionais`, `/pedidos/novo`,
`/operacoes` e `/profissional/vagas` no dominio real em mobile, tablet e
desktop, registrando screenshots sem dados sensiveis.

AVISO: O proximo passo e criar/implementar a validacao de staging real em dominio com DNS/TLS/Nginx, smoke remoto autenticado, screenshots seguros e QA manual multi-perfil. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: gates de staging e pacote de evidencias

Objetivo: continuar a trilha de staging profissional, transformando os checks de
deploy em gates reproduziveis para `.env.production`, Docker Compose, preflight
local e evidencias de liberacao.

Foi feito:

- `scripts/check_profissionais_env.sh` agora valida tambem:
  - `RAILS_LOG_LEVEL` limitado a `info`, `warn`, `error` ou `fatal`;
  - `SESSION_TIMEOUT_MINUTES` entre 15 e 1440 minutos;
  - `DEVISE_REMEMBER_FOR_DAYS` entre 1 e 30 dias;
  - `DEVISE_MAILER_SENDER` presente e com formato de email.
- Criado `scripts/staging_evidence_profissionais.sh`, que gera um pacote em
  `tmp/staging-evidence/<timestamp>` com README e logs de env-check,
  compose-config, smoke integrado, preflight local e checks remotos quando
  habilitados.
- O script de evidencias ficou independente do diretorio atual: ele descobre a
  raiz do repo e chama os demais scripts via `bash`.
- Criado `scripts/test_check_profissionais_env.sh`, cobrindo:
  - env valido baseado em `docs/deploy/env.production.example`;
  - rejeicao de `SESSION_TIMEOUT_MINUTES` inseguro;
  - rejeicao de `RAILS_LOG_LEVEL=debug` em producao;
  - `docker compose config`;
  - execucao leve do pacote de evidencias com smokes remotos/local pesado
    desabilitados.
- `compose.production.example.yaml` agora passa para Rails/Next as variaveis
  novas de logs, sessao, rememberable, mailer sender e rate limits.
- `docs/deploy/env.production.example` foi atualizado com as variaveis de
  Devise/sessao/evidencias.
- `docs/deploy/production_readiness_profissionais.md` e
  `docs/deploy/staging_production_profissionais.md` foram atualizados com:
  - comandos padronizados como `bash ./scripts/...`;
  - novo teste de env/compose/evidencias;
  - criterio de pronto exigindo pacote em `tmp/staging-evidence/`.

Arquivos principais:

- `scripts/check_profissionais_env.sh`
- `scripts/staging_evidence_profissionais.sh`
- `scripts/test_check_profissionais_env.sh`
- `compose.production.example.yaml`
- `docs/deploy/env.production.example`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`

Verificacao executada:

```bash
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash -n scripts/staging_evidence_profissionais.sh scripts/check_profissionais_env.sh scripts/test_check_profissionais_env.sh scripts/test_preflight_profissionais_staging.sh scripts/preflight_profissionais_staging.sh scripts/smoke_profissionais_deploy.sh && echo bash-syntax-ok'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_check_profissionais_env.sh'
wsl.exe -d Ubuntu --cd /tmp -- bash -lc 'bash /home/alexandre/profissionais/scripts/test_check_profissionais_env.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'bash scripts/test_preflight_profissionais_staging.sh'
wsl.exe -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'git status --short 2>/dev/null || echo no-git-repository'
```

Resultado:

- Sintaxe Bash passou para scripts de env, evidencias, preflight e smoke deploy.
- `bash scripts/test_check_profissionais_env.sh` passou e confirmou env-check,
  rejeicoes negativas, `docker compose config` e pacote leve de evidencias.
- O mesmo teste tambem passou quando chamado a partir de `/tmp`, confirmando que
  a execucao nao depende do diretorio atual.
- `bash scripts/test_preflight_profissionais_staging.sh` passou:
  - cookie seguro com `Domain`, `Secure`, `HttpOnly` e `SameSite=Lax`;
  - headers defensivos presentes;
  - rotas publicas/operacionais simuladas responderam;
  - login/logout autenticado passaram;
  - tentativa de cliente gravar `budget_cents` interno foi bloqueada;
  - caso negativo de cookie sem `HttpOnly` foi bloqueado.
- `git status` confirmou que `/home/alexandre/profissionais` ainda nao e um
  repositorio Git.

Estado atual:

- Os gates locais de staging estao mais profissionais e reproduziveis.
- A documentacao operacional ja explica como validar `.env.production`,
  compose, preflight, smoke e pacote de evidencias.
- Ainda nao existe evidencia de staging real em dominio externo: falta
  `.env.production` real fora do repo, Nginx ativo, DNS/TLS, smoke remoto
  autenticado e browser manual no dominio com cliente/profissional/admin.

Estado do projeto:

- Fase/trilha atual: staging profissional, depois de concluir a parte local dos
  gates e evidencias.
- Solido agora: fluxo MVP local, UX principal, RBAC, auditoria, sessao/cookies,
  logs runtime, preflight local e validacao de env/compose/evidencias.
- Falta imediato: provisionar ambiente real de staging, preencher secrets fora
  do repo, configurar Nginx/DNS/TLS, rodar o pacote com
  `PROFISSIONAIS_RUN_REMOTE_CHECKS=true` e fazer QA manual no dominio real.
- Distancia do fim: quase fim tecnico local; produto ainda nao chegou ao "Z"
  porque falta evidencia remota real e validacao externa multi-perfil.

## Proximo passo recomendado

Provisionar staging real e rodar o pacote completo:

```bash
PROFISSIONAIS_ENV_FILE=.env.production \
PROFISSIONAIS_RUN_REMOTE_CHECKS=true \
PROFISSIONAIS_SMOKE_EMAIL=<cliente_staging> \
PROFISSIONAIS_SMOKE_PASSWORD=<senha_cliente_staging> \
bash ./scripts/staging_evidence_profissionais.sh
```

Depois abrir o dominio real no browser e validar cliente, profissional e admin.

AVISO: O proximo passo e criar/implementar a validacao de staging real em dominio com DNS/TLS/Nginx, smoke remoto autenticado e QA manual multi-perfil. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: observabilidade runtime logs estruturados

Objetivo: continuar a fase 5/entrada de staging, adicionando logs de runtime
acionaveis e seguros para eventos criticos sem expor PII ou segredos.

Foi feito:

- Criado `Current` com `request_id` e `user` para contexto por request.
- `ApplicationController` agora envolve requests em contexto `Current`, antes
  da autenticacao e demais callbacks.
- Criado `StructuredEventLog`:
  - escreve JSON em `Rails.logger`;
  - inclui `event`, `emitted_at`, `request_id`, `actor_id` e `actor_role`
    quando disponiveis;
  - filtra recursivamente campos sensiveis como email, password, token,
    cookie, session, authorization, secret, certificate e chaves similares.
- `AuditLog.record!` agora tambem emite evento runtime
  `audit_log.recorded` com acao, ator, alvo e metadata filtrada.
- `Api::V1::SessionsController` agora emite:
  - `auth.login_succeeded`;
  - `auth.login_failed`;
  - `auth.logout_succeeded`.
- `Api::V1::BaseController#render_error` agora emite `api.error` com codigo,
  status HTTP, metodo, path, controller e action.
- `Rack::Attack` agora emite `security.rate_limited` quando throttles
  bloqueiam requests.
- `Rack::Attack` tambem foi corrigido para usar `X-Real-IP` somente quando o
  request veio de proxy privado/local confiavel, evitando depender do primeiro
  IP em `X-Forwarded-For` para rate limit de login.
- Testes foram adicionados/atualizados para provar:
  - JSON logado com contexto de request;
  - filtragem recursiva de dados sensiveis;
  - log runtime para auditoria;
  - log runtime para login falhado, login bem-sucedido e logout;
  - log runtime para rate limit;
  - throttle por IP canonico atras de proxy confiavel.

Arquivos principais:

- `app/models/current.rb`
- `app/services/structured_event_log.rb`
- `app/controllers/application_controller.rb`
- `app/controllers/api/v1/base_controller.rb`
- `app/controllers/api/v1/sessions_controller.rb`
- `app/models/audit_log.rb`
- `config/initializers/rack_attack.rb`
- `test/services/structured_event_log_test.rb`
- `test/models/audit_log_test.rb`
- `test/integration/api_v1_contract_test.rb`
- `test/integration/rate_limit_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose exec -T -e RAILS_ENV=test web bash -lc "bin/rails db:drop db:create db:schema:load && bin/rails test test/services/structured_event_log_test.rb test/models/audit_log_test.rb test/integration/api_v1_contract_test.rb test/integration/rate_limit_test.rb"
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose exec -T -e RAILS_ENV=test web bash -lc "bin/rails db:drop db:create db:schema:load && bin/rails test"
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:migrate db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
```

Resultado:

- Testes focados finais passaram: `32 runs, 158 assertions, 0 failures,
  0 errors, 0 skips`.
- Suite Rails completa passou: `105 runs, 515 assertions, 0 failures,
  0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, ESLint, typecheck e build Next.
- Backend foi reconstruido/reiniciado com `docker compose up -d --build`.
- Seeds/migrations de desenvolvimento foram executados.
- Smoke permanente passou em `http://127.0.0.1:3001`.
- Smoke integrado Rails+Next passou:
  - login via Next rotacionou cookie e redirecionou para `/pedidos`;
  - Rails aceitou cookie emitido pelo fluxo Next;
  - cliente autenticado nao gravou `budget_cents` interno;
  - logout expirou cookie;
  - Rails rejeitou cookie apos logout;
  - host nao permitido caiu na origem canonica.
- Ao tentar uma checagem extra final de logs reais no container e health local,
  `wsl.exe -d Ubuntu ...` voltou a falhar com `Wsl/Service/0x8007274c`; o
  filesystem via `\\wsl.localhost` respondeu, mas comandos WSL e portas
  `127.0.0.1:3000/3001` passaram a dar timeout nessa janela final. Essa falha
  ocorreu depois dos testes e smokes terem passado. O proximo agente deve
  comecar verificando/reiniciando o runtime local antes de novas validacoes
  manuais.
- `git status` nao foi possivel anteriormente porque `/home/alexandre/profissionais`
  nao e um repositorio Git.

Estado atual:

- Observabilidade de runtime para eventos criticos agora existe e tem testes:
  login, logout, erros API, rate limit e auditoria persistida deixam rastro JSON
  filtrado.
- A trilha local de seguranca/confianca esta forte: RBAC, bloqueio de dados
  internos, cookies/sessao, mensagens publicas, auditoria e logs runtime
  estruturados.
- Ainda falta validar staging real com dominio/DNS/TLS e browser manual remoto.
- O runtime local precisa de checagem/restart no proximo passo por causa da
  instabilidade final do WSL/portas apos os smokes.

Estado do projeto:

- Fase/trilha atual: fim da fase 5 local, entrando em staging profissional e
  revisao comercial/QA final.
- Solido agora: frontend principal, rotas por perfil, fluxo operacional, RBAC,
  auditoria, sessao/cookies, mensagens publicas e logs de runtime.
- Falta imediato: recuperar/confirmar runtime local, executar preflight local de
  staging se necessario, preparar/validar staging real em dominio com
  credenciais cliente/profissional/admin e terminar revisao comercial final.
- Distancia do fim: quase fim tecnico local; o produto ainda nao esta no "Z"
  porque staging real e validacao externa permanecem sem evidencia.

## Proximo passo recomendado

Comecar recuperando/confirmando o runtime local (`wsl`, containers e portas
3000/3001), depois avancar para validacao de staging profissional: preflight
local, `.env.production` fora do repo, Nginx, DNS/TLS, smoke remoto autenticado
e browser manual no dominio real com cliente/profissional/admin.

AVISO: O proximo passo e criar/implementar a validacao de staging profissional em dominio real, com recuperacao previa do runtime local se o WSL continuar instavel. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: hardening de sessao cookies e mensagens publicas

Objetivo: continuar a fase 5 de seguranca e confianca, tornando garantias de
sessao/cookie explicitas e impedindo que mensagens publicas ecoem detalhes
internos ou texto livre de query string.

Foi feito:

- `config/initializers/session_store.rb` agora declara `httponly: true`
  explicitamente no cookie store Rails.
- `config/initializers/devise.rb` foi endurecido:
  - `config.paranoid = true`;
  - `mailer_sender` configuravel por `DEVISE_MAILER_SENDER`, com fallback do
    dominio do produto;
  - `remember_for` configuravel por `DEVISE_REMEMBER_FOR_DAYS`, com fallback de
    7 dias;
  - `rememberable_options` alinhado ao cookie de sessao: dominio, `HttpOnly`,
    `SameSite` e `Secure` quando aplicavel;
  - `timeout_in` configuravel por `SESSION_TIMEOUT_MINUTES`, com fallback de
    720 minutos.
- `User` passou a usar o modulo Devise `:timeoutable`.
- `Api::V1::BaseController#render_bad_request` deixou de retornar
  `ParameterMissing#message` e agora responde mensagem publica generica:
  `Pedido invalido.`
- O fluxo Next de login deixou de colocar texto livre em `?erro=`:
  - criado `frontend/src/lib/auth/login-errors.ts` com codigos conhecidos;
  - `frontend/src/app/api/auth/login/route.ts` agora redireciona com codigos
    (`invalid_credentials`, `missing_credentials`, `rate_limited`,
    `session_failed`, `invalid_request`);
  - `frontend/src/app/(auth)/login/page.tsx` so renderiza mensagens mapeadas,
    ignorando textos arbitrarios na query.
- Testes Rails foram ampliados para:
  - provar cookie de login com `HttpOnly`, `SameSite` e `Secure` quando
    configurado;
  - provar erro publico generico para payload de login invalido;
  - provar falha de credenciais sem enumerar usuario;
  - provar `timeoutable`, `paranoid` e opcoes hardened de rememberable.

Arquivos principais:

- `config/initializers/session_store.rb`
- `config/initializers/devise.rb`
- `app/models/user.rb`
- `app/controllers/api/v1/base_controller.rb`
- `frontend/src/lib/auth/login-errors.ts`
- `frontend/src/app/api/auth/login/route.ts`
- `frontend/src/app/(auth)/login/page.tsx`
- `test/integration/api_v1_contract_test.rb`
- `test/models/user_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/models/user_test.rb test/integration/api_v1_contract_test.rb test/integration/rate_limit_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose exec -T -e RAILS_ENV=test web bash -lc "bin/rails db:drop db:create db:schema:load && bin/rails test test/models/user_test.rb test/integration/api_v1_contract_test.rb test/integration/rate_limit_test.rb"
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose exec -T -e RAILS_ENV=test web bash -lc "bin/rails db:drop db:create db:schema:load && bin/rails test"
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:migrate db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e PORT=3001 -e HOSTNAME=0.0.0.0 -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
```

Resultado:

- O wrapper `./scripts/test_rails_compose.sh ...` falhou duas vezes antes de
  iniciar Rails, com erro transitorio do servico WSL (`Wsl/Service/0x8007274c`).
  A validacao Rails foi executada diretamente no container ativo.
- Testes focados passaram: `28 runs, 128 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa passou: `101 runs, 485 assertions, 0 failures, 0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, ESLint, typecheck e build Next.
- Build Docker do frontend passou.
- Smoke permanente passou em `http://127.0.0.1:3001`.
- Smoke integrado Rails+Next passou:
  - login via Next rotacionou cookie e redirecionou para `/pedidos`;
  - cookie aceito por Rails em `/api/v1/me`;
  - `budget_cents` interno bloqueado para cliente;
  - logout expirou cookie e redirecionou para `/login`;
  - Rails rejeitou cookie apos logout;
  - host nao permitido caiu na origem canonica.
- Browser interno confirmou:
  - `/login?erro=invalid_credentials` mostra `Email ou senha invalidos.`;
  - `/login?erro=password%20interno%20vazado` nao ecoa o texto arbitrario e
    mantem a tela de login normal.
- Ambiente local esperado ativo:
  - `profissionais-db-1` saudavel;
  - `profissionais-web-1` em `127.0.0.1:3000`;
  - `profissionais-next-local` em `127.0.0.1:3001`.
- `git status` nao foi possivel porque `/home/alexandre/profissionais` nao e
  um repositorio Git.

Estado atual:

- Fase 5 de seguranca/confianca avancou mais um bloco: cookies/sessao e
  mensagens publicas de login/erro estao mais profissionais e testados.
- RBAC sensivel, auditoria transacional, cookie HttpOnly/SameSite, timeout de
  sessao, rememberable endurecido, logout/revogacao e mensagens publicas
  genericas agora tem evidencia automatizada/local.
- A meta profissional completa ainda nao terminou; falta fechar observabilidade
  e logs de runtime, staging real com DNS/TLS e validacao manual/remota, alem
  de preparo comercial final.

Estado do projeto:

- Fase/trilha atual: fase 5, seguranca e confianca operacional, entrando em
  observabilidade/staging.
- Solido agora: frontend e rotas principais, filtros operacionais, RBAC,
  auditoria, sessao/cookies e mensagens publicas.
- Falta imediato: logs/observabilidade de runtime, documentar/validar staging
  real e revisar paginas comerciais finais com demo externa.
- Distancia do fim: quase fim da trilha tecnica local do MVP; ainda nao e fim
  do produto porque falta staging real e validacao externa.

## Proximo passo recomendado

Continuar com observabilidade/logs de runtime e staging profissional: garantir
logs estruturados/acionaveis para acoes importantes, revisar comandos de
preflight remoto, validar `.env.production` fora do repo, Nginx, DNS/TLS e
smoke remoto autenticado quando houver dominio/credenciais.

AVISO: O proximo passo e criar/implementar observabilidade/logs de runtime e validacao de staging profissional. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: auditoria transacional de acoes criticas

Objetivo: continuar a fase 5 de seguranca e confianca, adicionando uma trilha
persistente de auditoria para acoes operacionais que mudam estado sensivel.

Foi feito:

- Criada a tabela `audit_logs` com:
  - ator opcional (`actor_id`) com FK para `users` e `on_delete: :nullify`;
  - alvo polimorfico (`auditable_type`/`auditable_id`);
  - `action` obrigatoria;
  - `metadata` JSONB com default `{}`;
  - indices por ator, alvo, acao e data.
- Criado o model `AuditLog` com lista fechada de acoes permitidas e helper
  `AuditLog.record!`.
- `ServiceRequests::Assign` agora registra `service_request.assigned` dentro
  da transacao, incluindo profissional atribuido, profissional anterior e
  transicao de estado.
- `ServiceRequests::UpdateStatus` agora registra
  `service_request.status_updated` dentro da transacao, incluindo estado
  anterior e proximo estado.
- A revisao de documentos profissionais agora registra
  `professional_document.reviewed`, incluindo profissional, tipo de documento,
  transicao do documento e transicao do estado documental do profissional.
- O endpoint de atribuicao de pedido passou a enviar `current_user` como ator
  da auditoria.
- Testes focados foram adicionados/atualizados para provar registro positivo e
  ausencia de registro em acoes rejeitadas.

Arquivos principais:

- `db/migrate/20260603103000_create_audit_logs.rb`
- `db/schema.rb`
- `app/models/audit_log.rb`
- `app/models/user.rb`
- `app/services/service_requests/assign.rb`
- `app/services/service_requests/update_status.rb`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/controllers/api/v1/professional_documents_controller.rb`
- `test/models/audit_log_test.rb`
- `test/services/service_requests/assign_test.rb`
- `test/services/service_requests/update_status_test.rb`
- `test/integration/professional_documents_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:migrate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/models/audit_log_test.rb test/services/service_requests/assign_test.rb test/services/service_requests/update_status_test.rb test/integration/professional_documents_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:migrate db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e PORT=3001 -e HOSTNAME=0.0.0.0 -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- Testes focados passaram: `23 runs, 125 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa passou: `97 runs, 464 assertions, 0 failures, 0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, ESLint, typecheck e build Next.
- Smoke permanente passou em `http://127.0.0.1:3001`.
- Ambiente local esperado ativo:
  - `profissionais-db-1` saudavel;
  - `profissionais-web-1` em `127.0.0.1:3000`;
  - `profissionais-next-local` em `127.0.0.1:3001`.
- `git status` nao foi possivel porque `/home/alexandre/profissionais` nao e
  um repositorio Git.

Estado atual:

- Fase 5 de seguranca/confianca avancou: RBAC sensivel e auditoria de acoes
  criticas agora estao cobertos por testes.
- Acoes operacionais importantes deixam rastro persistente no banco, com
  metadata sem dados secretos e com relacionamento ao ator quando existe.
- A meta profissional completa ainda nao terminou; falta fechar hardening de
  sessao/cookies, mensagens publicas, observabilidade/logs de runtime, staging
  real e camada comercial/operacional.

Estado do projeto:

- Fase/trilha atual: fase 5, seguranca e confianca operacional.
- Solido agora: frontend reconstruido nas rotas principais, operacoes/pedidos
  com filtros, RBAC sensivel testado e auditoria transacional implementada.
- Falta imediato: endurecer sessao/cookies, revisar mensagens publicas,
  acrescentar logs/observabilidade de runtime e preparar staging real.
- Distancia do fim: meio para fim na trilha tecnica do MVP; ainda nao e fim de
  produto porque faltam staging, operacao comercial e validacao de producao.

## Proximo passo recomendado

Continuar a fase 5 com hardening de sessao/cookies e mensagens publicas:
revisar configuracao de Devise/session store, cookies Secure/SameSite/HttpOnly
por ambiente, expiracao/rememberable, respostas publicas de login/erro e
possiveis mensagens que revelem informacao sensivel.

AVISO: O proximo passo e criar/implementar hardening de sessao/cookies e mensagens publicas. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: testes RBAC/API sensiveis ampliados

Objetivo: continuar a fase 5 de seguranca e confianca, adicionando testes
focados para fronteiras de papel que ainda nao estavam cobertas explicitamente.

Foi feito:

- `test/integration/security_hardening_test.rb` ganhou cobertura para:
  - profissional nao criar pedido de cliente por API;
  - profissional nao acessar o dashboard operacional por API;
  - profissional nao ver pagamentos de outro profissional em `/api/v1/payments`.
- Helpers do teste foram ajustados para criar pagamentos associados a
  profissionais diferentes sem mexer no codigo de producao.
- Nenhuma falha real de backend foi encontrada nesta passada; as policies e
  scopes atuais bloquearam os acessos como esperado.

Arquivos principais:

- `test/integration/security_hardening_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- Teste Rails de hardening passou: `15 runs, 47 assertions, 0 failures,
  0 errors, 0 skips`.
- Backend/Postgres foram reconstruidos e seeds demo executados.
- Smoke permanente passou novamente em `http://127.0.0.1:3001`.

Estado atual:

- Fase 5 de seguranca/RBAC segue em andamento.
- Cobertura sensivel melhorou para criacao de pedidos, dashboard operacional e
  isolamento financeiro entre profissionais.
- A meta profissional completa ainda nao terminou; ainda falta auditoria mais
  ampla de cookies/sessao, mensagens publicas, logs/auditoria, staging real e
  camada comercial.

## Proximo passo recomendado

Continuar a fase 5 revisando sessao/cookies, mensagens publicas e logs/auditoria
de acoes importantes, depois passar para staging profissional.

AVISO: O proximo passo e criar/implementar hardening de sessao/cookies, mensagens publicas e logs/auditoria de acoes importantes. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: hardening inicial de RBAC/UX por perfil

Objetivo: iniciar a fase 5 de seguranca e confianca, auditando rotas e dados
por papel e corrigindo uma lacuna concreta de experiencia/autorizacao no
frontend.

Foi feito:

- Auditadas policies, controllers e serializers principais:
  - `ServiceRequestPolicy`, `ProfessionalPolicy`,
    `ProfessionalDocumentPolicy`, `PaymentPolicy`, `DashboardPolicy`;
  - serializers de pedido, cliente, pagamento, profissional, documento,
    anexo e review;
  - controllers de pedidos, pagamentos, conta, dashboard, profissionais,
    portal profissional e documentos.
- Confirmado que as principais fronteiras de API ja estao fortes:
  - dashboard exige usuario operacional;
  - jobs publicos do profissional redigem identidade/contacto do cliente;
  - breakdown financeiro nao e exposto a cliente;
  - documentos profissionais nao expõem URL/signed id;
  - profissionais publicos nao expõem contacto/coordenadas.
- Corrigida lacuna de UX/RBAC no frontend:
  - `frontend/src/app/(client)/pedidos/page.tsx` agora adapta tambem para
    profissional, mostrando `Painel profissional`, `Servicos atribuidos` e
    `Historico profissional`, em vez de `Area do cliente` / `Meus pedidos`.
  - `frontend/src/app/(client)/pedidos/novo/page.tsx` bloqueia profissional
    logado com mensagem propria e acao para voltar ao painel profissional.
  - `frontend/src/app/(client)/conta/page.tsx` manda profissional para
    `/profissional/historico` em vez de `/pedidos` quando o CTA e historico.

Arquivos principais:

- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/app/(client)/pedidos/novo/page.tsx`
- `frontend/src/app/(client)/conta/page.tsx`
- `app/policies/*.rb`
- `app/serializers/api/v1/*.rb`
- `app/controllers/api/v1/*_controller.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e PORT=3001 -e HOSTNAME=0.0.0.0 -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- TypeScript passou.
- ESLint passou.
- `npm run verify` passou: OpenAPI gerado, lint, typecheck e build Next.
- Build Docker do frontend passou.
- Container `profissionais-next-local` foi reiniciado em
  `http://127.0.0.1:3001`.
- Smoke permanente passou.
- Verificacao HTTP autenticada como profissional
  `joaquim@conectaangola.ao` confirmou:
  - `/pedidos` renderiza `Painel profissional`, `Servicos atribuidos` e
    `Historico profissional`;
  - `/pedidos/novo` renderiza `Criacao de pedidos` e `Voltar ao painel`.

Estado atual:

- A fase 5 comecou: primeira lacuna de UX/RBAC por perfil foi corrigida.
- Ainda falta uma auditoria mais profunda com testes de seguranca adicionais
  para todas as fronteiras criticas.
- Ambiente local esperado ativo:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`

## Proximo passo recomendado

Continuar a fase 5 com testes focados de RBAC/API para rotas sensiveis:
profissional nao criar pedido, cliente nao acessar operacao, profissional nao
ver documentos de outro profissional, cliente nao receber breakdown financeiro
e publico nao receber contacto/coordenadas.

AVISO: O proximo passo e criar/implementar testes focados de RBAC/API para rotas sensiveis e corrigir qualquer lacuna encontrada. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: dashboard operacional com filas acionaveis

Objetivo: continuar a fase 4 do plano profissional, transformando
`/operacoes` num dashboard mais acionavel, com indicadores que levam
diretamente para as filas de pedidos e profissionais ja profissionalizadas.

Foi feito:

- `app/controllers/api/v1/dashboard_controller.rb` agora entrega mais
  indicadores operacionais:
  - `pending_requests_count`
  - `assigned_requests_count`
  - `in_work_requests_count`
  - `disputed_requests_count`
  - `professionals_available_count`
  - `professionals_pending_docs_count`
  - `professionals_rejected_docs_count`
- `test/integration/api_v1_contract_test.rb` passou a validar as novas chaves
  criticas do contrato do dashboard.
- `frontend/src/app/(operations)/operacoes/page.tsx` agora:
  - verifica explicitamente se o usuario e admin/operador antes de renderizar o
    dashboard;
  - mostra `Disponiveis` em vez de apenas `Online`;
  - acrescenta detalhes de docs pendentes nos stats;
  - inclui cards de acao para:
    - triagem de pedidos pendentes;
    - pedidos atribuidos;
    - disputas;
    - documentos pendentes;
  - cada card leva direto para a fila filtrada correspondente.

Arquivos principais:

- `app/controllers/api/v1/dashboard_controller.rb`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `test/integration/api_v1_contract_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e PORT=3001 -e HOSTNAME=0.0.0.0 -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- TypeScript passou.
- ESLint passou.
- Teste Rails de contrato passou: `21 runs, 100 assertions, 0 failures,
  0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, lint, typecheck e build Next.
- Build Docker do frontend passou.
- Rails/Postgres foram reconstruidos e seeds demo executados.
- Container `profissionais-next-local` foi reiniciado em
  `http://127.0.0.1:3001`.
- Smoke permanente passou.
- Verificacao HTTP autenticada com cookie jar confirmou que `/operacoes`
  renderiza `Dashboard operacional`, `Triagem de pedidos`,
  `Documentos pendentes`, `Abrir fila`, `Disponiveis` e `Verificados`.
- O Browser interno foi usado, mas nesta etapa a automacao de login ficou
  bloqueada por falha de clipboard/input e falta de `fetch` no contexto da
  pagina; por isso a verificacao autenticada final foi feita via HTTP
  autenticado, nao por clique no browser. O viewport do browser foi resetado.

Estado atual:

- Fase 4 avancou em tres eixos: fila operacional de pedidos, rede profissional
  operacional e dashboard operacional mais acionavel.
- Admin/operador tem caminhos diretos para triagem, atribuicao, disputas e
  revisao documental.
- API e frontend passaram em verificacao ampla e smoke.
- Ambiente local esperado ativo:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`
- A meta profissional completa ainda nao terminou; faltam hardening RBAC mais
  amplo, logs/auditoria de acoes importantes, staging real e preparacao
  comercial/publica.

Estado do projeto:

- Fase/trilha atual: plano profissional em andamento, fase 4 de operacao/admin
  bem encaminhada localmente.
- Solido agora: dashboard, pedidos e profissionais usam links/filtros
  coerentes; feedback de acoes criticas existe em pedidos e documentos.
- Falta imediato: revisar seguranca/RBAC de rotas e dados, depois preparar
  staging real.
- Distancia do fim: MVP local esta demonstravel; ainda nao esta pronto como
  produto final de producao.

## Proximo passo recomendado

Iniciar fase 5 de seguranca e confianca: revisar RBAC por rota/API, vazamento de
dados privados, mensagens de erro, cookies/sessao, e garantir que cliente,
profissional e operacao veem apenas o necessario.

AVISO: O proximo passo e criar/implementar hardening de seguranca/RBAC e confianca, revisando rotas/API, vazamento de dados privados, mensagens de erro e sessao/cookies. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Auditar policies Rails de `ServiceRequest`, `Professional`,
  `ProfessionalDocument`, `Payment`, `Dashboard` e serializers.
- Auditar rotas frontend protegidas para garantir guarda por papel quando a API
  tambem tem usos publicos/cliente.
- Rodar testes de seguranca existentes e adicionar testes para qualquer lacuna
  encontrada.
- Validar cookies/sessao e mensagens publicas sem detalhes internos.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `app/policies/*.rb`
- `app/controllers/api/v1/*_controller.rb`
- `app/serializers/api/v1/*_serializer.rb`
- `frontend/src/app/(client)/**`
- `frontend/src/app/(professional)/**`
- `frontend/src/app/(operations)/**`
- `frontend/src/components/layout/app-shell.tsx`

## Ultima etapa concluida: rede profissional operacional com filtros, RBAC e feedback documental

Objetivo: continuar a fase 4 do plano profissional, deixando
`/operacoes/profissionais` mais parecida com um centro real de trabalho para
admin/operador e bloqueando acesso operacional indevido para cliente ou
profissional.

Foi feito:

- `app/controllers/api/v1/professionals_controller.rb` agora aceita filtro
  operacional `documents_status` em `GET /api/v1/professionals`.
- `docs/api/openapi.yaml` foi atualizado com o parametro `documents_status`,
  mantendo a geracao de tipos do frontend alinhada ao contrato.
- `frontend/src/lib/api/professionals.ts` passou a montar query string para
  `category_slug`, `status` e `documents_status`.
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx` agora:
  - confirma que o usuario e admin/operador antes de renderizar a tela;
  - mostra metricas de disponiveis, verificados, pendentes e rejeitados;
  - exibe filtros por disponibilidade, documentos e categoria;
  - renderiza estado vazio contextual e acao para limpar filtros.
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx` agora:
  - bloqueia a tela operacional para usuarios nao operacionais;
  - aceita `sucesso` e `erro` na query string;
  - mostra feedback acessivel com `role="status"` e `role="alert"`.
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/actions.ts`
  agora captura erro da API ao aprovar/rejeitar documento e redireciona com
  mensagem amigavel.
- `frontend/src/components/domain/professionals/professional-card.tsx` passou a
  exibir tambem o estado documental do profissional.
- `frontend/src/components/layout/access-panel.tsx` ganhou `action` opcional
  retrocompativel para casos de usuario logado sem permissao.
- `test/integration/professional_documents_test.rb` ganhou teste de contrato
  para filtro combinado por status, documentos e categoria.

Arquivos principais:

- `app/controllers/api/v1/professionals_controller.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/professionals.ts`
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/actions.ts`
- `frontend/src/components/domain/professionals/professional-card.tsx`
- `frontend/src/components/layout/access-panel.tsx`
- `test/integration/professional_documents_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/professional_documents_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e PORT=3001 -e HOSTNAME=0.0.0.0 -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- TypeScript passou.
- ESLint passou.
- Teste Rails de documentos passou: `14 runs, 51 assertions, 0 failures,
  0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, lint, typecheck e build Next.
- Build Docker do frontend passou.
- Rails/Postgres foram reconstruidos e seeds demo executados.
- Container `profissionais-next-local` foi reiniciado em
  `http://127.0.0.1:3001`.
- Smoke permanente passou.
- Browser audit no in-app browser confirmou:
  - admin em `/operacoes/profissionais?documents_status=pending&status=offline&category_slug=canalizacao`
    ve metricas, filtros e valores ativos;
  - mobile `320x700` na rede profissional nao tem overflow horizontal;
  - cliente logado em `/operacoes/profissionais` ve `Acesso operacional`,
    nao ve filtros operacionais e nao recebe workspace de operacao.

Estado atual:

- Fase 4 avancou em dois eixos: fila de pedidos operacional e rede
  profissional operacional.
- A rede profissional agora tem filtros basicos, metricas de verificacao,
  bloqueio de papel no frontend operacional e feedback documental.
- A API de filtro documental esta documentada em OpenAPI e coberta por teste.
- Ambiente local esperado ativo:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`
- A meta profissional completa ainda nao terminou; falta densidade maior no
  dashboard operacional, acoes mais ergonomicas de atribuicao/status, notas
  internas/auditoria, seguranca/RBAC mais ampla, staging e preparo comercial.

Estado do projeto:

- Fase/trilha atual: plano profissional em andamento, fase 4 de operacao/admin
  parcialmente concluida com pedidos e rede profissional.
- Solido agora: acesso publico/protegido, componentes reutilizaveis, feedback
  critico, fila de pedidos filtravel, rede profissional filtravel e revisao
  documental com feedback.
- Falta imediato: melhorar dashboard `/operacoes` com metricas/filas mais
  acionaveis e revisar pontos de RBAC restantes nas rotas operacionais.
- Distancia do fim: MVP local esta cada vez mais demonstravel; produto final
  ainda precisa de hardening operacional, staging real e camada comercial.

## Proximo passo recomendado

Continuar a fase 4 no dashboard `/operacoes`: transformar o dashboard em sala
de controle com filas acionaveis, indicadores de risco, links filtrados para
pedidos/profissionais e proximas acoes operacionais.

AVISO: O proximo passo e criar/implementar dashboard operacional mais acionavel em `/operacoes`, com filas, indicadores de risco, links filtrados para pedidos/profissionais e proximas acoes. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Auditar `frontend/src/app/(operations)/operacoes/page.tsx` e
  `app/controllers/api/v1/dashboard_controller.rb`.
- Ver quais metricas/filas a API ja entrega e quais links filtrados podem ser
  usados sem novo endpoint.
- Melhorar cards do dashboard para direcionar acoes reais.
- Validar com `npm run verify`, teste Rails focado se houver API nova, smoke e
  browser mobile/admin.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/lib/api/account.ts`
- `app/controllers/api/v1/dashboard_controller.rb`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/controllers/api/v1/professionals_controller.rb`

## Ultima etapa concluida: fila operacional de pedidos com filtros por perfil

Objetivo: avancar a fase 4 do plano profissional, corrigindo a rota `/pedidos`
para deixar de parecer uma area de cliente quando acessada por admin/operacao e
transformando-a numa fila operacional filtravel.

Foi feito:

- `frontend/src/app/(client)/pedidos/page.tsx` agora busca primeiro o usuario
  atual e adapta a pagina por perfil.
- Cliente continua vendo `Area do cliente` / `Meus pedidos`, sem filtros
  operacionais.
- Admin/operador agora ve `Operacao de pedidos` / `Fila operacional`, metricas
  operacionais e filtros por estado e categoria.
- Rota protegida sem sessao continua mostrando `Acesso aos pedidos`, sem
  sidebar interna.
- `frontend/src/lib/api/service-requests.ts` passou a aceitar filtros
  `status` e `categorySlug`, traduzindo para a API existente
  `/api/v1/service_requests?status=...&category_slug=...`.
- Adicionado teste de contrato em
  `test/integration/api_v1_contract_test.rb` para garantir que a API respeita
  filtros combinados de estado e categoria.

Arquivos principais:

- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/lib/api/service-requests.ts`
- `test/integration/api_v1_contract_test.rb`
- `app/controllers/api/v1/service_requests_controller.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e PORT=3001 -e HOSTNAME=0.0.0.0 -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- TypeScript passou.
- ESLint passou.
- Teste Rails de contrato passou: `21 runs, 95 assertions, 0 failures,
  0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, lint, typecheck e build Next.
- Build Docker do frontend passou.
- Rails/Postgres foram reconstruidos e seeds demo executados.
- Container `profissionais-next-local` foi reiniciado em
  `http://127.0.0.1:3001`.
- Smoke permanente passou.
- Browser audit no in-app browser confirmou:
  - anonimo em `/pedidos`: mostra `Acesso aos pedidos`, sem sidebar, sem
    titulo `Meus pedidos`;
  - cliente demo em `/pedidos`: mostra `Meus pedidos`, sem filtros
    operacionais, com sidebar autenticada;
  - admin demo em `/pedidos?status=pending&category_slug=canalizacao`: mostra
    `Fila operacional`, filtros ativos, sidebar operacional e sem titulo de
    cliente;
  - mobile `320x700`: sem overflow horizontal na fila operacional.

Estado atual:

- A rota `/pedidos` ja se comporta de forma profissional por perfil.
- Admin/operador agora tem uma primeira fila operacional filtravel por estado
  e categoria.
- A API de filtros esta protegida por teste de contrato.
- Ambiente local esperado ativo:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`
- A meta profissional completa ainda nao terminou; esta fase iniciou a
  profissionalizacao da operacao, mas ainda faltam revisao documental,
  atribuicao/status mais ergonomicos, notas internas, auditoria/logs,
  dashboard operacional mais denso, staging e preparo comercial.

Estado do projeto:

- Fase/trilha atual: plano profissional em andamento, fase 4 de operacao/admin
  parcialmente concluida.
- Solido agora: separacao publica/protegida, componentes reutilizaveis,
  feedback de acoes criticas no detalhe do pedido, fila de pedidos adaptativa
  por perfil e filtros operacionais basicos.
- Falta imediato: evoluir operacao/admin para centro real de trabalho com
  perfil profissional/documentos, aprovacao/rejeicao, notas internas, sinais de
  qualidade e acoes de atribuicao/status mais rapidas.
- Distancia do fim: MVP local esta mais demonstravel e coerente; produto final
  ainda precisa de hardening operacional, seguranca/RBAC mais ampla, staging
  real e camada comercial.

## Proximo passo recomendado

Continuar a fase 4 em `/operacoes/profissionais` e no detalhe do profissional:
documentos, status, qualidade, notas internas e acoes de aprovar/rejeitar,
mantendo o centro operacional sem depender do backend manual.

AVISO: O proximo passo e criar/implementar revisao operacional de profissionais com documentos, status, qualidade, notas internas e acoes de aprovar/rejeitar. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Auditar APIs, policies, serializers e modelos de profissionais/documentos.
- Verificar se aprovar/rejeitar documentos/status ja existe no backend.
- Melhorar `/operacoes/profissionais` e
  `/operacoes/profissionais/[id]` com sinais de documentos, qualidade e
  proximas acoes.
- Implementar acoes seguras existentes ou criar endpoints/testes se faltarem.
- Validar frontend, Rails focado, smoke autenticado admin e browser mobile.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx`
- `frontend/src/lib/api/professionals.ts`
- `app/controllers/api/v1/professionals_controller.rb`
- `app/models/professional.rb`
- `app/models/professional_document.rb`
- `app/policies/professional_policy.rb`

## Ultima etapa concluida: feedback operacional no detalhe do pedido e validacao do ciclo principal

Objetivo: avancar a fase 3 do plano profissional, auditando o fluxo central
cliente -> pedido -> matching -> atribuicao -> estado -> avaliacao e corrigindo
uma lacuna pratica de UX no detalhe do pedido.

Foi feito:

- Auditados server actions, controller API, policy, services e testes do ciclo:
  criacao de pedido, matching, atribuicao, atualizacao de estado e avaliacao.
- Confirmado que o backend ja possui cobertura focada para:
  - cliente criar pedido;
  - cliente ver matching sem dados privados do profissional;
  - profissional nao ver pedido nao atribuido;
  - operacao atribuir profissional verificado;
  - profissional aceitar/iniciar/disputar/cancelar, mas nao concluir;
  - operacao concluir e gerar pagamento;
  - cliente avaliar pedido concluido;
  - dados financeiros internos nao vazarem para cliente.
- Corrigida lacuna de UX em `frontend/src/app/(client)/pedidos/[id]/actions.ts`:
  erros de API em atribuir, atualizar estado e avaliar agora redirecionam para
  o detalhe com mensagem amigavel em vez de deixar a server action estourar sem
  feedback.
- `frontend/src/app/(client)/pedidos/[id]/page.tsx` agora renderiza mensagens
  de `sucesso` e `erro` com `role="status"` e `role="alert"`.
- Verificado que o feedback de sucesso aparece no HTML autenticado do detalhe
  do pedido.

Arquivos principais:

- `frontend/src/app/(client)/pedidos/[id]/actions.ts`
- `frontend/src/app/(client)/pedidos/[id]/page.tsx`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/controllers/api/v1/reviews_controller.rb`
- `app/services/service_requests/assign.rb`
- `app/services/service_requests/update_status.rb`
- `app/policies/service_request_policy.rb`
- `test/integration/security_release_flow_test.rb`
- `test/integration/service_request_review_test.rb`
- `test/integration/service_request_status_security_test.rb`
- `test/services/service_requests/assign_test.rb`
- `test/services/service_requests/update_status_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/services/service_requests/assign_test.rb test/services/service_requests/update_status_test.rb test/integration/security_release_flow_test.rb test/integration/service_request_review_test.rb test/integration/service_request_status_security_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d --build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm web bin/rails db:seed
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- Testes Rails focados passaram: `19 runs, 136 assertions, 0 failures,
  0 errors, 0 skips`.
- `npm run verify` passou: OpenAPI gerado, ESLint, typecheck e build Next.
- Rails/Postgres foram reconstruidos e subiram localmente.
- Seeds demo foram executados.
- Build Docker do frontend passou.
- Container `profissionais-next-local` subiu em `http://127.0.0.1:3001`.
- Smoke permanente passou novamente.
- Checagem autenticada com cookie confirmou que
  `?sucesso=Estado%20do%20pedido%20atualizado.` renderiza a mensagem no
  detalhe de pedido.
- Tentativa inicial de rodar testes Rails em paralelo falhou por conflito de
  container compartilhado `profissionais-rails-test`; nao foi falha de codigo.
  A execucao sequencial corrigiu isso e passou.

Estado atual:

- O fluxo backend principal ja tem boa cobertura e segue verde.
- O detalhe do pedido agora tem feedback amigavel para acoes criticas.
- Ambiente local esperado ativo:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`
- A meta profissional completa ainda nao terminou; esta fase melhorou o ciclo
  principal, mas a operacao/admin ainda precisa de filtros, prioridade,
  qualidade e logs/auditoria mais completos.

Estado do projeto:

- Fase/trilha atual: plano profissional em andamento, fase 3 de fluxo principal
  parcialmente concluida com hardening de feedback e validacao backend.
- Solido agora: ciclo de seguranca/release testado, server actions com feedback,
  smoke autenticado e frontend buildado.
- Falta imediato: transformar a area operacional em centro real de trabalho
  com filtros, prioridades, atribuicao mais ergonomica, revisao documental e
  sinais de qualidade mais densos.
- Distancia do fim: o MVP esta bem mais demonstravel localmente; o produto
  completo ainda esta no meio/final do hardening local, antes de staging real.

## Proximo passo recomendado

Evoluir a operacao/admin para centro de trabalho: filtros por estado/categoria,
lista de pedidos com prioridade, acoes rapidas de atribuicao/status, notas
operacionais e sinais de qualidade/documentos.

AVISO: O proximo passo e criar/implementar a operacao/admin como centro de trabalho com filtros, prioridade, atribuicao/status mais ergonomicos, notas operacionais e sinais de qualidade/documentos. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Auditar APIs de dashboard, pedidos e profissionais para filtros ja
  existentes.
- Implementar filtros operacionais no frontend sem quebrar contratos atuais.
- Melhorar lista de pedidos com prioridade, estado, categoria, local,
  profissional e proxima acao.
- Validar por smoke autenticado admin e browser em 320px/desktop.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`
- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/lib/api/service-requests.ts`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/controllers/api/v1/dashboard_controller.rb`
- `app/controllers/api/v1/professionals_controller.rb`

## Ultima etapa concluida: componentes reutilizaveis e consistencia visual das rotas principais

Objetivo: iniciar a fase 2 do plano profissional, criando componentes
reutilizaveis para reduzir duplicacao visual e aplicar cabecalhos, metricas,
listas e estados vazios consistentes nas paginas centrais do MVP.

Foi feito:

- Criado `PageHeader` para padronizar eyebrow, titulo, descricao, meta e acoes
  de pagina.
- Criado `EmptyState` para estados vazios com titulo, descricao, icone e acoes
  sem repetir blocos manuais.
- Criado `DataList` para secoes/listas com titulo, descricao, acoes,
  colunas responsivas e fallback vazio.
- Criado `StatsGrid` para encapsular `MetricCard` e padronizar grids de
  metricas com 1, 2, 3 ou 4 colunas.
- Migradas rotas principais autenticadas:
  - cliente: `/pedidos`, `/pedidos/:id`, `/pedidos/novo`, `/conta`;
  - profissional: `/profissional`, `/profissional/vagas`,
    `/profissional/carteira`, `/profissional/historico`,
    `/profissional/cadastro`;
  - operacao: `/operacoes`, `/operacoes/profissionais`,
    `/operacoes/profissionais/:id`.
- Migrados grids de metricas e estados vazios publicos em home,
  `/profissionais`, `/como-funciona`, `/confianca` e `/servicos/:slug`.
- O uso direto de `MetricCard` ficou encapsulado em `StatsGrid`.

Arquivos principais:

- `frontend/src/components/ui/page-header.tsx`
- `frontend/src/components/ui/empty-state.tsx`
- `frontend/src/components/ui/data-list.tsx`
- `frontend/src/components/domain/dashboard/stats-grid.tsx`
- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/app/(client)/pedidos/[id]/page.tsx`
- `frontend/src/app/(client)/pedidos/novo/page.tsx`
- `frontend/src/app/(client)/conta/page.tsx`
- `frontend/src/app/(professional)/profissional/page.tsx`
- `frontend/src/app/(professional)/profissional/vagas/page.tsx`
- `frontend/src/app/(professional)/profissional/carteira/page.tsx`
- `frontend/src/app/(professional)/profissional/historico/page.tsx`
- `frontend/src/app/(professional)/profissional/cadastro/page.tsx`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/(public)/profissionais/page.tsx`
- `frontend/src/app/(public)/como-funciona/page.tsx`
- `frontend/src/app/(public)/confianca/page.tsx`
- `frontend/src/app/(public)/servicos/[slug]/page.tsx`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker rm -f profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- TypeScript passou.
- ESLint passou.
- `npm run verify` passou: OpenAPI gerado, lint, typecheck e build Next.
- Build Docker do frontend passou.
- Container `profissionais-next-local` foi reiniciado em
  `http://127.0.0.1:3001`.
- Smoke permanente passou para rotas publicas, protegidas sem sessao e
  autenticadas de cliente, profissional e admin.
- Browser audit no in-app browser validou 24 combinacoes de rota/breakpoint
  em `320x700` e `1440x900`:
  - publicas e protegidas anonimas sem sidebar interno indevido;
  - logins cliente, profissional e admin redirecionaram para as areas certas;
  - sem `Application error`;
  - sem overflow horizontal de pagina.
- Durante uma repeticao de comparacao textual no browser houve timeout de
  navegacao do tab, mas a auditoria anterior ja tinha concluido e o viewport
  foi resetado. Nao houve evidencia de erro da aplicacao.

Estado atual:

- A fase 2 de base visual reutilizavel esta aplicada nas principais rotas.
- `MetricCard` agora e detalhe interno de `StatsGrid`, reduzindo duplicacao.
- Estados vazios principais agora seguem o mesmo componente e tom de produto.
- O frontend local segue funcional em `http://127.0.0.1:3001`.
- A meta profissional completa ainda nao terminou; faltam polimento de fluxos
  ponta a ponta, operacao avancada, seguranca/RBAC, staging e preparo comercial.

Estado do projeto:

- Fase/trilha atual: plano profissional em andamento, fase 2 de design system
  operacional concluida para as rotas principais.
- Solido agora: componentes reutilizaveis, rotas principais padronizadas,
  build/lint/typecheck, Docker, smoke autenticado e browser audit responsivo.
- Falta imediato: auditar e polir o fluxo ponta a ponta cliente -> pedido ->
  matching -> atribuicao operacional -> profissional -> estado -> avaliacao.
- Distancia do fim: a base visual esta mais solida; o produto completo ainda
  esta no meio do plano profissional porque os fluxos operacionais e hardening
  de seguranca/staging ainda precisam de uma rodada dedicada.

## Proximo passo recomendado

Polir e validar o fluxo principal completo do MVP: cliente cria pedido,
operacao ve candidatos, atribui profissional, profissional acompanha vaga,
pedido muda de estado, cliente acompanha e avalia.

AVISO: O proximo passo e criar/implementar o polimento e validacao do fluxo ponta a ponta cliente -> pedido -> matching -> atribuicao operacional -> profissional -> estado -> avaliacao. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Auditar as acoes e APIs de pedido, matching, atribuicao, estado e avaliacao.
- Rodar ou criar testes focados para transicoes criticas e permissoes por
  perfil.
- Executar o fluxo manual no browser com cliente, admin e profissional.
- Corrigir copy, feedback de sucesso/erro e lacunas de UX encontradas no fluxo.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `frontend/src/app/(client)/pedidos/novo/actions.ts`
- `frontend/src/app/(client)/pedidos/[id]/actions.ts`
- `frontend/src/app/(client)/pedidos/[id]/page.tsx`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(professional)/profissional/vagas/page.tsx`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/services/service_requests/assign.rb`
- `app/services/service_requests/update_status.rb`
- `test/integration/service_request_status_security_test.rb`
- `test/services/service_requests/assign_test.rb`

## Ultima etapa concluida: separacao entre vitrine publica e rede operacional

Objetivo: corrigir a arquitetura de acesso de profissionais para que a rota
publica `/profissionais` seja uma vitrine do marketplace, enquanto a rede
operacional protegida fique em `/operacoes/profissionais`.

Foi feito:

- Criada a pagina publica `frontend/src/app/(public)/profissionais/page.tsx`
  com descoberta de profissionais, categorias, sinais de confianca e busca.
- Movida a rede profissional operacional para
  `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`.
- Movido o detalhe/revisao operacional para
  `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx`.
- Atualizados links internos, dashboard operacional, sidebar autenticado e
  configuracao de verticais para usarem `/operacoes/profissionais`.
- Removida a rota operacional antiga em `/profissionais`, que agora pertence
  ao publico.
- Criado `scripts/smoke_frontend_routes_profissionais.sh` como smoke permanente
  de rotas publicas, protecao sem sessao e rotas autenticadas por perfil.
- Atualizado `README.md` com a matriz de rotas correta e o novo smoke do
  frontend local.

Arquivos principais:

- `frontend/src/app/(public)/profissionais/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/[id]/actions.ts`
- `frontend/src/components/layout/app-shell.tsx`
- `frontend/src/lib/ecosystem/verticals.ts`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `scripts/smoke_frontend_routes_profissionais.sh`
- `README.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker rm -f profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
bash scripts/smoke_frontend_routes_profissionais.sh
```

Resultado:

- `npm run verify` passou, incluindo geracao OpenAPI, ESLint, TypeScript e
  build Next.
- Build Docker do frontend passou e o container local foi reiniciado em
  `http://127.0.0.1:3001`.
- Smoke permanente passou: paginas publicas, bloqueio anonimo de
  `/operacoes/profissionais` sem sidebar interno e rotas autenticadas de
  cliente, profissional e admin.
- Browser audit no in-app browser passou para `/profissionais` e
  `/operacoes/profissionais` em mobile e desktop:
  - `/profissionais` sem sessao: sem `aside`, sem painel de acesso, sem
    `Workspace`, com conteudo publico.
  - `/operacoes/profissionais` sem sessao: sem `aside`, sem `Workspace`, com
    painel de acesso.
  - admin autenticado em `/operacoes/profissionais`: rota operacional com
    workspace interno.

Estado atual:

- A rota publica `/profissionais` agora esta correta para visitantes.
- A rede operacional protegida agora vive em `/operacoes/profissionais`.
- Nenhuma rota protegida validada nesta etapa mostrou sidebar interno sem
  sessao.
- O MVP local segue funcional em `http://127.0.0.1:3001`.
- A meta profissional completa ainda nao terminou; esta foi apenas a fase 1 de
  arquitetura de acesso/navegacao.

Estado do projeto:

- Fase/trilha atual: plano profissional em andamento, fase 1 de acesso e
  navegacao por perfil concluida.
- Solido agora: separacao publica/protegida de profissionais, navegacao
  operacional, build Next, Docker local, smoke de rotas e verificacao browser.
- Falta imediato: criar componentes reutilizaveis profissionais (`PageHeader`,
  `EmptyState`, `DataList`, `StatsGrid`) e refatorar as telas principais para
  consistencia visual/operacional.
- Distancia do fim: esta trilha de arquitetura esta quase fechada; o produto
  completo ainda esta no meio do plano profissional, pois faltam fluxo ponta a
  ponta, dashboard operacional, seguranca/RBAC, staging e preparacao comercial.

## Proximo passo recomendado

Criar os componentes reutilizaveis profissionais (`PageHeader`, `EmptyState`,
`DataList`, `StatsGrid`) e aplicar nas paginas principais de cliente,
profissional e operacao, mantendo validacao responsiva em 320px, tablet e
desktop.

AVISO: O proximo passo e criar/implementar os componentes reutilizaveis profissionais PageHeader, EmptyState, DataList e StatsGrid nas paginas principais. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar componentes existentes em `frontend/src/components/ui` e
  `frontend/src/components/domain`.
- Criar componentes reutilizaveis sem duplicar estilos nem quebrar tokens.
- Refatorar primeiro paginas de maior impacto: `/pedidos`, `/profissional`,
  `/operacoes` e `/operacoes/profissionais`.
- Verificar com `npm run verify`, smoke permanente e browser audit responsivo.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `frontend/src/components/ui`
- `frontend/src/components/domain`
- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/app/(professional)/profissional/page.tsx`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/operacoes/profissionais/page.tsx`

## Historico: sidebar protegido oculto sem sessao antes da separacao de rotas

Objetivo: corrigir o comportamento em que rotas protegidas como
`/profissionais` mostravam o sidebar operacional mesmo quando o utilizador nao
estava autenticado.

Nota: esta etapa e historica e foi superada pela separacao acima. Atualmente
`/profissionais` e publica, e a rota operacional protegida e
`/operacoes/profissionais`.

Foi feito:

- `frontend/src/components/layout/app-shell.tsx` agora renderiza `PublicHeader`,
  conteudo e `PublicFooter` quando nao ha `currentUser`.
- O sidebar/workspace interno continua reservado para sessoes autenticadas.

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
```

Resultado:

- `npm run verify` passou.
- Container Next foi reconstruido e reiniciado em `http://127.0.0.1:3001`.
- Browser em `/profissionais` sem sessao: `asideCount=0`, sem `Workspace`, sem
  `Operacao central`, com painel de acesso `Rede profissional`.
- Smoke autenticado admin em `/profissionais`: HTTP 200, com `Workspace` e
  `Operacao central`.

## Ultima etapa concluida: frontend reconstruido e validado localmente

Objetivo: reconstruir/hardening do frontend do MVP, corrigindo quebras de UX/UI,
rotas, responsividade e residuos temporarios sem apagar dados uteis do ambiente
local.

Foi feito:

- Reforcada a base visual em `frontend/src/app/globals.css` para evitar overflow
  horizontal e limitar midias/iframes ao viewport.
- `Sheet` e `MobilePublicNavigation` foram corrigidos para o menu mobile abrir
  dentro do viewport em 320px, sem largura conflitante.
- Cards, metric cards, selects, cards de categoria/profissional e resumo de
  pedidos receberam `min-w-0`, truncagem e limites responsivos para nao
  quebrar textos/valores em telas estreitas.
- O `AppShell` mobile foi endurecido para preservar brand, logout e navegacao
  horizontal sem estourar a largura.
- Rotas de conta, carteira, historico profissional, operacoes e profissionais
  receberam estados vazios/feedback mais claros.
- Texto com codificacao quebrada na rota operacional foi normalizado.
- O script temporario `tmp/frontend_route_smoke.sh` foi removido apos uso,
  mantendo apenas artefatos uteis ja existentes em `tmp/`.

Arquivos principais:

- `frontend/src/app/globals.css`
- `frontend/src/components/ui/sheet.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/select.tsx`
- `frontend/src/components/layout/mobile-public-navigation.tsx`
- `frontend/src/components/layout/app-shell.tsx`
- `frontend/src/components/domain/dashboard/metric-card.tsx`
- `frontend/src/components/domain/marketplace/category-card.tsx`
- `frontend/src/components/domain/professionals/professional-card.tsx`
- `frontend/src/components/domain/service-requests/request-summary-card.tsx`
- `frontend/src/app/(client)/conta/page.tsx`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/profissionais/page.tsx`
- `frontend/src/app/(professional)/profissional/carteira/page.tsx`
- `frontend/src/app/(professional)/profissional/historico/page.tsx`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build -f frontend/Dockerfile frontend -t profissionais-frontend-local:latest
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker rm -f profissionais-next-local
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-next-local --network profissionais_default -p 127.0.0.1:3001:3001 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3001 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e RAILS_API_BASE_URL=http://web:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 -e SESSION_COOKIE_KEY=_profiangola_session -e SESSION_COOKIE_SAME_SITE=lax profissionais-frontend-local:latest
bash tmp/frontend_route_smoke.sh
```

Resultado:

- `npm run verify` passou: OpenAPI gerado, ESLint, TypeScript e build Next.
- Build Docker do frontend passou e o container `profissionais-next-local`
  subiu em `http://127.0.0.1:3001`.
- Home retornou HTTP 200 na imagem nova.
- Smoke de rotas passou:
  - publicas: `/`, `/servicos`, `/servicos/ti-redes`, `/cliente`,
    `/como-funciona`, `/ajuda`, `/confianca`, `/privacidade`, `/termos`,
    `/login`;
  - cliente autenticado: `/pedidos`, `/pedidos/novo`, `/conta`;
  - profissional autenticado: `/profissional`, `/profissional/vagas`,
    `/profissional/historico`, `/profissional/carteira`,
    `/profissional/cadastro`;
  - admin autenticado: `/operacoes`, `/profissionais`, `/pedidos`.
- Browser audit no in-app browser passou em 39 combinacoes de rota/breakpoint
  (`320x700`, `768x900`, `1440x900`), sem `Application error`, sem overflow
  horizontal e sem offenders fora do viewport.
- O menu mobile em `320px` abriu dentro do viewport: `left=15.8`,
  `right=304.8`, `width=289`, viewport `320`.
- Console do navegador na home nao apresentou erros.
- Logs do container Next ficaram limpos.

Estado atual:

- MVP local esta pronto e funcional em `http://127.0.0.1:3001`.
- Containers locais ativos esperados:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`
- A trilha local de frontend esta validada para demonstracao. Producao/staging
  real ainda exige DNS/TLS/secrets reais, Nginx, preflight remoto e smoke
  autenticado remoto.

Estado do projeto:

- Fase/trilha atual: frontend MVP local concluido e hardening UX/UI aplicado.
- Solido agora: rotas publicas, cliente, profissional e operacao respondem;
  build Next passa; responsividade principal foi validada no navegador; menu
  mobile corrigido; residuos temporarios de smoke removidos.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  smoke remoto autenticado e browser manual no dominio final.
- Distancia do fim: esta trilha local chegou ao fim; o produto completo ainda
  depende da validacao de staging/producao.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto autenticado e browser manual dos fluxos
principais no dominio final.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto autenticado e browser manual no dominio final. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: MVP local validado e funcional

Objetivo: levar a trilha local ate um estado demonstravel de MVP funcional,
com Rails, Next, login, pedido, matching, area profissional e area operacional
validados em ambiente local.

Foi feito:

- Corrigido `config/application.rb` para passar no RuboCop com delimitador
  `%w[...]`.
- `config/environments/development.rb` agora carrega `ConexaoDomains` e aplica
  `config.hosts = ConexaoDomains.hosts`, mantendo protecao contra Host header e
  permitindo os aliases Docker internos usados pelo frontend local.
- `test/lib/conexao_domains_test.rb` passou a cobrir o alias interno `web`.
- `README.md` foi atualizado com o comando explicito para subir o frontend Next
  em `http://127.0.0.1:3001` apontando para o Rails local em
  `http://127.0.0.1:3000`.

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run verify
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/lib/conexao_domains_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop config/application.rb config/environments/development.rb test/lib/conexao_domains_test.rb
```

Resultados:

- Suite Rails completa: `90 runs, 401 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop completo passou apos a correcao de `config/application.rb`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- Frontend `npm run verify` passou: OpenAPI gerado, ESLint, typecheck e build
  Next 16.2.6.
- Smoke integrado Rails+Next passou: login/logout, cookie compartilhado,
  `/api/v1/me`, bloqueio de `budget_cents` interno e host canonico.
- Preflight local de staging passou, incluindo headers defensivos, cookie
  seguro, endpoints publicos, login autenticado e bloqueio de `budget_cents`.
- Teste focado de dominios passou: `6 runs, 24 assertions, 0 failures`.
- RuboCop focado nos arquivos tocados: `3 files inspected, no offenses`.

Validacao manual/browser local:

- Rails/Postgres ficaram ativos via `docker compose up -d --build`.
- Next ficou ativo em `http://127.0.0.1:3001` via container
  `profissionais-next-local` na rede `profissionais_default`.
- Home, catalogo `/servicos`, detalhe `/servicos/ti-redes` e profissionais
  renderizaram sem erro.
- Login cliente `ana.manuel@example.com` funcionou e abriu `/pedidos`.
- Criacao de pedido local funcionou:
  - codigo `OS-260603-3194F2`;
  - titulo `Teste MVP - rede lenta no escritorio`;
  - rota final `/pedidos/13`;
  - matching exibiu candidatos recomendados.
- Login profissional `joaquim@conectaangola.ao` funcionou e abriu
  `/profissional`; `/profissional/vagas`, `/profissional/carteira` e
  `/profissional/cadastro` abriram sem erro.
- A area profissional mostrou o pedido criado nas vagas abertas.
- Smoke HTTP admin com `admin@conectaangola.ao` passou:
  - login Next retornou `303`;
  - `/operacoes`, `/profissionais` e `/pedidos` retornaram `200` autenticados.
- Screenshots locais salvos:
  - `tmp/mvp-home.png`
  - `tmp/mvp-pedidos.png`
  - `tmp/mvp-pedido-criado.png`

Estado atual:

- MVP local esta pronto e funcional para demonstracao em `http://127.0.0.1:3001`.
- Containers locais ativos esperados:
  - `profissionais-db-1`
  - `profissionais-web-1`
  - `profissionais-next-local`
- Ainda nao e possivel declarar producao pronta sem staging real com
  `.env.production` real, DNS/TLS, Nginx, secrets, preflight remoto, smoke
  remoto autenticado, backup/restore real e browser manual no dominio final.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto autenticado com cliente de staging,
backup/restore e browser manual dos fluxos principais.

## Ultima etapa concluida: smoke remoto autenticado para regressao de seguranca

Objetivo: preparar o smoke de staging real para validar tambem controles
autenticados de seguranca, especialmente o bloqueio de `budget_cents` interno
para cliente, sem criar dados e sem depender apenas de checks publicos.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `professional-delivery-flow`
- `api-engineering-control`
- `continuity-memory`

Foi feito:

- `scripts/smoke_profissionais_deploy.sh` agora aceita
  `PROFISSIONAIS_SMOKE_EMAIL` e `PROFISSIONAIS_SMOKE_PASSWORD` para executar
  smoke autenticado opcional em staging/producao.
- Quando as credenciais sao informadas, o smoke remoto valida CSRF pre-login,
  login API, CSRF autenticado, consulta de categorias, tentativa de criacao de
  pedido com `budget_cents` interno, erro esperado `internal_budget_not_allowed`
  com HTTP 422 e logout.
- As chamadas API do smoke remoto agora respeitam `PROFISSIONAIS_SMOKE_TARGET_IP`
  via `curl --resolve`, alinhando o comportamento com a documentacao de teste
  por IP antes de virar DNS.
- `scripts/test_preflight_profissionais_staging.sh` foi expandido com endpoints
  fake de login/logout/categorias/pedidos para provar localmente o novo caminho
  autenticado do smoke remoto.
- Os runbooks de staging/producao foram atualizados com as variaveis de smoke
  autenticado e com o criterio de bloqueio remoto de `budget_cents`.

Arquivos principais:

- `scripts/smoke_profissionais_deploy.sh`
- `scripts/test_preflight_profissionais_staging.sh`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_profissionais_deploy.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose ps
```

Resultados:

- `bash -n` passou para os scripts de smoke/preflight.
- `./scripts/test_preflight_profissionais_staging.sh` passou em Docker,
  incluindo:
  - checks publicos;
  - checks API usando `PROFISSIONAIS_SMOKE_TARGET_IP`;
  - login autenticado fake;
  - bloqueio de `budget_cents` interno com HTTP 422;
  - logout autenticado;
  - caso negativo de cookie sem `HttpOnly`.
- Primeira execucao de `./scripts/smoke_integrated_session_profissionais.sh`
  foi interrompida durante `bundle install` frio, sem erro de aplicacao nos
  logs; apos limpeza e repeticao, o smoke integrado passou.
- Smoke integrado Rails+Next confirmou login/logout, cookie, `/api/v1/me`,
  bloqueio de `budget_cents`, rejeicao pos-logout e fallback canonico de host.
- Nenhum container `profissionais` ficou ativo.

Estado atual:

- O smoke remoto esta pronto para validar um controle autenticado de seguranca
  quando houver credenciais de cliente de staging.
- O teste local de preflight cobre o caminho autenticado sem segredos reais.
- Esta fase ainda nao substitui staging real; falta executar estes scripts
  contra DNS/TLS/secrets reais e fazer browser manual.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next com prova de campo interno,
  preflight local, smoke remoto autenticado opcional, filtragem publica/matching
  de profissionais verificados, redacao de reviews, atribuicao manual, vagas
  abertas, acesso residual, confianca publica, split financeiro e criacao
  publica de pedidos endurecidos.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto autenticado e validacao manual/browser.
- Distancia do fim: a trilha local de seguranca esta muito forte; producao ainda
  nao esta pronta sem prova em ambiente real com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto autenticado com cliente de staging e
teste manual/browser de login, pedido, profissional, documentos, pagamentos,
operacao, confianca publica, atribuicao operacional, vagas abertas e bloqueios
de campos internos/usuarios inelegiveis.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Criar ou confirmar um cliente de staging para o smoke autenticado.
- Rodar preflight remoto, smoke remoto autenticado, backup/restore e browser
  manual dos fluxos principais.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`

## Ultima etapa concluida: smoke integrado valida bloqueio de campo financeiro interno

Objetivo: aumentar a prova operacional antes de staging real, garantindo que o
smoke Rails+Next em Docker valide tambem a regressao de seguranca que bloqueia
`budget_cents` interno para cliente autenticado.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `professional-delivery-flow`
- `api-engineering-control`
- `continuity-memory`

Foi feito:

- `scripts/smoke_integrated_session_profissionais.sh` passou a criar uma
  categoria minima de smoke ao subir Rails em ambiente de teste.
- O smoke integrado agora, depois do login via proxy Next, usa o cookie emitido
  pelo Next para chamar Rails, obter CSRF e tentar criar um pedido com
  `budget_cents` interno.
- A tentativa autenticada de cliente deve falhar com HTTP 422 e erro
  `internal_budget_not_allowed`.
- O fluxo de logout, invalidacao de sessao e fallback de host nao confiavel
  continua a ser executado depois dessa prova.
- Os runbooks de staging/producao foram atualizados para registrar que o smoke
  integrado cobre esse bloqueio financeiro interno.

Arquivos principais:

- `scripts/smoke_integrated_session_profissionais.sh`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_profissionais_deploy.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose ps
```

Resultados:

- `bash -n` passou para os scripts de smoke/preflight.
- Smoke integrado Rails+Next em Docker passou, incluindo:
  - Rails `/up`;
  - Next `/favicon.ico`;
  - login via Next com cookie `HttpOnly` e `SameSite=Lax`;
  - Rails `/api/v1/me` aceitando cookie emitido pelo Next;
  - bloqueio de `budget_cents` interno para cliente autenticado com HTTP 422;
  - logout via Next expirando cookie;
  - Rails rejeitando cookie apos logout;
  - fallback canonico para host nao permitido.
- Teste local de preflight em Docker passou, incluindo caso negativo de cookie
  sem `HttpOnly`.
- Nenhum container `profissionais` ficou ativo.

Estado atual:

- A regressao de campo financeiro interno agora esta coberta por teste Rails e
  tambem por smoke integrado Rails+Next de release local.
- Os runbooks indicam explicitamente essa cobertura como criterio antes de
  staging/producao.
- Esta fase ainda nao substitui staging real; falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next com prova de campo interno,
  preflight local, filtragem publica/matching de profissionais verificados,
  redacao de reviews, atribuicao manual, vagas abertas, acesso residual,
  confianca publica, split financeiro e criacao publica de pedidos endurecidos.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: a trilha local de seguranca esta quase fechada; producao
  ainda nao esta pronta sem prova em ambiente real com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, pagamentos, operacao, confianca publica, atribuicao
operacional, vagas abertas e bloqueios de campos internos/usuarios inelegiveis.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo campos internos de orcamento, pagamentos e
  carteira profissional.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`

## Ultima etapa concluida: bloqueio de orcamento interno na criacao publica de pedidos

Objetivo: impedir que clientes ou profissionais enviem `budget_cents` diretamente
na API de criacao de pedidos, evitando bypass do contrato publico em AOA
(`budget_aoa`) e reduzindo risco de confusao/manipulacao de unidade financeira.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `professional-delivery-flow`
- `api-engineering-control`
- `continuity-memory`

Foi feito:

- `Api::V1::ServiceRequestsController#create` passou a calcular o orcamento uma
  vez, interrompendo a criacao quando uma validacao ja renderizou erro.
- `requested_budget_cents` agora aceita `budget_cents` apenas para usuarios
  operacionais; clientes/profissionais recebem `internal_budget_not_allowed`
  com HTTP 422.
- Foi adicionada regressao provando que cliente nao consegue persistir pedido
  com `budget_cents` interno.
- Foi mantida cobertura positiva provando que usuario operacional ainda pode
  informar `budget_cents` diretamente.
- `docs/api/openapi.yaml` passou a marcar `budget_cents` como campo interno
  aceito apenas para operacao.
- `frontend/src/lib/api/schema.ts` foi regenerado a partir do OpenAPI.

Arquivos principais:

- `app/controllers/api/v1/service_requests_controller.rb`
- `test/integration/security_hardening_test.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/schema.ts`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_hardening_test.rb
```

Resultado antes da correcao:

- `SecurityHardeningTest#test_client_cannot_set_internal_budget_cents_when_creating_service_request`
  falhou porque `ServiceRequest.count` aumentou em 1, provando que o cliente
  conseguia criar pedido com `budget_cents` interno.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/controllers/api/v1/service_requests_controller.rb test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run generate:api
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Teste focado de hardening: `12 runs, 37 assertions, 0 failures, 0 errors, 0 skips`.
- Teste focado de contrato API: `20 runs, 93 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `2 files inspected, no offenses detected`.
- Suite Rails completa: `90 runs, 401 assertions, 0 failures, 0 errors, 0 skips`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `npm run generate:api`: OpenAPI regenerou `frontend/src/lib/api/schema.ts`
  com sucesso.
- `npm run typecheck`: `tsc --noEmit` passou.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- A criacao publica de pedidos agora respeita a fronteira de contrato:
  clientes/profissionais usam `budget_aoa`; `budget_cents` fica restrito a
  operacao.
- O comportamento legitimo de cliente com `budget_aoa` e de operacao com
  `budget_cents` esta coberto por testes.
- O contrato OpenAPI/TypeScript esta alinhado com a regra de acesso por perfil.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca, contrato API financeiro e prontidao
  operacional para staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados, redacao de reviews,
  atribuicao manual, vagas abertas, acesso residual, confianca publica, split
  financeiro e criacao publica de pedidos endurecidos.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta muito forte; producao ainda nao esta
  pronta sem prova de staging real e operacao com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, pagamentos, operacao, confianca publica, atribuicao
operacional, vagas abertas e bloqueios de campos internos/usuarios inelegiveis.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo campos internos de orcamento, pagamentos e
  carteira profissional.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/controllers/api/v1/service_requests_controller.rb`
- `test/integration/security_hardening_test.rb`

## Ultima etapa concluida: integridade financeira do split de pagamentos

Objetivo: impedir que pagamentos gravem `commission_cents` e
`professional_payout_cents` com soma diferente de `amount_cents`, protegendo
receita, repasse profissional e relatorios financeiros contra inconsistencias.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `database-engineering-control`
- `continuity-memory`

Foi feito:

- `Payment` passou a validar que o split financeiro fecha exatamente com o valor
  do pagamento.
- O calculo automatico de split agora cobre o caso default e tambem completa a
  parte ausente quando apenas comissao ou repasse profissional e informado.
- Foi adicionada constraint PostgreSQL `payments_split_matches_amount` para
  proteger a integridade tambem no banco.
- `db/schema.rb` foi atualizado para carregar a constraint em ambientes novos e
  nos testes que usam `db:schema:load`.
- Foram adicionados testes de modelo para split default, split explicito valido
  e split sobrealocado invalido.

Arquivos principais:

- `app/models/payment.rb`
- `db/migrate/20260602180000_add_payment_split_integrity_constraint.rb`
- `db/schema.rb`
- `test/models/payment_test.rb`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/models/payment_test.rb
```

Resultado antes da correcao:

- `PaymentTest#test_rejects_split_that_exceeds_payment_amount` falhou porque um
  pagamento com `commission_cents + professional_payout_cents > amount_cents`
  ainda era considerado valido.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/models/payment_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/models/payment.rb test/models/payment_test.rb db/migrate/20260602180000_add_payment_split_integrity_constraint.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose up -d db
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm -e RAILS_ENV=test web bin/rails db:drop db:create db:migrate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Testes focados: `3 runs, 8 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `3 files inspected, no offenses detected`.
- Migração em banco de teste: concluida com sucesso.
- Suite Rails completa: `88 runs, 395 assertions, 0 failures, 0 errors, 0 skips`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- Pagamentos nao podem mais registrar split financeiro incoerente pela camada de
  modelo nem por escrita que passe pelas constraints do banco.
- Relatorios operacionais, carteira profissional e payloads financeiros passam a
  depender de uma invariavel de persistencia mais forte.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca, integridade financeira e prontidao
  operacional para staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados, redacao de reviews,
  atribuicao manual, vagas abertas, acesso residual, confianca publica e split
  financeiro endurecidos.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta muito forte; producao ainda nao esta
  pronta sem prova de staging real e operacao com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, pagamentos, operacao, confianca publica, atribuicao
operacional, vagas abertas e bloqueios de profissional inelegivel.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo pagamentos e carteira profissional.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/models/payment.rb`
- `test/models/payment_test.rb`

## Ultima etapa concluida: confianca publica filtra reviews de profissionais visiveis

Objetivo: impedir que reviews antigas de profissionais suspensos, rejeitados ou
pendentes continuem aparecendo em `/api/v1/marketplace/trust` e nas estatisticas
publicas de confianca.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `database-engineering-control`
- `continuity-memory`

Foi feito:

- `Review` ganhou o scope `publicly_visible`, ligado a
  `Professional.publicly_listed`.
- `Api::V1::MarketplaceController#trust` passou a listar apenas reviews
  publicamente visiveis.
- As estatisticas publicas de confianca agora contam apenas profissionais
  publicamente listaveis e reviews publicamente visiveis.
- O controller legado `MarketplaceController#trust` tambem passou a usar o
  mesmo scope, mantendo a regra unica mesmo fora da API.
- Foi adicionada regressao de integracao provando que review de profissional
  suspenso/verificado nao aparece em confianca publica nem entra nas
  estatisticas.

Arquivos principais:

- `app/models/review.rb`
- `app/controllers/api/v1/marketplace_controller.rb`
- `app/controllers/marketplace_controller.rb`
- `test/integration/service_request_review_test.rb`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/service_request_review_test.rb
```

Resultado antes da correcao:

- `ServiceRequestReviewTest#test_public_trust_excludes_reviews_for_non_public_professionals`
  falhou porque a lista publica de reviews incluia a review do profissional
  suspenso.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/service_request_review_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/models/review.rb app/controllers/api/v1/marketplace_controller.rb app/controllers/marketplace_controller.rb test/integration/service_request_review_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Testes focados: `6 runs, 36 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `4 files inspected, no offenses detected`.
- Suite Rails completa: `85 runs, 387 assertions, 0 failures, 0 errors, 0 skips`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- A pagina/API publica de confianca ja nao promove reviews de profissionais que
  nao estao atualmente visiveis ao publico.
- As estatisticas de confianca publica ficaram alinhadas com a mesma fronteira
  usada por busca, matching, vagas e atribuicao.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados, redacao de reviews,
  atribuicao manual, vagas abertas, acesso residual e confianca publica
  bloqueados para profissionais nao visiveis.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta muito forte; producao ainda nao esta
  pronta sem prova de staging real e operacao com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, operacao, confianca publica, atribuicao operacional,
vagas abertas e bloqueios de profissional inelegivel.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo confianca publica.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/models/review.rb`
- `app/controllers/api/v1/marketplace_controller.rb`
- `test/integration/service_request_review_test.rb`

## Ultima etapa concluida: acesso residual bloqueado para profissionais inelegiveis

Objetivo: impedir que profissionais ja atribuidos a pedidos mantenham acesso a
dados privados ou mudem estados quando depois ficam com documentos rejeitados,
pendentes ou perfil suspenso.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `database-engineering-control`
- `continuity-memory`

Foi feito:

- `ServiceRequestPolicy` passou a considerar profissional atribuido apenas se o
  perfil atual ainda for `publicly_listed?`.
- O scope de pedidos para profissionais agora retorna vazio quando o perfil nao
  esta verificado/ativo, impedindo detalhe direto por API.
- `ServiceRequests::UpdateStatus` passou a exigir profissional atribuido e ainda
  elegivel antes de aceitar mudancas como `accepted`, `in_progress`,
  `cancelled` ou `disputed`.
- `ProfessionalPortalController` passou a bloquear dashboard, wallet, history e
  jobs para profissionais nao verificados, mantendo `profile`/cadastro
  acessivel.
- Regressões cobrem policy, serviço e API: profissional rejeitado nao ve pedido
  atribuido, nao muda estado e nao acessa superficies operacionais do portal.

Arquivos principais:

- `app/policies/service_request_policy.rb`
- `app/services/service_requests/update_status.rb`
- `app/controllers/api/v1/professional_portal_controller.rb`
- `test/policies/service_request_policy_test.rb`
- `test/services/service_requests/update_status_test.rb`
- `test/integration/service_request_status_security_test.rb`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/service_request_status_security_test.rb test/services/service_requests/update_status_test.rb test/policies/service_request_policy_test.rb
```

Resultado antes da correcao:

- `ServiceRequests::UpdateStatusTest#test_rejected_assigned_professional_cannot_update_workflow_statuses`
  falhou porque nenhum `Pundit::NotAuthorizedError` era gerado.
- `ServiceRequestPolicyTest#test_rejected_assigned_professional_is_excluded_from_request_scope_and_status_updates`
  falhou porque o scope ainda incluia o pedido atribuido.
- `ServiceRequestStatusSecurityTest#test_rejected_assigned_professional_cannot_access_or_update_assigned_request`
  falhou porque a API retornava `200 OK` no detalhe do pedido.
- `ServiceRequestStatusSecurityTest#test_rejected_professional_cannot_access_operational_portal_request_surfaces`
  falhou porque o dashboard profissional retornava `200 OK`.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/service_request_status_security_test.rb test/services/service_requests/update_status_test.rb test/policies/service_request_policy_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/policies/service_request_policy.rb app/services/service_requests/update_status.rb app/controllers/api/v1/professional_portal_controller.rb test/integration/service_request_status_security_test.rb test/services/service_requests/update_status_test.rb test/policies/service_request_policy_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Testes focados: `13 runs, 58 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `6 files inspected, no offenses detected`.
- Suite Rails completa: `84 runs, 378 assertions, 0 failures, 0 errors, 0 skips`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- Profissional que perde verificacao deixa de ver pedidos atribuidos por API e
  deixa de alterar estados de workflow.
- Superficies operacionais do portal profissional tambem ficam bloqueadas para
  perfis pendentes/rejeitados/suspensos.
- Operacao continua com acesso completo, e cliente continua vendo os proprios
  pedidos.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados, redacao de reviews
  publicas, atribuicao manual com elegibilidade obrigatoria, vagas abertas e
  acesso residual bloqueados para profissionais nao verificados.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta muito forte; producao ainda nao esta
  pronta sem prova de staging real e operacao com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, operacao, confianca publica, atribuicao operacional,
vagas abertas e bloqueios de profissional inelegivel.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo bloqueios de profissional inelegivel.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/policies/service_request_policy.rb`
- `app/controllers/api/v1/professional_portal_controller.rb`
- `test/integration/service_request_status_security_test.rb`

## Ultima etapa concluida: vagas abertas bloqueadas para profissionais nao verificados

Objetivo: impedir que profissionais pendentes, rejeitados ou suspensos usem
`/api/v1/professional_portal/jobs` para ver pedidos pendentes antes de passarem
pela verificacao operacional.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `database-engineering-control`
- `elite-web-experience`
- `continuity-memory`

Foi feito:

- `ProfessionalPortalController#jobs` passou a exigir `@professional.publicly_listed?`.
- Profissionais ainda nao verificados recebem `403` com codigo
  `professional_not_verified` ao tentar listar vagas abertas.
- Perfil/dashboard continuam disponiveis para o profissional completar cadastro
  e acompanhar estado; o bloqueio foi aplicado apenas na superficie de pedidos
  disponiveis.
- Foi adicionada regressao de integracao provando que profissional com
  `documents_status: pending` nao consegue listar vagas nem ver descricao de
  pedidos pendentes.

Arquivos principais:

- `app/controllers/api/v1/professional_portal_controller.rb`
- `test/integration/api_v1_contract_test.rb`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
```

Resultado antes da correcao:

- Falhou em `test_unverified_professional_cannot_list_available_jobs`.
- O endpoint retornou `200 OK` para profissional pendente, provando que pedidos
  disponiveis ainda podiam ser consultados por perfil nao verificado.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/controllers/api/v1/professional_portal_controller.rb test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Contrato API focado: `20 runs, 93 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `2 files inspected, no offenses detected`.
- Suite Rails completa: `80 runs, 363 assertions, 0 failures, 0 errors, 0 skips`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- A superficie de vagas abertas agora segue a mesma fronteira de seguranca da
  busca publica, matching e atribuicao manual: apenas profissionais verificados
  e nao suspensos podem ver pedidos pendentes disponiveis.
- Profissionais pendentes continuam capazes de acessar areas necessarias para
  cadastro/perfil, mas nao recebem dados operacionais de pedidos abertos.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados, redacao de reviews
  publicas, atribuicao manual com elegibilidade obrigatoria e vagas abertas
  bloqueadas para profissionais nao verificados.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta muito forte; producao ainda nao esta
  pronta sem prova de staging real e operacao com secrets reais.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, operacao, confianca publica, atribuicao operacional e
vagas abertas.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo confianca publica, atribuicao operacional e
  vagas abertas.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/controllers/api/v1/professional_portal_controller.rb`
- `test/integration/api_v1_contract_test.rb`

## Ultima etapa concluida: atribuicao manual bloqueia profissionais inelegiveis

Objetivo: impedir que a atribuicao manual de pedidos por operador contorne o
matching seguro e exponha dados de clientes a profissionais pendentes,
rejeitados, suspensos ou fora da categoria do pedido.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `database-engineering-control`
- `continuity-memory`

Foi feito:

- `Professional` ganhou o predicado `assignable_to?(service_request)`, que
  exige profissional publicamente listavel e associado a categoria do pedido.
- `ServiceRequests::Assign` passou a validar a elegibilidade antes de alterar o
  pedido ou criar notificacao.
- A API de atribuicao agora retorna erro de validacao quando um operador tenta
  atribuir o pedido a profissional inelegivel.
- Testes de servico provam o fluxo positivo e bloqueiam profissional sem
  documentos verificados e profissional fora da categoria.
- Teste de integracao prova que profissional pendente nao recebe atribuicao, nao
  gera notificacao e continua sem acesso ao detalhe do pedido.

Arquivos principais:

- `app/models/professional.rb`
- `app/services/service_requests/assign.rb`
- `test/services/service_requests/assign_test.rb`
- `test/integration/service_request_status_security_test.rb`
- `docs/AGENT_MEMORY.md`

Evidencia antes da correcao:

- `ServiceRequests::Assign#call` chamava `service_request.assign_to!(professional)`
  diretamente para qualquer `professional_id` encontrado pelo controller.
- Isso permitia que um operador atribuisse pedido a profissional com
  `documents_status: pending` ou sem relacao com a categoria, contornando a
  regra ja existente no matching.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/services/service_requests/assign_test.rb test/integration/service_request_status_security_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/models/professional.rb app/services/service_requests/assign.rb test/services/service_requests/assign_test.rb test/integration/service_request_status_security_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Testes focados: `6 runs, 33 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `4 files inspected, no offenses detected`.
- Suite Rails completa: `79 runs, 361 assertions, 0 failures, 0 errors, 0 skips`.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- Atribuicao manual ja nao pode transformar profissional inelegivel em
  profissional atribuido a um pedido.
- Profissionais pendentes/rejeitados/suspensos ou fora da categoria nao recebem
  notificacao nem ganham acesso indireto aos dados do pedido.
- Matching, busca publica e atribuicao manual agora seguem a mesma fronteira de
  seguranca essencial: profissional verificado, ativo e coerente com a categoria
  antes de receber superficie de trabalho.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados, redacao de reviews
  publicas e atribuicao manual com elegibilidade obrigatoria.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta cada vez mais forte; producao ainda
  nao esta pronta sem prova de staging real.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, operacao, confianca publica e atribuicao operacional.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo confianca publica e atribuicao operacional.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/services/service_requests/assign.rb`
- `test/services/service_requests/assign_test.rb`

## Ultima etapa concluida: reviews publicas de confianca redigidas

Objetivo: impedir que a rota publica
`/api/v1/marketplace/trust` exponha identidade real do cliente ou codigo de
pedido associado nas reviews exibidas publicamente.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `elite-web-experience`
- `continuity-memory`

Foi feito:

- `ReviewSerializer` ganhou modo `public_view` para separar payload publico de
  payload autenticado/default.
- Reviews publicas agora retornam cliente generico com nome
  `"Cliente verificado"` e nao expõem `company_name`, `contact` nem outros
  detalhes privados do cliente.
- O `service_request.code` deixou de ser emitido no payload publico de
  confianca; o titulo do pedido continua disponivel para contexto de UX.
- `MarketplaceController#trust` passou a chamar o serializer em modo publico.
- O contrato OpenAPI foi ajustado para tornar `service_request.code` opcional,
  e o schema TypeScript do frontend foi regenerado.
- Foi adicionada regressao de integracao provando a redacao publica.

Arquivos principais:

- `app/serializers/api/v1/review_serializer.rb`
- `app/controllers/api/v1/marketplace_controller.rb`
- `test/integration/service_request_review_test.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/schema.ts`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/service_request_review_test.rb
```

Resultado antes da correcao:

- Falhou em `test_public_trust_reviews_redact_client_identity_and_service_request_code`.
- O payload publico ainda nao cumpria o contrato redigido esperado, provando que
  a rota de confianca precisava de uma fronteira de serializacao publica.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/service_request_review_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/serializers/api/v1/review_serializer.rb app/controllers/api/v1/marketplace_controller.rb test/integration/service_request_review_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run generate:api
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Review/teste focado: `5 runs, 27 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `75 runs, 341 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `3 files inspected, no offenses detected`.
- `npm run generate:api`: concluido com sucesso.
- Frontend typecheck: concluido com sucesso.
- Frontend lint: concluido com sucesso.
- Brakeman: `Security Warnings: 0`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- A rota publica de confianca ja nao revela nome real, empresa, contacto ou
  codigo de pedido do cliente.
- O comportamento autenticado/default do serializer foi preservado para fluxos
  internos que ainda precisam do payload completo.
- O frontend continua a receber titulo de pedido e nome generico suficiente para
  a pagina publica de confianca.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local,
  filtragem publica/matching de profissionais verificados e redacao de reviews
  publicas de confianca.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta praticamente fechado; producao ainda
  nao esta pronta sem prova de staging real.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos, operacao e pagina publica de confianca.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais, incluindo confianca publica.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`
- `app/controllers/api/v1/marketplace_controller.rb`
- `app/serializers/api/v1/review_serializer.rb`

## Ultima etapa concluida: profissionais nao verificados removidos da superficie publica e matching

Objetivo: impedir que profissionais com documentos pendentes/rejeitados aparecam
em busca publica, categorias, marketplace, matching de pedidos ou detalhe
acessivel por cliente.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `database-engineering-control`
- `continuity-memory`

Foi feito:

- `Professional` ganhou os escopos `verified` e `publicly_listed`, alem do
  predicado `publicly_listed?`.
- Busca publica de profissionais, marketplace publico, detalhe de categoria e
  matching de pedidos agora usam apenas `Professional.publicly_listed`.
- `ProfessionalPolicy` agora so permite que clientes vejam detalhe de
  profissionais verificados e nao suspensos; operadores continuam com visao
  operacional e profissionais continuam podendo acessar o proprio perfil.
- A contagem publica de profissionais por categoria agora conta apenas perfis
  publicamente listaveis quando a associacao esta carregada.
- Testes adicionados provam que busca publica e matching excluem profissionais
  nao verificados, e que clientes nao acessam detalhe de profissional nao
  verificado.

Arquivos principais:

- `app/models/professional.rb`
- `app/policies/professional_policy.rb`
- `app/services/matching_service.rb`
- `app/controllers/api/v1/professionals_controller.rb`
- `app/controllers/api/v1/marketplace_controller.rb`
- `app/controllers/api/v1/service_categories_controller.rb`
- `app/controllers/marketplace_controller.rb`
- `app/serializers/api/v1/service_category_serializer.rb`
- `test/integration/api_v1_contract_test.rb`
- `test/integration/professional_documents_test.rb`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
```

Resultado antes da correcao:

- Falhou em `test_public_professional_search_excludes_unverified_professionals`.
- Falhou em `test_service_request_matches_exclude_unverified_professionals`.
- As respostas ainda continham o ID do profissional com
  `documents_status: pending`, provando exposicao publica/matching indevida.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/professional_documents_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/models/professional.rb app/policies/professional_policy.rb app/services/matching_service.rb app/controllers/api/v1/professionals_controller.rb app/controllers/api/v1/marketplace_controller.rb app/controllers/api/v1/service_categories_controller.rb app/controllers/marketplace_controller.rb app/serializers/api/v1/service_category_serializer.rb test/integration/api_v1_contract_test.rb test/integration/professional_documents_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down --volumes --remove-orphans
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais --format '{{.Names}} {{.Status}}'
```

Resultados:

- Contrato API focado: `19 runs, 91 assertions, 0 failures, 0 errors, 0 skips`.
- Documentos profissionais focado: `13 runs, 49 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `74 runs, 334 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `10 files inspected, no offenses detected`.
- Brakeman: `0 security warnings`.
- Bundler Audit: `No vulnerabilities found`.
- `docker compose down --volumes --remove-orphans` executado; nenhum container
  `profissionais` ficou ativo.

Estado atual:

- Profissionais nao verificados deixam de aparecer para clientes/publico e nao
  entram em matching.
- Operacao ainda consegue gerir perfis e documentos por caminhos autorizados.
- Esta fase nao substitui staging real; ainda falta validar DNS/TLS/secrets,
  Nginx, preflight remoto e browser manual em ambiente real.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore,
  rotacao/revogacao de sessao API, smoke Rails+Next, preflight local e
  filtragem publica/matching de profissionais verificados.
- Falta imediato: staging real com `.env.production` real, DNS/TLS, Nginx,
  preflight remoto completo, smoke remoto e validacao manual/browser.
- Distancia do fim: hardening local esta praticamente fechado; producao ainda
  nao esta pronta sem prova de staging real.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional, documentos e operacao.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar/validar `.env.production` real fora do repositorio.
- Subir Compose/Nginx real e emitir TLS.
- Rodar preflight remoto, smoke remoto, backup/restore e browser manual dos
  fluxos principais.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`

## Ultima etapa concluida: preflight de staging endurecido e testado em Docker

Objetivo: transformar os requisitos de headers/cookies/redirects de staging em
gates mais estritos e repetiveis antes de rodar contra DNS/TLS reais.

Skills aplicados:

- `global-engineering-control`
- `codex-security:security-scan`
- `senior-dev-lifecycle`
- `continuity-memory`

Foi feito:

- `scripts/preflight_profissionais_staging.sh` agora exige `HttpOnly` no cookie
  `_profiangola_session`, validando atributos apenas na linha `Set-Cookie`
  correta em vez de procurar `Secure` no ficheiro inteiro de headers.
- O preflight agora exige, em HTTPS, redirect HTTP -> HTTPS com status `301` ou
  `308` para todos os hosts esperados.
- O preflight agora exige HSTS com `includeSubDomains` e `Permissions-Policy`
  contendo `camera=()`, `microphone=()` e `payment=()`.
- Foram adicionadas opcoes explicitas para harness/local:
  `PROFISSIONAIS_PREFLIGHT_SKIP_DNS`,
  `PROFISSIONAIS_PREFLIGHT_REQUIRE_HTTP_REDIRECT` e
  `PROFISSIONAIS_PREFLIGHT_HTTP_PORT`. Os defaults continuam seguros para
  staging/producao real.
- Criado `scripts/test_preflight_profissionais_staging.sh`, que sobe Nginx em
  Docker, valida um caso positivo com headers/cookie seguros e prova caso
  negativo: cookie de sessao sem `HttpOnly` e bloqueado.
- `docs/deploy/staging_production_profissionais.md` e
  `docs/deploy/production_readiness_profissionais.md` passaram a incluir o
  teste local do preflight e os novos gates.

Arquivos principais:

- `scripts/preflight_profissionais_staging.sh`
- `scripts/test_preflight_profissionais_staging.sh`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_profissionais_deploy.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/preflight_conexao_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_preflight_profissionais_staging.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais-preflight-test --format '{{.Names}}'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker volume ls --filter name=profissionais-preflight-test --format '{{.Name}}'
```

Resultados:

- Sintaxe dos scripts alterados/relacionados: passou.
- Teste Docker do preflight: passou.
- Caso positivo local: Nginx em Docker retornou headers defensivos, cookie com
  `Domain`, `Secure`, `HttpOnly`, `SameSite=Lax`, smoke de hosts e endpoints
  passou.
- Caso negativo local: preflight bloqueou cookie sem `HttpOnly`.
- Nao ficaram containers nem volumes Docker com prefixo
  `profissionais-preflight-test`.

Estado atual:

- A rotina local agora prova que o preflight falha em uma regressao critica de
  cookie e valida mais invariantes de proxy/headers antes de staging real.
- O preflight real continua pendente contra DNS/TLS/secrets reais.
- Durante a validacao, a ponte WSL oscilou duas vezes; a distro `Ubuntu` foi
  terminada e reiniciada, e os checks finais confirmaram ambiente limpo.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore de Postgres e
  `rails_storage`, rotacao/revogacao de sessao API, smoke integrado Rails+Next
  e preflight local testado em Docker.
- Falta imediato: executar staging real com `.env.production` real, DNS/TLS,
  Nginx, preflight remoto completo, smoke remoto e navegacao manual/browser dos
  fluxos principais.
- Distancia do fim: hardening local esta quase fechado; producao ainda nao esta
  pronta sem a execucao real de staging.

## Proximo passo recomendado

Subir/validar staging real atras de Nginx com DNS/TLS/secrets reais e rodar
preflight remoto completo, smoke remoto e teste manual/browser de login, pedido,
profissional e operacao.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS/secrets reais, preflight remoto completo, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar `.env.production` real fora do repositorio e validar com
  `scripts/check_profissionais_env.sh`.
- Subir Compose/Nginx real, emitir TLS e confirmar DNS/HTTP redirect.
- Rodar `scripts/preflight_profissionais_staging.sh`,
  `scripts/smoke_profissionais_deploy.sh` e teste manual/browser dos fluxos
  principais.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/production_readiness_profissionais.md`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/env.production.example`
- `docs/deploy/nginx-profissionais.example.conf`
- `scripts/check_profissionais_env.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/smoke_profissionais_deploy.sh`

## Ultima etapa concluida: smoke integrado Rails+Next de origem, proxy e sessao

Objetivo: validar em Docker o fluxo real entre Rails e Next para login,
logout, cookie de sessao, `/api/v1/me` e redirects atras de proxy, fechando a
lacuna em que o Next podia usar a origem interna do container em vez da origem
publica validada.

Skills aplicados:

- `global-engineering-control`
- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `api-engineering-control`
- `elite-web-experience`
- `continuity-memory`

Foi feito:

- `frontend/src/lib/server/app-url.ts` agora deriva a origem publica a partir
  de `X-Forwarded-Host`, `X-Forwarded-Proto` e `X-Forwarded-Port`, mas apenas
  quando o host normalizado esta em `FRONTEND_ALLOWED_HOSTS`, nos hosts do
  ecossistema, nos hosts locais permitidos ou na origem canonica.
- Quando `X-Forwarded-Host` existe mas e invalido, malformado ou nao permitido,
  o Next cai diretamente em `FRONTEND_PUBLIC_BASE_URL`, sem reaproveitar a
  origem interna `request.url` do container.
- Hosts locais (`localhost`, `127.0.0.1`, `0.0.0.0`, `::1`) deixam de ser
  confiaveis incondicionalmente em `NODE_ENV=production`; continuam aceitos em
  desenvolvimento ou quando a origem/hosts configurados sao locais.
- `scripts/smoke_integrated_session_profissionais.sh` agora simula proxy real
  com `X-Forwarded-*` e prova login, logout, expiracao de cookie,
  autenticacao via `/api/v1/me`, revogacao apos logout e fallback canonico para
  host atacante.
- O smoke integrado ganhou espera de Rails/Next configuravel e impressao de
  logs dos containers em falhas, porque uma execucao intermediaria provou que
  `bundle install`/preparacao de DB pode ultrapassar a janela antiga.
- `docs/deploy/staging_production_profissionais.md` passou a exigir o smoke
  integrado local antes de publicar ou depois de alterar autenticacao, proxy ou
  cookies.

Arquivos principais:

- `frontend/src/lib/server/app-url.ts`
- `scripts/smoke_integrated_session_profissionais.sh`
- `docs/deploy/staging_production_profissionais.md`
- `docs/AGENT_MEMORY.md`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
```

Resultados antes da correcao:

- Primeira falha: login via Next redirecionou para
  `http://localhost:3001/pedidos`, provando uso da origem interna do container.
- Segunda falha, apos a primeira mitigacao: host nao permitido ainda caiu para
  `http://localhost:3001/pedidos`, provando que `X-Forwarded-Host` nao
  confiavel nao podia fazer fallback para `request.url`.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/smoke_integrated_session_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker ps --filter name=profissionais-integrated-smoke --format '{{.Names}}'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker network ls --filter name=profissionais-integrated-smoke --format '{{.Name}}'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker volume ls --filter name=profissionais-integrated-smoke --format '{{.Name}}'
```

Resultados:

- Sintaxe do smoke: passou.
- TypeScript frontend: passou.
- ESLint frontend: passou.
- Docker smoke integrado: passou.
- O build Docker do Next executou `next build` com sucesso.
- Uma execucao intermediaria falhou por timeout em Rails `/up`; apos aumentar a
  espera configuravel e adicionar logs em falha, o smoke final passou.
- Smoke validou Rails `/up`, Next `/favicon.ico`, login 303 para
  `http://127.0.0.1:3019/pedidos`, cookie `_profiangola_session` com
  `HttpOnly` e `SameSite=Lax`, Rails `/api/v1/me` autenticado, logout 303 para
  `/login`, cookie expirado, `/api/v1/me` retornando `401` apos logout e host
  atacante caindo na origem canonica.
- Nao ficaram containers, redes ou volumes Docker ativos com prefixo
  `profissionais-integrated-smoke`.

Estado atual:

- O fluxo local integrado Rails+Next esta provado em Docker para origem/proxy,
  login, logout e revogacao de sessao.
- O helper de redirects do Next agora evita origem interna de container e
  rejeita `Host`/`X-Forwarded-Host` nao confiaveis.
- Esta fase ainda nao prova producao real; faltam staging com DNS/TLS reais,
  secrets reais, Nginx real, preflight de headers, smoke remoto e validacao
  manual/browser.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e prontidao operacional para
  staging/producao.
- Solido agora: env gate, hardening de containers, backup/restore de Postgres e
  `rails_storage`, rotacao/revogacao de sessao API e smoke integrado
  Rails+Next em Docker.
- Falta imediato: executar staging real com `.env.production` real, DNS/TLS,
  Nginx, preflight de headers/cookies, smoke remoto e navegacao manual dos
  fluxos principais.
- Distancia do fim: esta trilha local esta quase no fim; o produto completo
  ainda nao deve ser marcado como pronto para producao ate staging real passar
  com evidencias.

## Proximo passo recomendado

Criar/implementar a validacao de staging real atras de Nginx com DNS/TLS,
secrets reais, preflight de headers/cookies, smoke remoto e browser manual dos
fluxos principais.

AVISO: O proximo passo e criar/implementar a validacao de staging real atras de Nginx com DNS/TLS, secrets reais, preflight de headers/cookies, smoke remoto e browser manual. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Preparar `.env.production` real em staging sem placeholders.
- Subir Compose/Nginx real e confirmar DNS/TLS.
- Rodar check de env, `docker compose config`, preflight, smoke remoto e teste
  manual/browser de login, pedido, profissional e operacao.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/env.production.example`
- `docs/deploy/nginx-profissionais.example.conf`
- `scripts/check_profissionais_env.sh`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/smoke_integrated_session_profissionais.sh`

## Ultima etapa concluida: rotacao e revogacao de sessao API

Objetivo: fechar uma lacuna plausivel de sessao em que o login API precisava
provar renovacao de cookie e o logout API precisava expirar o cookie de sessao,
nao apenas remover o usuario do estado interno.

Skills aplicados:

- `codex-security:fix-finding`
- `senior-dev-lifecycle`
- `continuity-memory`

Foi feito:

- `Api::V1::SessionsController#create` agora chama `reset_session` antes de
  `sign_in(user)`, renovando a sessao no login.
- `Api::V1::SessionsController#destroy` agora faz `sign_out`, `reset_session`,
  marca `request.session_options[:drop] = true` e expira explicitamente o cookie
  usando as opcoes reais do session store.
- `test/integration/api_v1_contract_test.rb` ganhou regressao para garantir que
  o cookie de sessao muda entre CSRF/pre-login e login.
- `test/integration/api_v1_contract_test.rb` ganhou regressao para garantir que
  logout responde com cookie expirado e que `/api/v1/me` volta a `401`.

Arquivos principais:

- `app/controllers/api/v1/sessions_controller.rb`
- `test/integration/api_v1_contract_test.rb`

Reproducao antes da correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
```

Resultado antes da correcao:

- Falhou em `test_session_contract_revokes_authenticated_session_on_logout`.
- O `Set-Cookie` do logout continha uma nova sessao sem `Max-Age=0`/`Expires`,
  provando que o navegador nao recebia uma instrucao clara para descartar o
  cookie.

Verificacao executada apos a correcao:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/authentication_flow_test.rb test/integration/rate_limit_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec rubocop app/controllers/api/v1/sessions_controller.rb test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose run --rm --no-deps web bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose down
```

Resultados:

- Contrato API focado: `16 runs, 83 assertions, 0 failures, 0 errors, 0 skips`.
- Auth/rate-limit focados: `6 runs, 12 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `70 runs, 325 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `2 files inspected, no offenses detected`.
- Brakeman: `0 security warnings`.
- Bundler Audit: `No vulnerabilities found`.
- Compose do projeto ficou sem containers/rede ativos apos `docker compose down`.

Estado atual:

- Login API renova sessao.
- Logout API revoga estado autenticado e envia expiracao explicita do cookie.
- Rate limit e contratos API continuam verdes.
- Esta fase nao prova producao real; ainda falta staging com Rails/Next vivos
  juntos, DNS/TLS, secrets reais, preflight e smoke manual/browser.

## Proximo passo recomendado

Validar politicas de origem/proxy e smoke integrado Rails+Next em staging/local
com ambos os servicos vivos, incluindo login, logout, `/me` e redirecionamentos
do Next.

AVISO: O proximo passo e criar/implementar a validacao integrada Rails+Next de origem/proxy e sessao. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Ultima etapa concluida: backup e restore de rails_storage

Objetivo: fechar a lacuna operacional em que o banco tinha backup/restore, mas
os documentos profissionais e anexos do Active Storage ficavam dependentes do
volume `rails_storage` sem rotina propria.

Foi feito:

- Criado `scripts/backup_profissionais_storage.sh` para gerar
  `profissionais-storage-YYYYMMDDTHHMMSSZ.tar.gz` com checksum `.sha256`.
- Criado `scripts/restore_profissionais_storage.sh` com confirmacao obrigatoria
  `PROFISSIONAIS_STORAGE_RESTORE_CONFIRM=restore-storage`.
- O restore valida gzip/tar, checksum quando existe, bloqueia caminhos
  absolutos e path traversal antes de limpar/extrair o destino.
- Criado `scripts/test_storage_backup_restore_profissionais.sh`, que usa dois
  volumes Docker descartaveis para provar backup e restore sem tocar nos
  anexos reais.
- `scripts/test_backup_restore_profissionais.sh` agora valida Postgres e depois
  chama o teste de storage.
- `docs/deploy/env.production.example` ganhou variaveis operacionais de storage.
- `scripts/check_profissionais_env.sh` valida as novas variaveis de storage no
  `.env.production`.
- `docs/deploy/staging_production_profissionais.md` agora documenta backup e
  restore de Postgres e `rails_storage`.

Arquivos principais:

- `scripts/backup_profissionais_storage.sh`
- `scripts/restore_profissionais_storage.sh`
- `scripts/test_storage_backup_restore_profissionais.sh`
- `scripts/test_backup_restore_profissionais.sh`
- `scripts/check_profissionais_env.sh`
- `docs/deploy/env.production.example`
- `docs/deploy/staging_production_profissionais.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/backup_profissionais_storage.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/restore_profissionais_storage.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/test_storage_backup_restore_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/test_backup_restore_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/check_profissionais_env.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/check_profissionais_env.sh docs/deploy/env.production.example
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_storage_backup_restore_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- env PROFISSIONAIS_STORAGE_RESTORE_CONFIRM=restore-storage ./scripts/restore_profissionais_storage.sh tmp/storage-malicious.Yj3x1y/malicious.tar.gz
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/check_profissionais_env.sh tmp/env.production.storage.valid
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose --env-file tmp/env.production.storage.valid -f compose.production.example.yaml config
```

Resultados:

- Sintaxe dos scripts novos e alterados: passou.
- `.env.production.example`: falhou de proposito apenas pelos placeholders de
  secrets.
- Env temporario positivo com variaveis de storage: passou com `OK` e aviso
  esperado de `ACTIVE_STORAGE_SERVICE=local`.
- Compose com env temporario positivo: renderizou sem erro.
- Teste Docker de storage: criou backup, validou checksum, restaurou em volume
  descartavel e conferiu ficheiros restaurados.
- Restore com archive malicioso contendo `../evil`: bloqueado com `FAIL arquivo
  contem path traversal`.
- Volumes Docker e ficheiros temporarios dos testes foram removidos.

Estado atual:

- A rotina local de release cobre agora Postgres e ficheiros/anexos do Active
  Storage.
- Producao real ainda precisa executar esses scripts contra staging real, com
  secrets reais, DNS/TLS, preflight completo e smoke manual/browser.

## Proximo passo recomendado

Continuar hardening local ou partir para staging real. O proximo bloco local de
maior valor e validar rotacao/revogacao de sessao e politicas de origem/proxy
com Rails e Next vivos juntos.

## Ultima etapa concluida: hardening de containers de producao

Objetivo: reduzir impacto de comprometimento em runtime, especialmente no
frontend Next.js de producao.

Foi feito:

- `frontend/Dockerfile` ganhou stage `prod-deps` com `npm prune --omit=dev`.
- A imagem final do frontend agora copia artefatos com `--chown=node:node`.
- O frontend roda como usuario nao-root `node`.
- O comando de runtime deixou de passar por `npm run start` e chama o Next
  diretamente com `node node_modules/next/dist/bin/next start -p 3001`.
- `compose.production.example.yaml` agora aplica `no-new-privileges` em `db`,
  `rails` e `frontend`.
- O servico `frontend` no Compose agora declara `user: "1000:1000"`,
  `read_only: true`, `tmpfs: /tmp` e `cap_drop: ALL`.
- A checklist de deploy passou a exigir confirmacao dessas diretivas no
  `docker compose config`.

Arquivos principais:

- `frontend/Dockerfile`
- `compose.production.example.yaml`
- `docs/deploy/staging_production_profissionais.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker build --progress=plain -f frontend/Dockerfile frontend -t profissionais-frontend-security-check
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm --entrypoint id profissionais-frontend-security-check
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -d --name profissionais-frontend-security-check-run --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges -p 127.0.0.1:3017:3001 -e FRONTEND_PUBLIC_BASE_URL=http://127.0.0.1:3017 -e FRONTEND_ALLOWED_HOSTS=127.0.0.1,localhost -e RAILS_API_BASE_URL=http://127.0.0.1:3000 -e RAILS_PUBLIC_BASE_URL=http://127.0.0.1:3000 profissionais-frontend-security-check
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-frontend-security-check-run sh -lc 'id && test ! -w /app && touch /tmp/profissionais-write-ok'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- curl -fsS -D - http://127.0.0.1:3017/favicon.ico -o /tmp/profissionais-frontend-security-favicon.ico
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker inspect profissionais-frontend-security-check-run --format '{{.Config.User}} {{json .Config.Cmd}} {{.HostConfig.ReadonlyRootfs}} {{json .HostConfig.CapDrop}} {{json .HostConfig.SecurityOpt}} {{json .HostConfig.Tmpfs}}'
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker stop profissionais-frontend-security-check-run
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose --env-file docs/deploy/env.production.example -f compose.production.example.yaml config
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
```

Resultados:

- Imagem Docker do frontend: build passou.
- Runtime da imagem: `uid=1000(node)`.
- Container hardened: rootfs read-only, `cap_drop: ALL`, `no-new-privileges`,
  `/tmp` temporario e `/app` nao gravavel.
- Processo principal no smoke: `next-server` rodando como `node`.
- `favicon.ico` respondeu `200 OK` com headers de seguranca; rotas que dependem
  do Rails retornam 500 se o backend local nao estiver ativo, por
  `ECONNREFUSED 127.0.0.1:3000`, nao por falha do hardening.
- Compose normalizado manteve `read_only`, `tmpfs`, `cap_drop`, `user
  1000:1000` e `no-new-privileges`.
- Frontend lint, typecheck e build: passaram.
- Container temporario de smoke foi parado.

Estado atual:

- A stack de producao tem uma postura melhor de isolamento de containers,
  especialmente para o frontend exposto.
- O objetivo maior de seguranca/producao continua ativo: ainda falta staging
  real com secrets, DNS/TLS, preflight completo, backup/restore e smoke
  manual/browser com Rails e Next vivos juntos.

## Proximo passo recomendado

Avancar para uma validacao de staging real ou, enquanto staging nao existe,
continuar endurecendo gates locais de operacao: backup de `rails_storage`,
rotacao/revogacao de sessao, politicas de CORS/proxy e auditoria de endpoints
publicos.

## Ultima etapa concluida: gate seguro de env de producao

Objetivo: impedir que staging/producao subam com placeholders, hosts inseguros
ou configuracao divergente entre Rails, Next, cookies, proxy e backups.

Foi feito:

- Criado `scripts/check_profissionais_env.sh`, um checker de `.env.production`
  que le o ficheiro sem `source`/execucao de secrets.
- O checker valida ambiente `production`, secrets minimos, placeholders comuns,
  sequencias previsiveis, formato hexadecimal do `RAILS_MASTER_KEY`, SSL/cookies
  seguros, origins HTTPS, `RAILS_API_BASE_URL` interno, rate limits positivos,
  dominio raiz, hosts Rails/Next, asset hosts e retencao de backup.
- O checker avisa quando `ACTIVE_STORAGE_SERVICE=local`, porque nesse modo o
  volume `rails_storage` precisa de backup operacional.
- `docs/deploy/staging_production_profissionais.md` agora exige o checker antes
  do `docker compose build/up` e na checklist de liberacao.

Arquivos principais:

- `scripts/check_profissionais_env.sh`
- `docs/deploy/staging_production_profissionais.md`
- `docs/deploy/env.production.example`
- `compose.production.example.yaml`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/check_profissionais_env.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash scripts/check_profissionais_env.sh docs/deploy/env.production.example
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/check_profissionais_env.sh tmp/env.production.valid
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose --env-file tmp/env.production.valid -f compose.production.example.yaml config >/tmp/profissionais-compose-valid-env.yml
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'for script in scripts/check_profissionais_env.sh scripts/preflight_profissionais_staging.sh scripts/smoke_profissionais_deploy.sh scripts/backup_profissionais_postgres.sh scripts/restore_profissionais_postgres.sh scripts/test_backup_restore_profissionais.sh; do bash -n "$script"; done'
```

Resultados:

- Sintaxe do novo checker: passou.
- `docs/deploy/env.production.example`: falhou de proposito com `FAIL` para
  placeholders/segredos invalidos.
- Env temporario positivo: passou com `OK`, mantendo apenas `WARN` esperado
  para `ACTIVE_STORAGE_SERVICE=local`.
- Compose de producao com env temporario positivo: renderizou sem erro via
  Docker.
- Sintaxe dos scripts operacionais de env/preflight/smoke/backup/restore:
  passou.
- O ficheiro temporario `tmp/env.production.valid` foi removido apos o teste.

Estado atual:

- O repositorio tem agora um gate executavel antes de qualquer tentativa de
  staging/producao com `.env.production`.
- A configuracao local de release esta mais forte, mas producao real ainda nao
  esta provada sem DNS/TLS/secrets reais, preflight completo, backup/restore em
  staging e smoke manual/browser.

## Proximo passo recomendado

Subir staging real com secrets verdadeiros, executar
`./scripts/check_profissionais_env.sh .env.production`, renderizar o Compose,
rodar `scripts/preflight_profissionais_staging.sh`, validar backup/restore e
fazer smoke manual/browser dos fluxos cliente, profissional e operacao.

AVISO: O proximo passo exige infraestrutura real. Antes de iniciar, leia
`docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou e nao
repetir gates locais ja executados.

## Ultima etapa concluida: rate limit Rails API com IP canonico

Objetivo: reforcar a seguranca do endpoint Rails exposto por `/api/`, evitando
que a protecao de login dependa apenas do rate limit do Next.

Foi feito:

- Auditado `config/initializers/rack_attack.rb`; o Rails ja usava
  `rack-attack`, mas a chave do throttle foi centralizada em um helper de IP
  canonico.
- `Rack::Attack` agora prefere `action_dispatch.remote_ip` e so cai para
  `request.ip` como fallback, alinhando o throttle com o `ActionDispatch::RemoteIp`
  que roda antes do middleware no stack Rails.
- Os throttles de login, busca publica e API geral passaram a usar o mesmo
  helper de IP canonico.
- `test/integration/rate_limit_test.rb` ganhou regressao para tentativa de
  burlar o login alternando o primeiro IP de `X-Forwarded-For` enquanto o IP
  real do proxy permanece o mesmo.
- `test/integration/rate_limit_test.rb` ganhou regressao para throttling da
  busca publica de profissionais.

Arquivos principais:

- `config/initializers/rack_attack.rb`
- `test/integration/rate_limit_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/rate_limit_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop config/initializers/rack_attack.rb test/integration/rate_limit_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
```

Resultados:

- Teste focado de rate limit: `3 runs, 7 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `69 runs, 318 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.

Estado atual:

- Login direto no Rails API e busca publica estao protegidos por `rack-attack`
  com regressões de throttle.
- A chave de rate limit agora usa IP canonico processado pelo stack Rails,
  reduzindo risco de bypass por header de proxy malformado/forjado.

Estado do projeto:

- Fase/trilha atual: hardening local e preparacao de release.
- Solido agora: rate limits no Next e Rails, auth, privacidade/autorizacao,
  headers/cookies, proxy, uploads, documentos/anexos, smoke end-to-end e gates
  locais passaram em Docker/sandbox Ubuntu.
- Falta imediato: staging real com DNS/TLS/secrets, preflight completo,
  backup/restore em banco de staging e smoke manual/browser.
- Distancia do fim: localmente o repositório esta forte; producao real ainda
  depende de validacao externa em staging.

## Proximo passo recomendado

Executar staging real com preflight completo e validar backup/restore + smoke
manual/browser antes de qualquer liberacao de producao.

AVISO: O proximo passo e criar/implementar staging real com preflight completo, backup/restore e smoke manual/browser. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Subir staging com `compose.production.example.yaml` e secrets reais.
- Rodar `scripts/preflight_profissionais_staging.sh` contra os hosts reais.
- Rodar `scripts/test_backup_restore_profissionais.sh` no banco de staging.
- Validar manualmente login, criacao de pedido, atribuicao, conclusao,
  historico/carteira e revisao.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/env.production.example`
- `compose.production.example.yaml`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/test_backup_restore_profissionais.sh`

## Ultima etapa concluida: smoke end-to-end de seguranca por perfil

Objetivo: transformar a validacao cliente-profissional-operacao em uma
regressao executavel, aproximando o sistema do gate de release.

Foi feito:

- Criado `test/integration/security_release_flow_test.rb` cobrindo o fluxo
  completo:
  - cliente cria pedido;
  - cliente consulta matches sem contato/coordenadas do profissional;
  - profissional nao acessa pedido antes da atribuicao;
  - operacao atribui o pedido;
  - profissional atribuido ve dados privados necessarios do cliente;
  - profissional pode aceitar, mas nao pode concluir o pedido;
  - operacao conclui o pedido e cria pagamento;
  - cliente ve pagamento sem comissao/repasse;
  - cliente avalia o pedido concluido;
  - profissional atribuido ve pagamento proprio com breakdown financeiro e
    review.
- `Api::V1::ServiceRequestsController#show` e `#update_status` agora passam
  `include_payment_breakdown` explicitamente para `ServiceRequestSerializer`,
  liberando comissao/repasse em pagamentos embutidos apenas para usuarios
  operacionais ou profissionais autorizados.

Arquivos principais:

- `test/integration/security_release_flow_test.rb`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/serializers/api/v1/service_request_serializer.rb`
- `app/serializers/api/v1/payment_serializer.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_release_flow_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop app/controllers/api/v1/service_requests_controller.rb app/serializers/api/v1/service_request_serializer.rb app/serializers/api/v1/payment_serializer.rb test/integration/security_release_flow_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
```

Resultados:

- Smoke focado de seguranca end-to-end: `1 runs, 41 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `67 runs, 314 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.

Estado atual:

- Existe agora uma regressao integrada que conecta as barreiras de acesso entre
  cliente, profissional e operacao no fluxo principal de valor.
- Pagamentos embutidos em pedidos seguem redigidos para clientes e expõem
  breakdown apenas para perfis autorizados.

Estado do projeto:

- Fase/trilha atual: hardening local e preparacao de release.
- Solido agora: controles locais de seguranca passaram em suites focadas,
  suite Rails completa, frontend build/lint/typecheck/audit, Brakeman e
  Bundler Audit.
- Falta imediato: staging real com DNS/TLS/secrets, preflight completo,
  backup/restore em banco de staging e smoke manual/browser de UX critica.
- Distancia do fim: o repositório esta forte para ir a staging; producao real
  ainda nao esta provada sem os gates externos.

## Proximo passo recomendado

Rodar staging real com preflight completo e backup/restore, depois executar
smoke manual/browser dos fluxos cliente, profissional e operacao.

AVISO: O proximo passo e criar/implementar staging real com preflight completo e smoke manual/browser. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Subir ou apontar staging com as variaveis de `docs/deploy/env.production.example`.
- Rodar `scripts/preflight_profissionais_staging.sh` contra DNS/TLS reais.
- Rodar `scripts/test_backup_restore_profissionais.sh` contra o banco de
  staging.
- Abrir o frontend em navegador e validar login, criacao de pedido, atribuicao,
  carteira/historico profissional e operacao.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/env.production.example`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/test_backup_restore_profissionais.sh`
- `test/integration/security_release_flow_test.rb`

## Ultima etapa concluida: gates locais de staging e release

Objetivo: aproximar o sistema de producao com verificacoes locais de release,
separando o que pode ser comprovado no repositorio do que exige staging real.

Foi feito:

- `scripts/preflight_profissionais_staging.sh` passou a validar headers
  defensivos reais no host principal: CSP, `Referrer-Policy`, `nosniff`,
  `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e HSTS
  quando o esquema for HTTPS.
- `docs/deploy/staging_production_profissionais.md` passou a listar a validacao
  de headers reais como item obrigatorio da checklist de liberacao.
- Revalidado `compose.production.example.yaml` com as variaveis recentes de
  frontend/cookies.
- Revalidado o exemplo Nginx com Docker e certificado dummy local.
- Reexecutado smoke sandbox do Next em modo `next start` para confirmar headers
  de producao e redirects locais.

Arquivos principais:

- `scripts/preflight_profissionais_staging.sh`
- `docs/deploy/staging_production_profissionais.md`
- `compose.production.example.yaml`
- `docs/deploy/nginx-profissionais.example.conf`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -n scripts/preflight_profissionais_staging.sh scripts/smoke_profissionais_deploy.sh scripts/backup_profissionais_postgres.sh scripts/restore_profissionais_postgres.sh scripts/test_backup_restore_profissionais.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose --env-file docs/deploy/env.production.example -f compose.production.example.yaml config >/tmp/profissionais-compose-production.yml
wsl -d Ubuntu --cd /home/alexandre/profissionais -- node tmp/app_url_test.cjs
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash tmp/security_runtime_check.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash -lc 'docker run --rm -v "$PWD/docs/deploy/nginx-profissionais.example.conf:/etc/nginx/conf.d/default.conf:ro" -v "$PWD/tmp/nginx-test/live/profiangola.ao:/etc/letsencrypt/live/profiangola.ao:ro" nginx:alpine nginx -t'
```

Resultados:

- Sintaxe dos scripts de smoke/preflight/backup/restore: OK.
- Docker Compose de producao renderizou sem erro.
- Teste sandbox direto do helper de redirect: passou.
- Smoke sandbox `next start`: CSP, `Referrer-Policy`, `nosniff`,
  `X-Frame-Options`, `Permissions-Policy`, `COOP` e HSTS presentes; redirects
  locais retornaram `303`.
- Nginx Docker `nginx -t`: sintaxe OK.

Estado atual:

- Os gates locais de release estao mais fortes e cobrem scripts, Compose,
  Nginx, headers, cookies/redirects e suites de seguranca ja executadas.
- O preflight completo de staging ainda precisa rodar contra DNS/TLS reais,
  porque isso depende do ambiente publicado.

Estado do projeto:

- Fase/trilha atual: hardening local e preparacao de release praticamente
  fechados.
- Solido agora: backend Rails, frontend Next, configs de proxy/compose,
  privacidade/autorizacao e scripts de verificacao passaram em Docker/sandbox
  Ubuntu.
- Falta imediato: provisionar staging real, configurar secrets reais, DNS/TLS,
  rodar `scripts/preflight_profissionais_staging.sh`, smoke end-to-end e teste
  de backup/restore contra o banco de staging.
- Distancia do fim: localmente esta quase pronto para levar a staging; producao
  real ainda nao deve ser liberada sem esses gates externos.

## Proximo passo recomendado

Subir staging real e executar o preflight completo com DNS/TLS/secrets reais,
seguido de smoke end-to-end cliente-profissional-operacao e backup/restore.

AVISO: O proximo passo e criar/implementar staging real com preflight completo. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Criar `.env.production`/secrets reais a partir de
  `docs/deploy/env.production.example`.
- Subir Compose em staging e apontar DNS/TLS.
- Rodar `scripts/preflight_profissionais_staging.sh` com
  `PROFISSIONAIS_PREFLIGHT_TARGET_IP` se o DNS ainda nao tiver virado.
- Executar fluxo manual/smoke de cliente, profissional, operacao e
  backup/restore.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/env.production.example`
- `compose.production.example.yaml`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/test_backup_restore_profissionais.sh`

## Ultima etapa concluida: documentos profissionais e anexos privados

Objetivo: continuar a implementacao de seguranca com foco em arquivos,
documentos profissionais e metadados de anexos.

Foi feito:

- `test/integration/professional_documents_test.rb` ganhou regressao garantindo
  que o endpoint `professional_portal/documents` lista apenas documentos do
  profissional autenticado.
- Adicionada regressao garantindo que cliente autenticado nao recebe
  `documents` nem `contact` no detalhe de profissional.
- Adicionada regressao positiva garantindo que usuario operacional recebe
  metadados de documentos profissionais sem `url`, `signed_id` ou `file`.
- Adicionada regressao garantindo que cliente nao consegue revisar documento
  profissional.
- A auditoria local confirmou que os serializers atuais de documento/anexo nao
  expõem URL direta ou signed id de Active Storage.
- As policies/controllers atuais ja bloqueavam os cenarios testados; nao foi
  necessaria mudanca adicional na aplicacao Rails nesta fatia.

Arquivos principais:

- `test/integration/professional_documents_test.rb`
- `app/controllers/api/v1/professional_documents_controller.rb`
- `app/controllers/api/v1/professionals_controller.rb`
- `app/policies/professional_document_policy.rb`
- `app/serializers/api/v1/professional_document_serializer.rb`
- `app/serializers/api/v1/service_request_attachment_serializer.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/professional_documents_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop test/integration/professional_documents_test.rb test/integration/security_hardening_test.rb app/controllers/api/v1/professional_documents_controller.rb app/controllers/api/v1/professionals_controller.rb app/serializers/api/v1/professional_document_serializer.rb app/serializers/api/v1/service_request_attachment_serializer.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
```

Resultados:

- Teste focado de documentos profissionais: `12 runs, 48 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `66 runs, 273 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.

Estado atual:

- Documentos profissionais e metadados de anexos estao cobertos por regressões
  de privacidade e acesso cruzado.
- Nao ha endpoint de aplicacao expondo URL direta de arquivo nos serializers
  auditados.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e preparacao para producao.
- Solido agora: auth, rate limit, headers, cookies, proxy, uploads, privacidade
  financeira, isolamento de escopo e privacidade de documentos/anexos passaram
  em testes Docker/sandbox Ubuntu e scanners.
- Falta imediato: validar staging real com DNS/TLS/proxy, executar smoke
  end-to-end cliente-profissional-operacao e revisar operacao de secrets/backups
  em ambiente real.
- Distancia do fim: a trilha de seguranca local esta quase fechada; producao
  ainda depende de staging real e validacao operacional fora do repositório.

## Proximo passo recomendado

Preparar validacao final de staging/producao: smoke end-to-end, DNS/TLS/proxy,
secrets, backups/restore e checklist de release.

AVISO: O proximo passo e criar/implementar validacao final de staging/producao. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Revisar scripts existentes de smoke, preflight, backup e restore.
- Rodar ou completar checks locais que simulam staging.
- Consolidar uma checklist final com gates obrigatorios antes de producao real.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/staging_production_profissionais.md`
- `scripts/smoke_profissionais_deploy.sh`
- `scripts/preflight_profissionais_staging.sh`
- `scripts/backup_profissionais_postgres.sh`
- `scripts/test_backup_restore_profissionais.sh`

## Ultima etapa concluida: runtime seguro Next em redirects e cookies

Objetivo: continuar a preparacao de seguranca para producao endurecendo
redirects do Next, limpeza de cookies de sessao e variaveis de deploy.

Foi feito:

- Criado `frontend/src/lib/server/app-url.ts` para gerar URLs internas apenas a
  partir de hosts confiaveis; hosts fora da allowlist caem para
  `FRONTEND_PUBLIC_BASE_URL` ou `https://profiangola.ao`.
- `frontend/src/app/api/auth/login/route.ts` passou a usar o helper central de
  URL em redirects de erro e sucesso.
- Criado `frontend/src/lib/server/session-cookie.ts` para expirar o cookie de
  sessao atual, o nome padrao `_profiangola_session` e o legado `_app_session`,
  preservando `HttpOnly`, `SameSite`, `Secure` em producao e variante com
  `Domain` quando configurado.
- `frontend/src/app/api/auth/logout/route.ts` passou a expirar cookies de
  sessao com os atributos corretos de runtime.
- `docs/deploy/env.production.example` ganhou `FRONTEND_ALLOWED_HOSTS`.
- `compose.production.example.yaml` agora repassa `FRONTEND_PUBLIC_BASE_URL`,
  `FRONTEND_ALLOWED_HOSTS`, `SESSION_COOKIE_KEY`, `SESSION_COOKIE_DOMAIN` e
  `SESSION_COOKIE_SAME_SITE` para o container Next.
- `docs/deploy/staging_production_profissionais.md` documenta a origem canonica
  de redirects e a allowlist de hosts do frontend.

Arquivos principais:

- `frontend/src/lib/server/app-url.ts`
- `frontend/src/lib/server/session-cookie.ts`
- `frontend/src/app/api/auth/login/route.ts`
- `frontend/src/app/api/auth/logout/route.ts`
- `compose.production.example.yaml`
- `docs/deploy/env.production.example`
- `docs/deploy/staging_production_profissionais.md`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- node tmp/app_url_test.cjs
wsl -d Ubuntu --cd /home/alexandre/profissionais -- bash tmp/security_runtime_check.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker compose --env-file docs/deploy/env.production.example -f compose.production.example.yaml config >/tmp/profissionais-compose-production.yml
```

Resultados:

- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- Teste sandbox direto do helper: `app-url host allowlist checks passed`.
- Smoke sandbox `next start`: CSP, `Referrer-Policy`, `nosniff`,
  `X-Frame-Options`, `Permissions-Policy`, `COOP` e `HSTS` presentes; redirects
  locais retornaram `303`.
- Observacao do smoke: neste sandbox o Next normalizou `Host: evil.example` para
  `localhost` no `request.url`; o teste direto do helper cobriu o caso em que o
  runtime entrega host nao confiavel.
- Docker Compose renderizou a configuracao de producao sem erro.

Estado atual:

- Redirects de login/logout do Next ficaram centralizados e protegidos por
  allowlist/canonical origin.
- Logout limpa cookies de sessao com atributos alinhados ao deploy real.
- O Compose de producao passa as envs que o Next precisa para aplicar essa
  protecao em runtime.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e preparacao para producao.
- Solido agora: controles Rails/Next ja implementados, isolamento de escopo,
  privacidade financeira, headers, cookies e compose de producao passaram em
  verificacoes locais Ubuntu/sandbox/Docker Compose.
- Falta imediato: revisar documentos/anexos privados por perfil, validar staging
  real com DNS/TLS/proxy e rodar smoke end-to-end cliente-profissional-operacao.
- Distancia do fim: a trilha de seguranca esta avancando, mas o produto completo
  ainda precisa de validacao em staging real antes de ser chamado de producao.

## Proximo passo recomendado

Revisar documentos profissionais e anexos privados por perfil, garantindo que
clientes, profissionais e operacao veem apenas arquivos e metadados permitidos.

AVISO: O proximo passo e criar/implementar revisao de documentos profissionais e anexos privados por perfil. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar models/controllers/serializers de documentos profissionais,
  anexos de pedidos e Active Storage.
- Adicionar regressões negativas de acesso cruzado para arquivos/metadados.
- Corrigir policies/serializers/rotas se algum vazamento aparecer.
- Verificar com testes Rails em Docker, build Next e scanners aplicaveis.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `app/models/professional_document.rb`
- `app/models/service_request_attachment.rb`
- `app/controllers/api/v1/professionals_controller.rb`
- `app/controllers/api/v1/service_requests_controller.rb`
- `test/integration/security_hardening_test.rb`

## Ultima etapa concluida: isolamento de escopo por perfil

Objetivo: continuar a implementacao de seguranca com regressões negativas para
acesso cruzado entre clientes, profissionais e usuarios operacionais.

Foi feito:

- `test/integration/security_hardening_test.rb` ganhou regressões para impedir
  que um cliente acesse detalhes de pedidos de outro cliente.
- A listagem de pagamentos da API passou a ser coberta por teste que garante que
  pagamentos de outro cliente nao aparecem no payload do cliente autenticado.
- Profissionais passaram a ter regressao negativa garantindo que pedidos ainda
  nao atribuídos a eles ficam fora do acesso direto.
- Usuarios operacionais passaram a ter regressao positiva garantindo acesso a
  pedidos fora dos escopos de cliente/profissional.
- A auditoria local confirmou que as policies atuais ja aplicavam o isolamento,
  entao esta etapa nao exigiu mudanca adicional na aplicacao.

Arquivos principais:

- `test/integration/security_hardening_test.rb`
- `app/policies/service_request_policy.rb`
- `app/policies/payment_policy.rb`
- `app/policies/professional_policy.rb`

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop test/integration/security_hardening_test.rb app/controllers/api/v1/service_requests_controller.rb app/controllers/service_requests_controller.rb app/serializers/api/v1/payment_serializer.rb app/serializers/api/v1/service_request_serializer.rb app/controllers/api/v1/payments_controller.rb app/controllers/api/v1/account_controller.rb app/controllers/api/v1/professional_portal_controller.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
```

Resultados:

- Teste focado de seguranca: `10 runs, 31 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `62 runs, 257 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.

Estado atual:

- O isolamento basico de pedidos e pagamentos entre clientes/profissionais esta
  coberto por regressões negativas.
- O produto ainda precisa validar runtime real de headers/cookies, documentos
  profissionais, anexos privados e readiness operacional de staging.

Estado do projeto:

- Fase/trilha atual: hardening de seguranca e preparacao para producao.
- Solido agora: CSP Rails, 404 generico, filtros de log, senha minima, rate
  limit de login, limites de upload, proxy Nginx, privacidade financeira e
  isolamento basico de escopo passaram em testes e scanners.
- Falta imediato: validar headers/cookies em runtime Next+Rails, revisar
  documentos/anexos privados por perfil, checar configuracoes reais de staging e
  preparar uma checklist final de release.
- Distancia do fim: esta trilha de seguranca esta no meio para fim; o produto
  completo ainda nao deve ser tratado como pronto para producao sem staging real
  e smoke tests de ponta a ponta.

## Proximo passo recomendado

Validar seguranca em runtime no ambiente Next+Rails: cookies, headers reais,
origens confiaveis, redirects e payloads privados em paginas/endpoints usados
por cliente, profissional e operacao.

AVISO: O proximo passo e criar/implementar validacao de seguranca em runtime Next+Rails. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar `frontend/src/middleware.ts`, rotas `frontend/src/app/api/*`,
  configuracoes Rails de cookies/sessions/CORS e docs de deploy.
- Implementar ou ajustar headers/cookies/redirects somente onde houver lacuna
  concreta.
- Verificar com testes HTTP/browser locais, suite Rails, build Next e scanners.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `frontend/src/middleware.ts`
- `frontend/src/app/api/auth/login/route.ts`
- `config/initializers/content_security_policy.rb`
- `docs/deploy/staging_production_profissionais.md`

## Etapa concluida: privacidade financeira e campos internos

Objetivo: continuar a implementacao de seguranca com foco em autorizacao por
perfil e vazamento de dados internos.

Foi feito:

- Clientes e profissionais nao operacionais nao conseguem mais gravar
  `operator_notes` ao criar pedidos; o campo continua permitido para usuarios
  operacionais.
- `PaymentSerializer` passou a omitir `commission_cents` e
  `professional_payout_cents` por padrao.
- Endpoints de pagamento/conta agora incluem breakdown financeiro apenas para
  perfis operacionais ou profissionais autorizados.
- Portal profissional continua recebendo comissao/repasse nos fluxos de
  carteira/historico proprios.
- `ServiceRequestSerializer` ganhou `include_payment_breakdown` para controlar
  explicitamente quando pagamentos embutidos podem expor comissao/repasse.
- `test/integration/security_hardening_test.rb` ganhou regressões para:
  - cliente nao gravar `operator_notes`;
  - operacao gravar `operator_notes`;
  - cliente nao receber comissao/repasse em pagamentos;
  - operacao receber breakdown financeiro.
- `docs/api/openapi.yaml` foi ajustado para tornar comissao/repasse opcionais e
  documentar que `operator_notes` e campo interno operacional.
- `frontend/src/lib/api/schema.ts` foi regenerado.

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run generate:api
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop app/controllers/api/v1/payments_controller.rb app/controllers/api/v1/account_controller.rb app/controllers/api/v1/professional_portal_controller.rb app/controllers/api/v1/service_requests_controller.rb app/controllers/service_requests_controller.rb app/serializers/api/v1/payment_serializer.rb app/serializers/api/v1/service_request_serializer.rb test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
```

Resultados:

- Teste focado de seguranca: `6 runs, 23 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `58 runs, 249 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.

Proximo passo recomendado:

Continuar com testes negativos de permissao para documentos profissionais,
acesso a pedidos de outros usuarios e dados privados de cliente/profissional em
payloads embutidos; depois validar headers/cookies em runtime no fluxo
Next+Rails.

## Etapa concluida: hardening de proxy e uploads

Objetivo: continuar a implementacao de seguranca alinhando limites de upload,
reverse proxy e verificacoes de producao.

Foi feito:

- `ServiceRequestAttachment` ganhou `MAX_TOTAL_FILE_SIZE = 20.megabytes`.
- `Api::V1::ServiceRequestsController#create` agora rejeita pedidos com anexos
  acima de 20 MB no total antes de persistir dados/anexos.
- `test/integration/api_v1_contract_test.rb` ganhou regressao para anexos
  individualmente validos, mas acima do limite agregado.
- `docs/deploy/nginx-profissionais.example.conf` ganhou headers defensivos no
  proxy (`Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Permissions-Policy`), `proxy_cookie_flags` para cookies seguros,
  `client_body_timeout`, `client_header_timeout` e `X-Forwarded-Port`.
- Exemplo Nginx foi atualizado para sintaxe moderna `http2 on;`.
- `docs/deploy/staging_production_profissionais.md` passou a documentar o
  alinhamento do `client_max_body_size 20m` com o limite agregado do Rails.

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop app/controllers/api/v1/service_requests_controller.rb app/models/service_request_attachment.rb test/integration/api_v1_contract_test.rb config/initializers/content_security_policy.rb config/initializers/devise.rb config/initializers/filter_parameter_logging.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker run --rm -v "$PWD/docs/deploy/nginx-profissionais.example.conf:/etc/nginx/conf.d/default.conf:ro" -v "$PWD/tmp/nginx-test/live/profiangola.ao:/etc/letsencrypt/live/profiangola.ao:ro" nginx:alpine nginx -t
```

Resultados:

- Contrato API focado: `15 runs, 76 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `54 runs, 236 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.
- `nginx -t` com certificado dummy local: sintaxe OK, sem warning de `http2`.

Proximo passo recomendado:

Avancar na auditoria de permissao por perfil e runtime: testes negativos de
cliente/profissional/operacao para documentos, pagamentos e dados privados;
validar headers reais via navegador/HTTP em ambiente Next+Rails; e revisar
trusted proxy/origem em staging real.

## Etapa concluida: hardening de seguranca inicial

Objetivo: iniciar a implementacao de seguranca do projeto Profissionais com
controles verificaveis no Rails e no Next.

Foi feito:

- Ativada Content Security Policy Rails em `config/initializers/content_security_policy.rb`.
- API passou a responder `404` com mensagem generica para nao expor detalhes de
  lookup interno.
- Criado teste `test/integration/security_hardening_test.rb` cobrindo CSP e
  resposta `404` generica.
- Login do Next passou a ter rate limit proprio por IP, usando
  `RATE_LIMIT_AUTH_PER_MINUTE`.
- Extração de IP no rate limit do Next passou a usar o ultimo IP de
  `x-forwarded-for`, reduzindo bypass por header spoofado quando ha reverse proxy.
- Devise aumentou senha minima para 8 caracteres.
- Filtros de log passaram a cobrir `authorization`, `cookie` e `session`.

Verificacao executada:

```bash
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm audit --omit=dev --audit-level=moderate
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run lint
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run typecheck
wsl -d Ubuntu --cd /home/alexandre/profissionais/frontend -- npm run build
wsl -d Ubuntu --cd /home/alexandre/profissionais -- ./scripts/test_rails_compose.sh
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec rubocop app/controllers/api/v1/base_controller.rb config/initializers/content_security_policy.rb config/initializers/devise.rb config/initializers/filter_parameter_logging.rb test/integration/security_hardening_test.rb
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec brakeman --no-pager --format plain
wsl -d Ubuntu --cd /home/alexandre/profissionais -- docker exec profissionais-security bundle exec bundler-audit check --no-update
```

Resultados:

- `npm audit --omit=dev`: 0 vulnerabilidades.
- Teste focado de seguranca: `2 runs, 10 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `53 runs, 231 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint, typecheck e build: passaram.
- RuboCop focado: sem offenses.
- Brakeman: 0 security warnings.
- Bundler Audit: nenhuma vulnerabilidade encontrada.

Proximo passo recomendado:

Continuar a seguranca com: testes/controles para headers do Next em runtime,
politica de origem/host para reverse proxy, revisao de cookies `SameSite/Secure`
em staging real, limites de tamanho no Nginx alinhados aos uploads e auditoria de
fluxos de permissao por perfil.

## Ultima etapa concluida: hardening de producao Profissionais

Objetivo: alinhar a camada de producao ao projeto independente de profissionais
liberais, removendo defaults operacionais herdados do ecossistema de lojas.

Foi feito:

- Compose de producao passou a usar defaults `profiangola.ao`,
  `profissionais_production`, usuario `profissionais`, cookie
  `_profiangola_session` e hosts `admin/operacoes/app.profiangola.ao`.
- `PROFISSIONAIS_ROOT_DOMAIN` passou a ser a variavel primaria de dominio Rails,
  com `CONEXAO_ROOT_DOMAIN` mantida como compatibilidade legada.
- Criados scripts canonicos:
  - `scripts/smoke_profissionais_deploy.sh`
  - `scripts/preflight_profissionais_staging.sh`
  - `scripts/backup_profissionais_postgres.sh`
  - `scripts/restore_profissionais_postgres.sh`
  - `scripts/test_backup_restore_profissionais.sh`
  - `scripts/rollback_profissionais_plan.sh`
- Scripts antigos `*_conexao_*` foram preservados como wrappers para evitar
  quebra de automacoes existentes.
- Documentacao de deploy atualizada para Profissionais:
  - `docs/deploy/staging_production_profissionais.md`
  - `docs/deploy/production_readiness_profissionais.md`
  - `docs/deploy/env.production.example`
  - `docs/deploy/nginx-profissionais.example.conf`
- `frontend/next.config.ts` deixou de listar hosts de Conexao/PracaAngola como
  defaults de assets.

Proximo passo recomendado:

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais && chmod +x scripts/*.sh && bash -n scripts/*.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais && POSTGRES_PASSWORD=dummy RAILS_MASTER_KEY=dummy SECRET_KEY_BASE=dummy docker compose -f compose.production.example.yaml config >/tmp/profissionais-compose-production.yaml'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais && ./scripts/test_rails_compose.sh test/lib/conexao_domains_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais && ./scripts/test_rails_compose.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais && docker exec profissionais-rubocop bundle exec rubocop config/conexao_domains.rb config/initializers/session_store.rb test/lib/conexao_domains_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais/frontend && npm run generate:api'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/profissionais/frontend && npm run build'
```

Resultados:

- Scripts shell: sintaxe OK e permissao executavel.
- Compose de producao renderizou com secrets dummy e defaults `profiangola.ao`.
- Teste focado de dominios: `6 runs, 22 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `51 runs, 221 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: sem offenses.
- Frontend `generate:api`, lint, typecheck e build: passaram.
- Busca final nao encontrou `conexao.com`, `PracaAngola`, `/api/v1/stores`,
  `_conexao_session` ou docs antigas fora do historico `docs/AGENT_MEMORY.md`.

Proximo passo recomendado:

Aplicar o runbook em servidor real com DNS/SSL/secrets de `profiangola.ao`,
rodar `scripts/preflight_profissionais_staging.sh`, backup/restore e smoke real.

## Escopo ativo apos separacao

Este diretorio agora representa apenas o projeto independente de profissionais liberais.
Nao tratar novas decisoes como ecossistema. Marketplace de lojas/produtos foi separado para
`/home/alexandre/marketplace`; este produto deve focar clientes, profissionais, pedidos de
servico, matching, pagamentos e operacao profissional.

## Limpeza inicial apos separacao

O projeto Profissionais removeu da superficie ativa as rotas Rails, redirects, telas Next,
clientes frontend e documentos de loja/marketplace. O escopo ativo agora e servicos,
profissionais, pedidos, matching, cliente, painel profissional e operacao de servicos.

## Limpeza profunda de backend/schema

Executada a segunda etapa de separacao: models, controllers API, policies, serializers,
services, queries, migrations, seeds, schema Rails, testes e contrato OpenAPI herdados de
lojas/produtos foram removidos deste projeto. `frontend/src/lib/api/schema.ts` foi
regenerado a partir do OpenAPI ja filtrado para profissionais.

Verificacao executada:

- `npm run generate:api`
- `npm run typecheck`
- `npm run lint`
- Sintaxe Ruby de `{app,config,db,test}/**/*.rb` via `ruby:3.3-bookworm`

Smoke Rails resolvido apos rebuild da imagem propria do projeto:

- Criado `scripts/test_rails_compose.sh` para automatizar o fluxo de teste Rails no compose.
- O script faz rebuild da imagem `web`, sobe o Postgres, carrega o schema no banco `test`,
  roda `bin/rails test` e limpa os containers do projeto ao final.

Verificacao executada com `scripts/test_rails_compose.sh`.
Resultado: `20 runs, 75 assertions, 0 failures, 0 errors, 0 skips`.
Nota operacional: para testes limpos no compose, carregar schema no banco `test`; `db:prepare`
em banco recem-criado pode carregar seeds de desenvolvimento e conflitar com fixtures.

Arquivo canonico de continuidade do projeto. Foi criado porque o usuario pediu para ler
`docs/AGENT_MEMORY.md`, mas o arquivo ainda nao existia. O backlog existente antes dele e
`docs/proximos_passos.md`.

## Ultima etapa concluida: M11 tooling de staging real, observabilidade e rollback

Objetivo: executar ou deixar executavel o staging real do ecossistema Conexao com observabilidade, backup/restore testado, smoke contra dominios reais e plano de rollback.

Estado externo verificado em 2026-05-25:

- `conexao.com` resolve para `186.202.153.19`, mas HTTPS retorna reset de conexao.
- `pracaangola.conexao.com`, `profiangola.conexao.com`, `admin.conexao.com` e `app.conexao.com` nao resolvem em DNS.
- Como nao havia servidor/IP/secrets reais disponiveis, o deploy real nao pode ser finalizado daqui; o projeto foi preparado para executar e validar assim que a infraestrutura existir.

Foi feito:

- Criado endpoint publico `GET /api/v1/health`, com check de banco e envelope JSON.
- Adicionado contrato OpenAPI para `/api/v1/health` e regenerado `frontend/src/lib/api/schema.ts`.
- `scripts/smoke_conexao_deploy.sh` agora valida `/api/v1/health`.
- `compose.production.example.yaml` ganhou healthchecks de Rails/Next e rotacao de logs Docker.
- `docs/deploy/nginx-conexao.example.conf` ganhou `access_log`, `error_log` e tempos de upstream.
- Criado `scripts/preflight_conexao_staging.sh` para validar DNS, TLS, cookie compartilhado e smoke.
- Criado `scripts/backup_conexao_postgres.sh`.
- Criado `scripts/restore_conexao_postgres.sh`.
- Criado `scripts/test_backup_restore_conexao.sh`.
- Criado `scripts/rollback_conexao_plan.sh`.
- Criado runbook `docs/deploy/m11_staging_observability_rollback.md`.
- `docs/implementacao_sub_marketplace_lojas.md` foi atualizado marcando M11 tooling como concluido e abrindo M11B.

Arquivos principais:

- `app/controllers/api/v1/health_controller.rb`
- `config/routes.rb`
- `test/integration/api_v1_contract_test.rb`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/schema.ts`
- `compose.production.example.yaml`
- `docs/deploy/env.production.example`
- `docs/deploy/nginx-conexao.example.conf`
- `docs/deploy/staging_production_conexao.md`
- `docs/deploy/m11_staging_observability_rollback.md`
- `scripts/smoke_conexao_deploy.sh`
- `scripts/preflight_conexao_staging.sh`
- `scripts/backup_conexao_postgres.sh`
- `scripts/restore_conexao_postgres.sh`
- `scripts/test_backup_restore_conexao.sh`
- `scripts/rollback_conexao_plan.sh`
- `README.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && bash -n scripts/preflight_conexao_staging.sh scripts/backup_conexao_postgres.sh scripts/restore_conexao_postgres.sh scripts/test_backup_restore_conexao.sh scripts/rollback_conexao_plan.sh scripts/smoke_conexao_deploy.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && POSTGRES_PASSWORD=dummy RAILS_MASTER_KEY=dummy SECRET_KEY_BASE=dummy docker compose -f compose.production.example.yaml config >/tmp/conexao-compose-production-m11.yaml'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/api_v1_contract_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run generate:api'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && CONEXAO_COMPOSE_FILE=compose.yaml CONEXAO_BACKUP_DATABASE=conectaangola_development CONEXAO_BACKUP_DIR=tmp/backups CONEXAO_BACKUP_RETENTION_DAYS=1 ./scripts/backup_conexao_postgres.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && CONEXAO_COMPOSE_FILE=compose.yaml CONEXAO_RESTORE_CONFIRM=restore CONEXAO_RESTORE_DATABASE=conexao_restore_validation ./scripts/restore_conexao_postgres.sh tmp/backups/conexao-20260525T192351Z.sql.gz'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && CONEXAO_COMPOSE_FILE=compose.yaml CONEXAO_BACKUP_DATABASE=conectaangola_development CONEXAO_BACKUP_DIR=tmp/backups CONEXAO_BACKUP_RETENTION_DAYS=1 CONEXAO_RESTORE_CONFIRM=restore CONEXAO_RESTORE_DATABASE=conexao_restore_validation ./scripts/test_backup_restore_conexao.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && CONEXAO_SMOKE_SCHEME=http CONEXAO_SMOKE_PORT=3011 CONEXAO_SMOKE_TARGET_IP=127.0.0.1 CONEXAO_SMOKE_API_BASE_URL=http://127.0.0.1:3000 ./scripts/smoke_conexao_deploy.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && ./scripts/preflight_conexao_staging.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rubocop app/controllers/api/v1/health_controller.rb config/routes.rb test/integration/api_v1_contract_test.rb config/conexao_domains.rb config/environments/production.rb config/initializers/session_store.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
```

Resultados:

- API contract: `7 runs, 31 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `78 runs, 331 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: sem offenses.
- Frontend lint/typecheck/build: passaram.
- Compose de producao renderizou corretamente com secrets dummy.
- OpenAPI/schema regenerado com sucesso.
- Backup e restore foram testados contra Postgres local, restaurando em `conexao_restore_validation`.
- Smoke local passou para `conexao.com`, `pracaangola.conexao.com`, `profiangola.conexao.com`, `admin.conexao.com`, `app.conexao.com`, `/up`, `/api/v1/health` e `/api/v1/stores`.
- Preflight real falhou corretamente no bloqueio externo atual: `pracaangola.conexao.com nao resolve em DNS`.

Estado atual:

- O projeto esta pronto para executar staging real assim que houver IP/servidor, DNS e secrets reais.
- A execucao real dos dominios ainda esta bloqueada por DNS/infra externa.
- Para aplicar no servidor, usar `docs/deploy/m11_staging_observability_rollback.md`.

## Proximo passo recomendado

Implementar M11B: execucao no servidor real com DNS/SSL/secrets. O corte recomendado e provisionar o servidor/provedor, apontar os hosts reais, criar `.env.production` com secrets fora do repositorio, subir Compose/Nginx/SSL, rodar preflight, backup/restore e smoke contra os dominios reais.

AVISO: O proximo passo e criar/implementar M11B do ecossistema Conexao: executar no servidor real com DNS, SSL e secrets reais para `conexao.com`, `pracaangola.conexao.com`, `profiangola.conexao.com`, `admin.conexao.com` e `app.conexao.com`, rodando preflight, backup/restore, smoke e rollback operacional. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Confirmar servidor/provedor, IP publico e acesso SSH.
- Apontar DNS real dos cinco hosts para o IP de staging.
- Criar `.env.production` com secrets reais no servidor, fora do repositorio.
- Subir Compose, Nginx e SSL.
- Executar `scripts/preflight_conexao_staging.sh`.
- Executar backup/restore e smoke real.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/m11_staging_observability_rollback.md`
- `docs/deploy/env.production.example`
- `docs/deploy/nginx-conexao.example.conf`
- `compose.production.example.yaml`
- `scripts/preflight_conexao_staging.sh`
- `scripts/backup_conexao_postgres.sh`
- `scripts/restore_conexao_postgres.sh`
- `scripts/smoke_conexao_deploy.sh`
- `scripts/rollback_conexao_plan.sh`

## Etapa concluida anterior: M10 staging/producao e dominios reais

Objetivo: preparar o ecossistema Conexao para staging/producao com dominios reais, SSL, reverse proxy, cookies compartilhados entre subdominios, variaveis de ambiente, seeds de demonstracao, backups/logs e smoke de deploy.

Foi feito:

- Criada configuracao central de dominios Rails em `config/conexao_domains.rb`.
- `config/environments/production.rb` agora usa:
  - hosts reais do ecossistema e hosts internos (`rails`, `localhost`, `127.0.0.1`);
  - `RAILS_FORCE_SSL` e `RAILS_ASSUME_SSL`;
  - `RAILS_MAILER_HOST`/`RAILS_MAILER_PROTOCOL`;
  - `RAILS_ASSET_HOST` opcional;
  - `ACTIVE_STORAGE_SERVICE` configuravel por ambiente.
- Criado `config/initializers/session_store.rb` para cookie compartilhado `_conexao_session`, com dominio `.conexao.com`, `Secure` e `SameSite=Lax` em producao.
- `config/database.yml` de producao passou a aceitar `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD` e nomes separados de cache/queue/cable.
- `frontend/next.config.ts` passou a aceitar hosts Rails de assets por `NEXT_PUBLIC_RAILS_ASSET_HOSTS`, mantendo defaults locais e de `conexao.com`.
- Criados artefatos de deploy:
  - `frontend/Dockerfile`
  - `frontend/.dockerignore`
  - `compose.production.example.yaml`
  - `docs/deploy/env.production.example`
  - `docs/deploy/nginx-conexao.example.conf`
  - `docs/deploy/staging_production_conexao.md`
  - `scripts/smoke_conexao_deploy.sh`
- `README.md` aponta para o guia de staging/producao.
- `docs/implementacao_sub_marketplace_lojas.md` foi atualizado marcando M10 como concluido e abrindo M11.

Arquivos principais:

- `config/conexao_domains.rb`
- `config/environments/production.rb`
- `config/initializers/session_store.rb`
- `config/database.yml`
- `frontend/next.config.ts`
- `frontend/.env.example`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `compose.production.example.yaml`
- `docs/deploy/staging_production_conexao.md`
- `docs/deploy/env.production.example`
- `docs/deploy/nginx-conexao.example.conf`
- `scripts/smoke_conexao_deploy.sh`
- `test/lib/conexao_domains_test.rb`
- `README.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/lib/conexao_domains_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && POSTGRES_PASSWORD=dummy RAILS_MASTER_KEY=dummy SECRET_KEY_BASE=dummy docker compose -f compose.production.example.yaml config >/tmp/conexao-compose-production.yaml'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && bash -n scripts/smoke_conexao_deploy.sh'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rubocop config/conexao_domains.rb config/environments/production.rb config/initializers/session_store.rb test/lib/conexao_domains_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && docker compose run --rm web ruby -rerb -e 'puts ERB.new(File.read(%q{config/database.yml})).result' > /tmp/conexao-database-rendered.yml"
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && CONEXAO_SMOKE_SCHEME=http CONEXAO_SMOKE_PORT=3011 CONEXAO_SMOKE_TARGET_IP=127.0.0.1 CONEXAO_SMOKE_API_BASE_URL=http://127.0.0.1:3000 ./scripts/smoke_conexao_deploy.sh'
```

Resultados:

- Teste de dominios: `5 runs, 18 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `77 runs, 327 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: sem offenses.
- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou.
- Compose de producao renderizou corretamente com secrets dummy.
- ERB de `config/database.yml` renderizou corretamente.
- Smoke local passou usando hosts reais resolvidos para `127.0.0.1`:
  - `conexao.com/`
  - `pracaangola.conexao.com/lojas`
  - `profiangola.conexao.com/servicos`
  - `admin.conexao.com/operacoes`
  - `app.conexao.com/conta`
  - `http://127.0.0.1:3000/up`
  - `http://127.0.0.1:3000/api/v1/stores`

Estado atual:

- A preparacao de staging/producao esta documentada e codificada, mas DNS/SSL/secrets reais ainda dependem do servidor/provedor escolhido.
- A arquitetura assumida para producao e: navegador -> Next no host da vertical; Next -> Rails por rede interna; reverse proxy envia `/api/`, `/assets/`, `/rails/active_storage/` e `/up` para Rails.
- CORS nao foi adicionado porque o fluxo atual evita chamada browser -> Rails cross-origin; a seguranca de origem fica em host authorization, cookie compartilhado e reverse proxy.
- O dev server Next atual segue em `http://localhost:3011`; Rails local segue em `http://127.0.0.1:3000`.

## Proximo passo recomendado

Implementar M11: staging real, observabilidade e rollback operacional. O corte recomendado e aplicar esta preparacao em um servidor/provedor real, configurar DNS e Certbot/SSL, preencher secrets reais, rodar seeds de staging, validar backup/restore, configurar logs/alertas/uptime e executar `scripts/smoke_conexao_deploy.sh` contra os dominios reais.

AVISO: O proximo passo e criar/implementar M11 do ecossistema Conexao: executar staging real e hardening operacional para `conexao.com`, `pracaangola.conexao.com`, `profiangola.conexao.com`, `admin.conexao.com` e `app.conexao.com`, incluindo DNS/SSL reais, secrets do ambiente, deploy com reverse proxy, monitoramento de uptime/logs, backup e restore testado, smoke contra os dominios reais e plano de rollback. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/deploy/staging_production_conexao.md`.
- Confirmar provedor/servidor, IP publico, gestor de secrets e estrategia de DNS.
- Aplicar `compose.production.example.yaml` ou adaptar para o orquestrador escolhido.
- Emitir SSL real e validar renovacao automatica.
- Rodar `db:prepare`, seeds de staging, smoke completo e teste de backup/restore.
- Definir rollback operacional e alertas minimos antes de go-live.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/deploy/staging_production_conexao.md`
- `docs/deploy/env.production.example`
- `docs/deploy/nginx-conexao.example.conf`
- `compose.production.example.yaml`
- `scripts/smoke_conexao_deploy.sh`
- `config/environments/production.rb`
- `config/conexao_domains.rb`
- `config/initializers/session_store.rb`

## Etapa concluida anterior: M9C QA final e polimento multi-vertical

Objetivo: fechar a vertical PracaAngola para demonstracao local dentro do ecossistema Conexao, validando navegacao por vertical, estados vazios, contratos, OpenAPI/schema, build e fluxo Rails principal.

Foi feito:

- `PublicHeader` e `PublicFooter` agora aceitam `verticalKey` explicito, preservando deteccao por `Host`, mas garantindo identidade correta tambem em rotas diretas/local:
  - `/lojas`, `/lojas/[slug]`, `/lojas/[slug]/produtos/[productSlug]`, `/lojas/[slug]/checkout`, `/lojas/pedido/[code]` e `/minha-loja` usam `praca_angola`.
  - `/servicos`, `/servicos/[slug]` e `/profissional/*` usam `profi_angola`.
  - `/operacoes/*` e `/profissionais` operacionais usam `operations`.
- Adicionados estados vazios nas tabelas operacionais de lojas, produtos, vendas e assinaturas.
- Adicionado estado vazio em planos operacionais quando ainda nao existe plano.
- Ajustado painel do vendedor sem loja para chamar onboarding/criacao de loja em vez de mandar o usuario para a vitrine publica.
- `docs/api/openapi.yaml` foi expandido com contratos essenciais da PracaAngola:
  - lojas publicas;
  - produtos publicos;
  - planos publicos;
  - criacao/acompanhamento de pedido;
  - endpoints principais do vendedor;
  - endpoints operacionais principais de lojas, produtos, pedidos, planos, assinaturas e faturas.
- `frontend/src/lib/api/schema.ts` foi regenerado com `npm run generate:api`.
- `docs/implementacao_sub_marketplace_lojas.md` foi atualizado marcando M9C como concluido e abrindo M10.
- Validadas capturas desktop/mobile da PracaAngola com Chrome headless.

Arquivos principais:

- `frontend/src/lib/ecosystem/server.ts`
- `frontend/src/components/layout/public-header.tsx`
- `frontend/src/components/layout/public-footer.tsx`
- `frontend/src/app/(public)/lojas/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/produtos/[productSlug]/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/checkout/page.tsx`
- `frontend/src/app/(public)/lojas/pedido/[code]/page.tsx`
- `frontend/src/app/(seller)/minha-loja/layout.tsx`
- `frontend/src/app/(seller)/minha-loja/page.tsx`
- `frontend/src/app/(public)/servicos/page.tsx`
- `frontend/src/app/(public)/servicos/[slug]/page.tsx`
- `frontend/src/app/(professional)/profissional`
- `frontend/src/app/(operations)/operacoes`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/schema.ts`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/storefront_api_contract_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run generate:api'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && curl -fsS http://127.0.0.1:3011/lojas | rg -o 'PracaAngola|ProfiAngola|Servicos|Minha loja|A praca digital' | sort | uniq -c"
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && curl -fsS http://127.0.0.1:3011/servicos | rg -o 'PracaAngola|ProfiAngola|Servicos|Area profissional|Profissionais liberais' | sort | uniq -c"
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && curl -fsS http://127.0.0.1:3011/operacoes | rg -o 'Conexao Ops|Operations Center|PracaAngola|ProfiAngola|Dashboard' | sort | uniq -c"
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && curl -fsS http://127.0.0.1:3011/minha-loja | rg -o 'PracaAngola|Acesso da loja|Minha loja|Criar loja|ProfiAngola|Servicos' | sort | uniq -c"
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && google-chrome --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=390,844 --screenshot=tmp/qa/pracaangola-mobile.png http://127.0.0.1:3011/lojas'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && google-chrome --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=1366,900 --screenshot=tmp/qa/pracaangola-desktop.png http://127.0.0.1:3011/lojas'
```

Resultados:

- Storefront contract: `18 runs, 122 assertions, 0 failures, 0 errors, 0 skips`.
- Suite Rails completa: `72 runs, 309 assertions, 0 failures, 0 errors, 0 skips`.
- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou.
- `npm run generate:api` regenerou `frontend/src/lib/api/schema.ts`.
- Smoke direto:
  - `/lojas` contem PracaAngola e nao contem `ProfiAngola`/`Servicos` na navegacao.
  - `/servicos` contem ProfiAngola e nao contem PracaAngola na navegacao.
  - `/operacoes` contem Conexao Ops.
  - `/minha-loja` contem PracaAngola.
- Visual QA:
  - Desktop PracaAngola aprovado sem overflow horizontal.
  - Mobile PracaAngola aprovado em 390x844.
  - Screenshots salvos em `tmp/qa/pracaangola-desktop.png` e `tmp/qa/pracaangola-mobile.png`.

Estado atual:

- A vertical PracaAngola esta pronta para demonstracao local como experiencia separada dentro do ecossistema Conexao.
- O backend continua compartilhado por decisao arquitetural: conta, autenticacao, policies, assinatura e operacao seguem em uma base comum.
- OpenAPI/schema ja cobre os contratos essenciais da PracaAngola, mas o frontend ainda usa tipos manuais em `frontend/src/lib/api/types.ts`; migrar para tipos derivados do schema pode ser um refinamento posterior.
- O dev server Next atual esta em `http://localhost:3011`.
- Ainda nao existe configuracao real de DNS/SSL/reverse proxy/cookies entre subdominios; isso entra em M10.

## Proximo passo recomendado

Implementar M10: preparacao de staging/producao e dominios do ecossistema Conexao, com configuracao de hosts reais (`conexao.com`, `pracaangola.conexao.com`, `profiangola.conexao.com`, `admin.conexao.com`, `app.conexao.com`), variaveis de ambiente, cookies/origens confiaveis, SSL, reverse proxy, seeds de demonstracao, backups/logs e smoke de deploy.

AVISO: O proximo passo e criar/implementar M10 do ecossistema Conexao: preparacao de staging/producao e dominios reais para `conexao.com`, `pracaangola.conexao.com`, `profiangola.conexao.com`, `admin.conexao.com` e `app.conexao.com`, incluindo variaveis de ambiente, cookies/origens confiaveis, SSL, reverse proxy, seeds de demonstracao, backups/logs e smoke de deploy. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md`, `README.md`, `frontend/next.config.ts`, `config/environments/production.rb`, `config/initializers/cors.rb` se existir e arquivos de deploy.
- Mapear variaveis de ambiente Rails/Next necessarias para API, assets, hostnames, cookies, CORS/CSRF e storage.
- Definir configuracao de dominio/subdominio e reverse proxy para frontend/backend.
- Preparar checklist de deploy/staging, smoke tests e rollback.
- Rodar suite Rails, lint, typecheck, build e smoke do staging.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `README.md`
- `frontend/next.config.ts`
- `frontend/src/lib/ecosystem/verticals.ts`
- `frontend/src/proxy.ts`
- `config/environments/production.rb`
- `config/initializers`
- `compose.yaml`
- `Dockerfile`
- `docs/api/openapi.yaml`

## Etapa concluida anterior: M9A/M9B ecossistema multi-vertical e dominio `conexao.com`

Objetivo: separar a vertical de lojas como PracaAngola dentro do ecossistema Conexao, sem misturar a experiencia de lojas com ProfiAngola/profissionais liberais e sem duplicar backend cedo demais.

Foi feito:

- Fechada a decisao de arquitetura:
  - `conexao.com` e o dominio principal do ecossistema.
  - `pracaangola.conexao.com` e a experiencia de lojas/produtos/checkout/vendedor.
  - `profiangola.conexao.com` e a experiencia de profissionais liberais/servicos.
  - `admin.conexao.com` e a operacao central.
  - `app.conexao.com` fica reservado para conta compartilhada.
- Criada configuracao central de verticais em `frontend/src/lib/ecosystem/verticals.ts`.
- Criado helper server-side `frontend/src/lib/ecosystem/server.ts` para detectar a vertical atual pelo `Host`.
- Criado `frontend/src/proxy.ts` usando a convencao atual do Next 16 para reescrever a raiz de hosts:
  - `pracaangola.conexao.com/` -> `/lojas`
  - `admin.conexao.com/` -> `/operacoes`
  - `app.conexao.com/` -> `/conta`
- `Brand`, `PublicHeader` e `PublicFooter` agora usam nome, sigla, tagline, resumo e navegacao da vertical atual.
- A navegacao do PracaAngola removeu servicos/profissionais para nao misturar verticais.
- A vitrine publica de lojas passou a se apresentar como PracaAngola dentro do ecossistema Conexao.
- Textos antigos de Conexao Market foram ajustados nos pontos publicos principais para Conexao/PracaAngola.
- `README.md`, `docs/plano_sub_marketplace_lojas.md`, `docs/implementacao_sub_marketplace_lojas.md`, `docs/api/openapi.yaml` e `docs/api/README.md` foram atualizados para a nova decisao de dominio/ecossistema.

Arquivos principais:

- `frontend/src/lib/ecosystem/verticals.ts`
- `frontend/src/lib/ecosystem/server.ts`
- `frontend/src/proxy.ts`
- `frontend/src/lib/navigation/items.ts`
- `frontend/src/components/layout/brand.tsx`
- `frontend/src/components/layout/public-header.tsx`
- `frontend/src/components/layout/public-footer.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/(public)/lojas/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/produtos/[productSlug]/page.tsx`
- `frontend/src/components/domain/stores/store-card.tsx`
- `frontend/src/app/(seller)/minha-loja/layout.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `README.md`
- `docs/plano_sub_marketplace_lojas.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/api/openapi.yaml`
- `docs/api/README.md`
- `docs/proximos_passos.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && curl -fsS -H 'Host: pracaangola.conexao.com' http://127.0.0.1:3011/ | rg -o 'PracaAngola|A praca digital|Servicos|ProfiAngola|Minha loja' | sort | uniq -c"
wsl -d Ubuntu -- bash -lc "cd /home/alexandre/conectangola && curl -fsS -H 'Host: admin.conexao.com' http://127.0.0.1:3011/ | rg -o 'Conexao Ops|Dashboard operacional|Lojas|Assinaturas' | sort | uniq -c"
```

Resultados:

- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou sem warning de `middleware`; o Next reconhece `Proxy (Middleware)`.
- Smoke com `Host: pracaangola.conexao.com` retornou conteudo da vitrine de lojas com `PracaAngola`, `A praca digital` e `Minha loja`, sem `Servicos`/`ProfiAngola`.
- Smoke com `Host: admin.conexao.com` retornou a area operacional com `Conexao Ops`, lojas e assinaturas.

Estado atual:

- PracaAngola ja tem identidade, navegacao e host raiz separados da vertical de profissionais.
- O backend segue compartilhado, o que e intencional nesta fase para manter conta, autenticacao, billing, policies e operacao em uma base comum.
- Nao houve alteracao Rails nesta etapa; por isso a suite Rails nao foi rerodada.
- Existe um dev server Next atual em `http://localhost:3011`.
- M9C ainda precisa fazer QA visual desktop/mobile e fluxo completo autenticado com navegador.

## Proximo passo recomendado

Implementar M9C: QA final e polimento multi-vertical do ecossistema Conexao/PracaAngola, com revisao visual desktop/mobile, verificacao de permissoes, navegacao por host, estados vazios, fluxo completo de loja/pedido/assinatura e decisao final sobre OpenAPI/schema gerado.

AVISO: O proximo passo e criar/implementar M9C do ecossistema Conexao/PracaAngola: QA final e polimento multi-vertical, incluindo revisao visual desktop/mobile, permissoes, navegacao por host, estados vazios, fluxo completo criar loja -> aprovar -> produto -> compra -> pedido -> assinatura/fatura e decisao sobre OpenAPI/schema gerado. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Validar visualmente `pracaangola.conexao.com`/`/lojas`, `/minha-loja`, `/operacoes` e rotas de checkout/pedido em desktop e mobile.
- Revisar que a navegacao do PracaAngola nao mostra ProfiAngola e que a navegacao do ProfiAngola nao empurra lojas.
- Testar permissoes de publico, vendedor, operador e admin.
- Rodar suite Rails, contratos storefront, lint, typecheck e build.
- Registrar limitacoes conhecidas e proximo corte pos-MVP.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `frontend/src/lib/ecosystem/verticals.ts`
- `frontend/src/proxy.ts`
- `frontend/src/components/layout/public-header.tsx`
- `frontend/src/app/(public)/lojas/page.tsx`
- `frontend/src/app/(seller)/minha-loja`
- `frontend/src/app/(operations)/operacoes`
- `test/integration/storefront_api_contract_test.rb`

## Etapa concluida anterior: M8 operacao/admin do sub-marketplace de lojas

Objetivo: dar ao dono da plataforma controle operacional sobre lojas, produtos, vendas, planos e assinaturas/faturas do sub-marketplace de lojas.

Foi feito:

- Criada base operacional `Api::V1::Operations::BaseController`, protegida por `DashboardPolicy#index?`.
- Criadas APIs operacionais para lojas:
  - `GET /api/v1/operations/stores`
  - `GET /api/v1/operations/stores/:id`
  - `POST /api/v1/operations/stores/:id/approve`
  - `POST /api/v1/operations/stores/:id/suspend`
  - `POST /api/v1/operations/stores/:id/reactivate`
- Criadas APIs operacionais para produtos:
  - `GET /api/v1/operations/products`
  - `GET /api/v1/operations/products/:id`
  - `POST /api/v1/operations/products/:id/approve`
  - `POST /api/v1/operations/products/:id/reject`
  - `POST /api/v1/operations/products/:id/pause`
- Criadas APIs operacionais para vendas:
  - `GET /api/v1/operations/store_orders`
  - `GET /api/v1/operations/store_orders/:id`
  - `PATCH /api/v1/operations/store_orders/:id/status`
- Criadas APIs operacionais para planos:
  - `GET /api/v1/operations/store_plans`
  - `POST /api/v1/operations/store_plans`
  - `PATCH /api/v1/operations/store_plans/:id`
- Criados serializers operacionais para lojas e produtos com `owner`, `metrics`, dados privados, produtos e pedidos recentes.
- `Stores::Approve` agora garante assinatura/fatura ao ativar uma loja que ainda nao tinha assinatura.
- Criado client frontend operacional `frontend/src/lib/api/operations-stores.ts`.
- Criadas actions compartilhadas em `frontend/src/app/(operations)/operacoes/actions.ts`.
- Criadas telas:
  - `/operacoes/lojas`
  - `/operacoes/lojas/[id]`
  - `/operacoes/produtos`
  - `/operacoes/vendas`
  - `/operacoes/planos`
- Dashboard `/operacoes` agora aponta para lojas, produtos, vendas, planos e assinaturas.
- Adicionados testes de contrato para listar/aprovar/suspender/reativar loja, moderar produto, listar/atualizar venda, criar/editar plano e negar acesso operacional para cliente.
- Atualizado `docs/implementacao_sub_marketplace_lojas.md` marcando M8 como concluido.

Arquivos principais:

- `config/routes.rb`
- `app/controllers/api/v1/operations/base_controller.rb`
- `app/controllers/api/v1/operations/stores_controller.rb`
- `app/controllers/api/v1/operations/products_controller.rb`
- `app/controllers/api/v1/operations/store_orders_controller.rb`
- `app/controllers/api/v1/operations/store_plans_controller.rb`
- `app/controllers/api/v1/operations/subscriptions_controller.rb`
- `app/controllers/api/v1/operations/subscription_invoices_controller.rb`
- `app/serializers/api/v1/operations/store_serializer.rb`
- `app/serializers/api/v1/operations/product_serializer.rb`
- `app/services/stores/approve.rb`
- `test/integration/storefront_api_contract_test.rb`
- `frontend/src/lib/api/operations-stores.ts`
- `frontend/src/lib/api/types.ts`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/operacoes/actions.ts`
- `frontend/src/app/(operations)/operacoes/lojas/page.tsx`
- `frontend/src/app/(operations)/operacoes/lojas/[id]/page.tsx`
- `frontend/src/app/(operations)/operacoes/produtos/page.tsx`
- `frontend/src/app/(operations)/operacoes/vendas/page.tsx`
- `frontend/src/app/(operations)/operacoes/planos/page.tsx`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/storefront_api_contract_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rubocop app/controllers/api/v1/operations app/serializers/api/v1/operations app/services/stores/approve.rb test/integration/storefront_api_contract_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
```

Resultados:

- Rails storefront API contract: `18 runs, 122 assertions, 0 failures, 0 errors, 0 skips`.
- Rails full test: `72 runs, 309 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `11 files inspected, no offenses detected`.
- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou; rotas `/operacoes/lojas`, `/operacoes/lojas/[id]`, `/operacoes/produtos`, `/operacoes/vendas` e `/operacoes/planos` aparecem dinamicas.

Validacao local:

- Rails esta ativo em `http://localhost:3000/up`.
- Next dev existente esta ativo em `http://localhost:3011`.
- `/operacoes/lojas` carregou no browser e exibiu corretamente o estado protegido de acesso operacional.
- A validacao autenticada da operacao ficou coberta pelos testes de contrato/API.

Estado atual:

- M8 esta concluido para controle operacional de lojas, moderacao de produtos, vendas, planos e integracao com assinaturas/faturas.
- Admin pode criar/editar planos; operador pode consultar a operacao, mas mudancas criticas de plano seguem restritas por policy.
- A aprovacao de loja cria assinatura/fatura quando a loja ainda nao tem assinatura.
- `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao foram atualizados para contratos de lojas; o frontend continua usando tipos manuais em `frontend/src/lib/api/types.ts`.

## Proximo passo recomendado

Implementar M9 do sub-marketplace de lojas: QA, documentacao e polimento final da vertical, com revisao visual desktop/mobile, permissao, navegacao, estados vazios, README/OpenAPI quando necessario e validacao do fluxo completo criar loja -> aprovar -> produto -> compra -> pedido -> assinatura/fatura.

AVISO: O proximo passo e criar/implementar M9 do sub-marketplace de lojas: QA, documentacao e polimento final da vertical de lojas, incluindo revisao visual desktop/mobile, permissoes, navegacao, estados vazios, README/OpenAPI se necessario e validacao do fluxo completo. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Validar visualmente rotas publicas, vendedor e operacao em desktop/mobile.
- Revisar permissoes de API operacional, vendedor e publico.
- Atualizar README e, se for escolhido, `docs/api/openapi.yaml` + `frontend/src/lib/api/schema.ts`.
- Rodar suite Rails, lint, typecheck, build e smoke test do fluxo completo.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `README.md`
- `docs/api/openapi.yaml`
- `frontend/src/lib/api/types.ts`
- `frontend/src/lib/api/operations-stores.ts`
- `frontend/src/app/(public)/lojas`
- `frontend/src/app/(seller)/minha-loja`
- `frontend/src/app/(operations)/operacoes`
- `test/integration/storefront_api_contract_test.rb`

## Etapa concluida anterior: M7 assinaturas e faturas operacionais

Objetivo: transformar assinatura de loja em operacao real de cobranca mensal, com faturas, pagamento manual pela operacao, renovacao de periodo, estado `past_due`, tolerancia e bloqueio de novos pedidos quando a assinatura nao permite venda.

Foi feito:

- Criada tabela `subscription_invoices` com valor, estado, periodo, vencimento, pagamento, metodo e referencia.
- Criado model `SubscriptionInvoice` com estados `pending`, `overdue`, `paid` e `void`.
- `StoreSubscription` agora tem `subscription_invoices`, `current_invoice` e `order_grace_ends_on`.
- `StoreSubscriptions::Start` passou a gerar a primeira fatura mensal do proximo ciclo.
- Criados services `SubscriptionInvoices::CreateMonthly`, `SubscriptionInvoices::MarkPaid`, `StoreSubscriptions::Renew` e `StoreSubscriptions::MarkPastDue`.
- Pagamento de fatura marca a invoice como `paid`, renova o periodo da assinatura e gera a proxima fatura mensal.
- Atraso operacional marca assinatura como `past_due`, marca faturas vencidas como `overdue` e identifica lojas ja bloqueadas apos a tolerancia.
- O bloqueio de novos pedidos continua centralizado em `StoreSubscription#allows_orders?`, consumido por `StoreOrderPolicy` e `StoreOrders::Create`.
- API do vendedor `GET/POST /api/v1/my/stores/:store_id/subscription` agora retorna `current_invoice` e `invoices`.
- Criada API operacional:
  - `GET /api/v1/operations/subscriptions`
  - `POST /api/v1/operations/subscriptions/mark_past_due`
  - `POST /api/v1/operations/subscription_invoices/:id/mark_paid`
- Criado serializer `Api::V1::SubscriptionInvoiceSerializer` e ampliado `StoreSubscriptionSerializer`.
- Criada policy `SubscriptionInvoicePolicy`, com marcacao de pagamento restrita a admin.
- Tela `/minha-loja/assinatura` agora mostra fatura aberta, vencimento, tolerancia e historico de faturas.
- Criada tela operacional `/operacoes/assinaturas` com metricas, lista de assinaturas, faturas abertas, atualizar atrasos e marcar fatura como paga.
- `db/seeds.rb` agora gera faturas mensais para lojas demo.
- Adicionados testes de service para geracao mensal, pagamento/renovacao, atraso/tolerancia e bloqueio de pedido.
- Contrato Rails de storefront agora cobre faturas da assinatura do vendedor e pagamento operacional por admin.
- Atualizado `docs/implementacao_sub_marketplace_lojas.md` marcando M7 como concluido.

Arquivos principais:

- `db/migrate/20260525024500_create_subscription_invoices.rb`
- `db/schema.rb`
- `db/seeds.rb`
- `app/models/subscription_invoice.rb`
- `app/models/store_subscription.rb`
- `app/policies/subscription_invoice_policy.rb`
- `app/services/store_subscriptions/start.rb`
- `app/services/store_subscriptions/renew.rb`
- `app/services/store_subscriptions/mark_past_due.rb`
- `app/services/subscription_invoices/create_monthly.rb`
- `app/services/subscription_invoices/mark_paid.rb`
- `app/controllers/api/v1/my/store_subscriptions_controller.rb`
- `app/controllers/api/v1/operations/subscriptions_controller.rb`
- `app/controllers/api/v1/operations/subscription_invoices_controller.rb`
- `app/serializers/api/v1/subscription_invoice_serializer.rb`
- `app/serializers/api/v1/store_subscription_serializer.rb`
- `config/routes.rb`
- `test/services/subscription_invoices/create_monthly_test.rb`
- `test/services/subscription_invoices/mark_paid_test.rb`
- `test/services/store_subscriptions/mark_past_due_test.rb`
- `test/services/store_orders/create_test.rb`
- `test/integration/storefront_api_contract_test.rb`
- `frontend/src/lib/api/stores.ts`
- `frontend/src/lib/api/types.ts`
- `frontend/src/lib/formatters/date.ts`
- `frontend/src/lib/stores/presentation.ts`
- `frontend/src/app/(seller)/minha-loja/assinatura/page.tsx`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/operacoes/assinaturas/page.tsx`
- `frontend/src/app/(operations)/operacoes/assinaturas/actions.ts`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails db:migrate'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/services/subscription_invoices/create_monthly_test.rb test/services/subscription_invoices/mark_paid_test.rb test/services/store_subscriptions/mark_past_due_test.rb test/services/store_orders/create_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/storefront_api_contract_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rubocop app/models/subscription_invoice.rb app/models/store_subscription.rb app/services/store_subscriptions app/services/subscription_invoices app/controllers/api/v1/operations app/controllers/api/v1/my/store_subscriptions_controller.rb app/serializers/api/v1/subscription_invoice_serializer.rb app/serializers/api/v1/store_subscription_serializer.rb app/policies/subscription_invoice_policy.rb test/services/subscription_invoices test/services/store_subscriptions test/services/store_orders/create_test.rb test/integration/storefront_api_contract_test.rb db/migrate/20260525024500_create_subscription_invoices.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
```

Resultados:

- Rails M7 services/pedido: `9 runs, 42 assertions, 0 failures, 0 errors, 0 skips`.
- Rails storefront API contract: `13 runs, 82 assertions, 0 failures, 0 errors, 0 skips`.
- Rails full test: `67 runs, 269 assertions, 0 failures, 0 errors, 0 skips`.
- RuboCop focado: `19 files inspected, no offenses detected`.
- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou; rota `/operacoes/assinaturas` aparece dinamica.

Validacao local:

- Rails esta ativo em `http://localhost:3000/up`.
- Next dev existente esta ativo em `http://localhost:3011`.
- `/operacoes/assinaturas` carregou no browser e exibiu o estado protegido de acesso operacional.
- A validacao autenticada da tela operacional ficou coberta por testes de contrato/API; o browser do ambiente nao conseguiu digitar no login por limitacao de clipboard.
- No banco local de desenvolvimento, faturas demo foram geradas para assinaturas existentes com `StoreSubscription.find_each { ... SubscriptionInvoices::CreateMonthly ... }` sem reseedar a base.

Estado atual:

- M7 esta concluido para assinatura mensal, faturas, pagamento manual, renovacao, atraso, tolerancia e bloqueio de pedidos.
- A geracao de faturas usa a assinatura atual para criar a fatura do proximo ciclo mensal.
- O pagamento renova a assinatura para o periodo da fatura; se a fatura for paga muito tarde, renova a partir da data do pagamento.
- `StoreSubscriptions::MarkPastDue` ainda e executado manualmente pela operacao/API; agendamento automatico pode entrar em M8/M9.
- `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao foram atualizados para contratos de lojas; o frontend continua usando tipos manuais em `frontend/src/lib/api/types.ts`.

## Proximo passo recomendado

Implementar M8 do sub-marketplace de lojas: operacao/admin para controle da plataforma, com listagem/detalhe de lojas, aprovacao/suspensao, moderacao de produtos, vendas por loja, planos e assinaturas/faturas.

AVISO: O proximo passo e criar/implementar M8 do sub-marketplace de lojas: operacao/admin para controle da plataforma, com listagem/detalhe de lojas, aprovacao/suspensao, moderacao de produtos, vendas por loja, planos e assinaturas/faturas. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir `StorePolicy`, services `Stores::Approve`/`Stores::Suspend`, controllers existentes de loja/produto/pedido e a tela `/operacoes`.
- Criar APIs operacionais para lojas, produtos, pedidos, planos e consolidar assinaturas/faturas.
- Criar telas `/operacoes/lojas`, `/operacoes/lojas/[id]`, `/operacoes/vendas` e `/operacoes/planos`.
- Ligar acoes de aprovar/suspender loja, moderar produto e acompanhar vendas por loja.
- Validar com testes de contrato, policies, lint, typecheck e build.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `app/models/store.rb`
- `app/models/product.rb`
- `app/models/store_order.rb`
- `app/models/store_plan.rb`
- `app/models/store_subscription.rb`
- `app/models/subscription_invoice.rb`
- `app/policies/store_policy.rb`
- `app/policies/product_policy.rb`
- `app/policies/store_order_policy.rb`
- `app/policies/store_plan_policy.rb`
- `app/policies/subscription_invoice_policy.rb`
- `app/services/stores/approve.rb`
- `app/services/stores/suspend.rb`
- `app/controllers/api/v1/operations/subscriptions_controller.rb`
- `frontend/src/app/(operations)/operacoes/page.tsx`
- `frontend/src/app/(operations)/operacoes/assinaturas/page.tsx`
- `test/integration/storefront_api_contract_test.rb`

## Etapa concluida anterior: M6 checkout e pedidos de produtos

Objetivo: permitir venda real de produtos no sub-marketplace, com carrinho por loja, checkout publico, criacao de `StoreOrder`, reducao consistente de estoque, acompanhamento por codigo e confirmacao no painel do vendedor.

Foi feito:

- Criado carrinho por loja no frontend usando `localStorage` por slug (`conectangola.store_cart.<slug>`).
- Criado painel de compra na pagina de produto com opcao/variante, quantidade, adicionar ao carrinho e comprar agora.
- Criada rota publica `/lojas/[slug]/checkout` com itens do carrinho, dados do cliente, entrega, observacoes e resumo do pedido.
- Criada action de checkout que envia `store_order`, `customer` e `items` para `POST /api/v1/store_orders`.
- Criada rota publica `/lojas/pedido/[code]` para acompanhar pedido por codigo.
- A tela de acompanhamento limpa o carrinho da loja apos a criacao do pedido.
- Exposto `GET /api/v1/store_orders/:code` no Rails para tracking publico por codigo.
- Ajustada policy de `StoreOrder` com permissao publica de acompanhamento para loja ativa.
- Serializador de `StoreOrder` agora inclui nome/opcoes da variante em itens detalhados.
- Confirmado que `StoreOrders::Create` reduz estoque do produto ou da variante via `Products::AdjustStock`.
- Pedido criado no checkout aparece em `/minha-loja/pedidos` e pode ser aberto pelo vendedor.
- Rotas Rails de redirect frontend foram adicionadas para `/lojas/:slug/checkout` e `/lojas/pedido/:code`.
- Atualizado `docs/implementacao_sub_marketplace_lojas.md` marcando M6 como concluido.

Arquivos principais:

- `config/routes.rb`
- `app/controllers/api/v1/store_orders_controller.rb`
- `app/policies/store_order_policy.rb`
- `app/serializers/api/v1/store_order_serializer.rb`
- `app/services/store_orders/create.rb`
- `test/integration/storefront_api_contract_test.rb`
- `frontend/src/lib/stores/cart.ts`
- `frontend/src/lib/api/stores.ts`
- `frontend/src/lib/api/types.ts`
- `frontend/src/components/domain/stores/add-to-cart-panel.tsx`
- `frontend/src/components/domain/stores/checkout-form.tsx`
- `frontend/src/components/domain/stores/clear-store-cart.tsx`
- `frontend/src/components/domain/stores/store-cart-link.tsx`
- `frontend/src/app/(public)/lojas/[slug]/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/produtos/[productSlug]/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/checkout/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/checkout/actions.ts`
- `frontend/src/app/(public)/lojas/pedido/[code]/page.tsx`
- `frontend/src/app/(seller)/minha-loja/pedidos/page.tsx`
- `frontend/src/app/(seller)/minha-loja/pedidos/[id]/page.tsx`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/storefront_api_contract_test.rb'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
```

Validacao visual:

- Dev server Next validado em `http://localhost:3011`.
- Fluxo confirmado no browser: produto `Organizador plastico modular` -> carrinho -> `/lojas/casa-ana-utilidades/checkout` -> pedido publico `LOJA-260525-4D25A5` -> `/lojas/pedido/LOJA-260525-4D25A5`.
- Estoque do produto caiu de `24 em stock` para `23 em stock`.
- Carrinho da loja foi limpo ao abrir a pagina do pedido.
- Login com `ana.manuel@example.com` / `Conecta123!` confirmou o pedido em `/minha-loja/pedidos`.
- Screenshots salvos em `tmp/screenshots/m6-product-stock.png`, `tmp/screenshots/m6-order-tracking.png` e `tmp/screenshots/m6-seller-orders.png`.

Resultado:

- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou; rotas `/lojas/[slug]/checkout` e `/lojas/pedido/[code]` aparecem dinamicas.
- Rails storefront API contract: `10 runs, 64 assertions, 0 failures, 0 errors, 0 skips`.
- Rails full test: `58 runs, 218 assertions, 0 failures, 0 errors, 0 skips`.

Estado atual:

- M6 esta concluido para carrinho, checkout, criacao de pedido, tracking publico e confirmacao no painel do vendedor.
- Pedido de produto reduz estoque imediatamente no momento da criacao.
- Produto sem estoque e compra acima do estoque sao rejeitados pelo backend.
- Compra de variante reduz estoque da variante e mostra dados da variante nos detalhes do pedido.
- Pagamento do pedido ainda e manual/registrado pelo vendedor; automacao de faturas/assinaturas fica para M7.
- `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao foram atualizados para contratos de lojas; o frontend continua usando tipos manuais em `frontend/src/lib/api/types.ts`.

## Proximo passo registrado antes do M7

Implementar M7 do sub-marketplace de lojas: assinaturas e faturas operacionais, com geracao/renovacao de invoices, marcacao de pagamento, periodo renovado, estado `past_due`, tolerancia e bloqueio de novos pedidos quando a assinatura nao permitir venda.

AVISO: O proximo passo e criar/implementar M7 do sub-marketplace de lojas: assinaturas e faturas operacionais, com geracao e renovacao de faturas mensais, marcacao de pagamento, renovacao de periodo, estado `past_due`, tolerancia e bloqueio de novos pedidos quando a assinatura nao permitir venda. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir `app/models/store_subscription.rb`, `app/models/subscription_invoice.rb`, `app/services/store_subscriptions/start.rb` e `app/controllers/api/v1/my/store_subscriptions_controller.rb`.
- Criar services de geracao/renovacao/marcacao de atraso e pagamento de faturas.
- Ligar bloqueio/tolerancia de pedidos ao estado real da assinatura.
- Criar tela operacional para acompanhar assinaturas/faturas.
- Validar com testes de services, contrato Rails, lint, typecheck e build.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `app/models/store_subscription.rb`
- `app/models/subscription_invoice.rb`
- `app/services/store_subscriptions/start.rb`
- `app/services/store_subscriptions/renew.rb`
- `app/services/store_subscriptions/mark_past_due.rb`
- `app/services/subscription_invoices/create_monthly.rb`
- `app/services/subscription_invoices/mark_paid.rb`
- `app/controllers/api/v1/my/store_subscriptions_controller.rb`
- `app/controllers/api/v1/store_orders_controller.rb`
- `frontend/src/app/(seller)/minha-loja/assinatura/page.tsx`
- `test/integration/storefront_api_contract_test.rb`

## Ultima etapa concluida: M5 painel do vendedor Next.js

Objetivo: entregar o painel do vendedor em `/minha-loja`, permitindo onboarding/configuracao da loja, gestao de produtos, publicacao/pausa, ajuste de estoque e consulta/contratacao de assinatura consumindo os endpoints Rails autenticados.

Foi feito:

- Criado o shell de operacao da loja em `/minha-loja`, com navegacao para painel, configuracao, produtos, estoque, pedidos e plano.
- Criado dashboard do vendedor com metricas de produtos, estoque, pedidos, plano, catalogo recente, ajuste rapido de estoque e links de acao.
- Criadas telas de onboarding/configuracao/assinatura em `/minha-loja/onboarding`, `/minha-loja/configuracao` e `/minha-loja/assinatura`.
- Criadas telas de produtos em `/minha-loja/produtos`, `/minha-loja/produtos/novo` e `/minha-loja/produtos/[id]`.
- Criada tela de estoque em `/minha-loja/estoque`, com ajuste para produto principal ou variante.
- Criadas telas base de pedidos do vendedor em `/minha-loja/pedidos` e `/minha-loja/pedidos/[id]`, prontas para receber o fluxo publico de checkout do M6.
- Expandido `ProductForm` para categoria, estado, preco, promocao, estoque, alerta, destaque e variantes.
- Ajustadas actions do vendedor para criar/editar loja, submeter loja, criar/editar/publicar/pausar produto, ajustar estoque, criar assinatura e atualizar status de pedido.
- Expandido client frontend de lojas para endpoints publicos e autenticados de stores, products, store_orders, store_subscriptions e store_plans.
- A API `Api::V1::My::StoreProductsController` agora aceita variantes no create/update e retorna detalhes/variantes na listagem do vendedor.
- Criado endpoint publico `GET /api/v1/store_plans` para alimentar onboarding/assinatura.
- Adicionados redirects Rails/Next para `/minha-loja` e subrotas.
- Corrigido redirect local de login/logout do Next para trocar `0.0.0.0` por `localhost`, evitando quebra no browser quando o dev server roda com `--hostname 0.0.0.0`.
- Ajustado o layout do formulario de estoque para nao cortar campos/botao em cards estreitos.
- Adicionado teste de contrato cobrindo store plans, create/update de variantes e ajuste de estoque por variante.
- Atualizado `docs/implementacao_sub_marketplace_lojas.md` marcando M5 como concluido.

Arquivos principais:

- `frontend/src/app/(seller)/minha-loja/layout.tsx`
- `frontend/src/app/(seller)/minha-loja/page.tsx`
- `frontend/src/app/(seller)/minha-loja/onboarding/page.tsx`
- `frontend/src/app/(seller)/minha-loja/configuracao/page.tsx`
- `frontend/src/app/(seller)/minha-loja/produtos/page.tsx`
- `frontend/src/app/(seller)/minha-loja/produtos/novo/page.tsx`
- `frontend/src/app/(seller)/minha-loja/produtos/[id]/page.tsx`
- `frontend/src/app/(seller)/minha-loja/estoque/page.tsx`
- `frontend/src/app/(seller)/minha-loja/assinatura/page.tsx`
- `frontend/src/app/(seller)/minha-loja/pedidos/page.tsx`
- `frontend/src/app/(seller)/minha-loja/pedidos/[id]/page.tsx`
- `frontend/src/app/(seller)/minha-loja/actions.ts`
- `frontend/src/components/domain/seller/product-form.tsx`
- `frontend/src/components/domain/seller/store-form.tsx`
- `frontend/src/components/domain/seller/stock-adjustment-form.tsx`
- `frontend/src/components/domain/stores/seller-shell-nav.tsx`
- `frontend/src/lib/api/stores.ts`
- `frontend/src/lib/api/types.ts`
- `frontend/src/lib/stores/presentation.ts`
- `frontend/src/app/api/auth/login/route.ts`
- `frontend/src/app/api/auth/logout/route.ts`
- `app/controllers/api/v1/store_plans_controller.rb`
- `app/controllers/api/v1/my/store_products_controller.rb`
- `config/routes.rb`
- `app/controllers/frontend_redirect_controller.rb`
- `test/integration/storefront_api_contract_test.rb`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/storefront_api_contract_test.rb'
```

Validacao visual/autenticada:

- Dev server Next validado em `http://localhost:3011`.
- Login com `ana.manuel@example.com` / `Conecta123!` redirecionou corretamente para `http://localhost:3011/pedidos`, sem voltar para `0.0.0.0`.
- Browser confirmou `/minha-loja`, `/minha-loja/produtos`, `/minha-loja/configuracao`, `/minha-loja/estoque` e `/minha-loja/assinatura`.
- Screenshots salvos em `tmp/screenshots/m5-minha-loja-dashboard.png`, `tmp/screenshots/m5-minha-loja-produtos.png` e `tmp/screenshots/m5-minha-loja-assinatura.png`.

Resultado:

- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou; rotas `/minha-loja`, `/minha-loja/produtos`, `/minha-loja/produtos/novo`, `/minha-loja/produtos/[id]`, `/minha-loja/estoque`, `/minha-loja/configuracao`, `/minha-loja/onboarding`, `/minha-loja/assinatura`, `/minha-loja/pedidos` e `/minha-loja/pedidos/[id]` aparecem dinamicas.
- Rails storefront API contract: `8 runs, 50 assertions, 0 failures, 0 errors, 0 skips`.
- Observacao: havia um lock stale `.next/turbopack` de build anterior; foi removido apos confirmar ausencia de `next build` ativo e o build passou em seguida.

Estado atual:

- M5 esta concluido para operacao da loja, gestao de produtos, estoque e assinatura.
- Produto pode ser criado, editado, publicado, pausado e gerido com variantes/preco/estoque.
- Ajuste de estoque aceita produto principal ou variante.
- Onboarding e assinatura ja consomem planos reais via `GET /api/v1/store_plans`.
- O painel do vendedor ja tem base para pedidos; o checkout publico de produto ainda nao existe.
- `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao foram atualizados para contratos de lojas; o frontend continua usando tipos manuais em `frontend/src/lib/api/types.ts`.

## Proximo passo recomendado

Implementar M6 do sub-marketplace de lojas: carrinho/checkout de produtos, criacao de pedido de loja pelo cliente e pagina publica de acompanhamento do pedido.

AVISO: O proximo passo e criar/implementar M6 do sub-marketplace de lojas: checkout e pedidos de produtos com carrinho por loja, `/lojas/[slug]/checkout`, `/lojas/pedido/[code]`, criacao de `StoreOrder`, reducao consistente de estoque e confirmacao no painel do vendedor. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir `app/controllers/api/v1/store_orders_controller.rb`, `app/services/store_orders/create.rb` e as paginas publicas de produto.
- Criar estado de carrinho por loja no frontend.
- Criar checkout publico com cliente, entrega e itens.
- Criar pagina de acompanhamento por codigo.
- Validar pedido -> estoque -> painel vendedor.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `app/controllers/api/v1/store_orders_controller.rb`
- `app/services/store_orders/create.rb`
- `frontend/src/app/(public)/lojas/[slug]/produtos/[productSlug]/page.tsx`
- `frontend/src/app/(seller)/minha-loja/pedidos/page.tsx`
- `frontend/src/app/(seller)/minha-loja/pedidos/[id]/page.tsx`
- `frontend/src/lib/api/stores.ts`
- `frontend/src/lib/api/types.ts`
- `test/integration/storefront_api_contract_test.rb`

## Ultima etapa concluida: validacao integrada M4 e documentacao

Objetivo: fechar a sincronizacao do M4 com validacao integrada do frontend, contratos Rails e memoria, garantindo que nada seja considerado concluido se quebrar lint, typecheck, build, contrato ou documentacao.

Foi feito:

- Rodado `npm run lint`, `npm run typecheck` e `npm run build` no frontend.
- Rodados em conjunto os testes Rails de contrato `test/integration/api_v1_contract_test.rb` e `test/integration/storefront_api_contract_test.rb`.
- Atualizados `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md` com os resultados desta validacao.
- Confirmado que M4 segue fechado e que o proximo trabalho deve iniciar em M5.

Arquivos principais:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `frontend/package.json`
- `test/integration/api_v1_contract_test.rb`
- `test/integration/storefront_api_contract_test.rb`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/api_v1_contract_test.rb test/integration/storefront_api_contract_test.rb'
```

Resultado:

- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou; `next build` compilou com sucesso e manteve `/lojas`, `/lojas/[slug]` e `/lojas/[slug]/produtos/[productSlug]` como rotas dinamicas.
- Rails contract tests: `14 runs, 70 assertions, 0 failures, 0 errors, 0 skips`.

Estado atual:

- A sincronizacao de M4 esta fechada: contrato Rails, lint, typecheck, build e memoria passaram juntos.
- Nenhuma correcao de codigo foi necessaria nesta etapa.
- O painel do vendedor ainda nao existe no Next.js.
- O carrinho/checkout de produtos ainda nao foi implementado; o CTA atual continua sendo contato da loja.
- `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao foram atualizados para os endpoints de lojas; M4 segue usando tipos manuais em `frontend/src/lib/api/types.ts`.

## Proximo passo recomendado

Implementar M5 do sub-marketplace de lojas: painel do vendedor no Next.js para criar/gerir loja, configurar vitrine, gerir produtos, publicar/pausar produtos, ajustar estoque e consultar assinatura usando os endpoints autenticados `/api/v1/my/stores`.

AVISO: O proximo passo e criar/implementar M5 do sub-marketplace de lojas: painel do vendedor Next.js em `/minha-loja`, com onboarding/configuracao da loja, listagem/criacao/edicao/publicacao de produtos, ajuste de estoque e tela de assinatura, consumindo os endpoints Rails autenticados `/api/v1/my/stores`. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir `frontend/src/app/(client)`, `frontend/src/app/(operations)` e componentes de formularios existentes para copiar padroes de autenticacao/layout.
- Criar client API autenticado para `/api/v1/my/stores`, produtos, pedidos e assinatura usando `forwardCookies`.
- Criar `/minha-loja` com estado sem loja, onboarding e dashboard simples da loja do usuario.
- Criar telas de produtos da loja com formularios de criacao/edicao, publicar/pausar e ajuste de estoque.
- Criar tela de assinatura da loja.
- Validar com lint/typecheck/build e testes Rails de contrato.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/app/(client)/pedidos/novo/page.tsx`
- `frontend/src/lib/api/account.ts`
- `frontend/src/lib/api/http.ts`
- `frontend/src/lib/api/stores.ts`
- `app/controllers/api/v1/my/stores_controller.rb`
- `app/controllers/api/v1/my/store_products_controller.rb`
- `app/controllers/api/v1/my/store_subscriptions_controller.rb`
- `test/integration/storefront_api_contract_test.rb`
- `test/integration/api_v1_contract_test.rb`

## Historico anterior: M4 vitrine publica Next.js para lojas

Objetivo: entregar a vitrine publica do sub-marketplace em Next.js, consumindo os endpoints Rails criados no M3 e mantendo o marketplace de servicos intacto.

Foi feito:

- Criados tipos frontend manuais para `Store`, `StoreSummary`, `Product`, `ProductCategory`, `ProductVariant`, `StorePlan` e `StoreSubscription`, porque `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao incluem os contratos do M3.
- Criado client `frontend/src/lib/api/stores.ts` para:
  - `GET /api/v1/stores`
  - `GET /api/v1/stores/:slug`
  - `GET /api/v1/stores/:store_slug/products`
  - `GET /api/v1/stores/:store_slug/products/:slug`
- Adicionado item `Lojas` na navegacao publica.
- Criada pagina publica `/lojas` com hero fotografico, busca, filtros de categoria/provincia/municipio, cards de lojas e estado vazio.
- Criada pagina publica `/lojas/[slug]` com capa da loja, metricas, produtos em destaque, catalogo filtravel por categoria e contatos publicos.
- Criada pagina publica `/lojas/[slug]/produtos/[productSlug]` com imagem, preco, promocao, estoque, loja vendedora, variantes e produtos relacionados.
- Criados componentes de dominio `StoreCard`, `ProductCard` e `StorefrontVisual`.
- Criado helper `frontend/src/lib/stores/presentation.ts` para labels, localizacao, assets e link WhatsApp.
- Copiados assets fotograficos locais para `frontend/public/storefront/*.jpg`, evitando dependencia de `/assets/...` do Rails no runtime Next.
- Adicionadas rotas Rails de redirect frontend para `/lojas`, `/lojas/:slug` e `/lojas/:slug/produtos/:product_slug`.
- Atualizado checklist de implementacao marcando M4 como concluido.

Arquivos principais:

- `frontend/src/app/(public)/lojas/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/page.tsx`
- `frontend/src/app/(public)/lojas/[slug]/produtos/[productSlug]/page.tsx`
- `frontend/src/lib/api/stores.ts`
- `frontend/src/lib/api/types.ts`
- `frontend/src/lib/stores/presentation.ts`
- `frontend/src/components/domain/stores/store-card.tsx`
- `frontend/src/components/domain/stores/product-card.tsx`
- `frontend/src/components/domain/stores/storefront-visual.tsx`
- `frontend/src/lib/navigation/items.ts`
- `frontend/public/storefront/market-hero-service.jpg`
- `frontend/public/storefront/market-account.jpg`
- `frontend/public/storefront/market-operations.jpg`
- `frontend/public/storefront/market-trust.jpg`
- `frontend/public/storefront/market-jobs.jpg`
- `config/routes.rb`
- `app/controllers/frontend_redirect_controller.rb`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run lint'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run typecheck'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola/frontend && npm run build'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test test/integration/storefront_api_contract_test.rb'
```

Resultados:

- Frontend lint: passou.
- Frontend typecheck: passou.
- Frontend build: passou; rotas `/lojas`, `/lojas/[slug]` e `/lojas/[slug]/produtos/[productSlug]` aparecem como dinamicas.
- Rails storefront API contract: `7 runs, 38 assertions, 0 failures, 0 errors, 0 skips`.

Validacao manual/visual executada:

- Rails estava saudavel em `http://localhost:3000/up`.
- Next dev foi iniciado em `http://localhost:3002` porque havia conflito/instancia antiga em `3001`.
- Next production (`next start`) foi iniciado em `http://localhost:3004` para captura limpa sem overlay de desenvolvimento.
- Browser validou `/lojas`, `/lojas/casa-ana-utilidades` e `/lojas/casa-ana-utilidades/produtos/organizador-plastico-modular` com dados reais.
- Verificado que nao havia imagens quebradas depois de mover os assets para `frontend/public/storefront`.
- Chrome headless gerou capturas desktop e mobile em `tmp/screenshots/`.
- Checagens HTTP confirmaram:
  - `/lojas?business_category=comercio` contem `Kiala Comercio`
  - `/lojas/casa-ana-utilidades?categoria=escritorio` contem `Extensao eletrica 5 tomadas`
  - `/lojas/casa-ana-utilidades/produtos/extensao-eletrica-5-tomadas` contem variante `3 metros`

Estado atual:

- A vitrine publica do sub-marketplace esta implementada e consumindo a API Rails.
- As paginas publicas de loja/produto funcionam sem login.
- O carrinho/checkout de produtos ainda nao foi implementado; o CTA atual e contato da loja.
- O painel do vendedor ainda nao existe no Next.js.
- `docs/api/openapi.yaml` e `frontend/src/lib/api/schema.ts` ainda nao foram atualizados para os endpoints de lojas; M4 usou tipos manuais em `frontend/src/lib/api/types.ts`.

## Proximo passo recomendado

Implementar M5 do sub-marketplace de lojas: painel do vendedor no Next.js para criar/gerir loja, configurar vitrine, gerir produtos, publicar/pausar produtos, ajustar estoque e consultar assinatura usando os endpoints autenticados `/api/v1/my/stores`.

AVISO: O proximo passo e criar/implementar M5 do sub-marketplace de lojas: painel do vendedor Next.js em `/minha-loja`, com onboarding/configuracao da loja, listagem/criacao/edicao/publicacao de produtos, ajuste de estoque e tela de assinatura, consumindo os endpoints Rails autenticados `/api/v1/my/stores`. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir `frontend/src/app/(client)`, `frontend/src/app/(operations)` e componentes de formularios existentes para copiar padroes de autenticacao/layout.
- Criar client API autenticado para `/api/v1/my/stores`, produtos, pedidos e assinatura usando `forwardCookies`.
- Criar `/minha-loja` com estado sem loja, onboarding e dashboard simples da loja do usuario.
- Criar telas de produtos da loja com formularios de criacao/edicao, publicar/pausar e ajuste de estoque.
- Criar tela de assinatura da loja.
- Validar com lint/typecheck/build e testes Rails de contrato.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `frontend/src/app/(client)/pedidos/page.tsx`
- `frontend/src/app/(client)/pedidos/novo/page.tsx`
- `frontend/src/lib/api/account.ts`
- `frontend/src/lib/api/http.ts`
- `frontend/src/lib/api/stores.ts`
- `app/controllers/api/v1/my/stores_controller.rb`
- `app/controllers/api/v1/my/store_products_controller.rb`
- `app/controllers/api/v1/my/store_subscriptions_controller.rb`
- `test/integration/storefront_api_contract_test.rb`

## Ultima etapa concluida: M3 API publica e API do vendedor para lojas

Objetivo: expor contratos JSON para descoberta publica de lojas/produtos e gestao autenticada do vendedor, usando as policies e services do M2.

Foi feito:

- Criados serializers `StorePlanSerializer`, `StoreSubscriptionSerializer`, `ProductCategorySerializer`, `ProductSerializer`, `StoreSummarySerializer`, `StoreSerializer`, `StorePaymentSerializer` e `StoreOrderSerializer`.
- Criados endpoints publicos:
  - `GET /api/v1/stores`
  - `GET /api/v1/stores/:slug`
  - `GET /api/v1/stores/:store_slug/products`
  - `GET /api/v1/stores/:store_slug/products/:slug`
  - `POST /api/v1/store_orders`
- Criado namespace autenticado `/api/v1/my/stores`.
- Criados endpoints do vendedor para listar/criar/editar/submeter lojas.
- Criados endpoints do vendedor para listar/criar/editar/publicar/pausar/ajustar estoque de produtos.
- Criados endpoints do vendedor para listar/ver pedidos e atualizar status.
- Criados endpoints do vendedor para consultar/criar assinatura da loja.
- Adicionadas rotas API v1 correspondentes.
- Adicionado teste de contrato `StorefrontApiContractTest`.
- Atualizado checklist de implementacao marcando M3 como concluido.

Arquivos principais:

- `config/routes.rb`
- `app/controllers/api/v1/stores_controller.rb`
- `app/controllers/api/v1/store_products_controller.rb`
- `app/controllers/api/v1/store_orders_controller.rb`
- `app/controllers/api/v1/my/base_controller.rb`
- `app/controllers/api/v1/my/stores_controller.rb`
- `app/controllers/api/v1/my/store_products_controller.rb`
- `app/controllers/api/v1/my/store_orders_controller.rb`
- `app/controllers/api/v1/my/store_subscriptions_controller.rb`
- `app/serializers/api/v1/store_plan_serializer.rb`
- `app/serializers/api/v1/store_subscription_serializer.rb`
- `app/serializers/api/v1/product_category_serializer.rb`
- `app/serializers/api/v1/product_serializer.rb`
- `app/serializers/api/v1/store_summary_serializer.rb`
- `app/serializers/api/v1/store_serializer.rb`
- `app/serializers/api/v1/store_payment_serializer.rb`
- `app/serializers/api/v1/store_order_serializer.rb`
- `test/integration/storefront_api_contract_test.rb`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
```

Resultado: `55 runs, 192 assertions, 0 failures, 0 errors, 0 skips`.

Estado atual:

- A API Rails do sub-marketplace ja permite descobrir lojas/produtos publicamente.
- A API Rails ja permite criar pedido publico de loja.
- A API Rails ja permite que o vendedor gerencie sua loja, produtos, estoque, pedidos e assinatura.
- Ainda nao foram atualizados `docs/api/openapi.yaml` nem `frontend/src/lib/api/schema.ts`.
- Ainda nao existem telas Next.js para `/lojas`, `/lojas/[slug]` ou detalhe de produto.

## Proximo passo recomendado

Implementar M4 do sub-marketplace de lojas: vitrine publica no Next.js consumindo a nova API de lojas/produtos.

AVISO: O proximo passo e criar/implementar M4 do sub-marketplace de lojas: vitrine publica Next.js em `/lojas`, `/lojas/[slug]` e `/lojas/[slug]/produtos/[productSlug]`, consumindo os endpoints Rails ja criados. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/AGENT_MEMORY.md` e `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir frontend atual em `frontend/src/app/(public)` e `frontend/src/lib/api`.
- Criar client API de lojas/produtos no frontend.
- Adicionar `Lojas` na navegacao publica.
- Criar paginas `/lojas`, `/lojas/[slug]` e `/lojas/[slug]/produtos/[productSlug]`.
- Validar responsividade e build/lint Next.js.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `frontend/src/app/(public)/servicos/page.tsx`
- `frontend/src/app/(public)/servicos/[slug]/page.tsx`
- `frontend/src/lib/api/marketplace.ts`
- `frontend/src/lib/api/types.ts`
- `frontend/src/lib/navigation/items.ts`
- `app/controllers/api/v1/stores_controller.rb`
- `app/controllers/api/v1/store_products_controller.rb`
- `test/integration/storefront_api_contract_test.rb`

## Ultima etapa concluida: M2 policies e services do sub-marketplace de lojas

Objetivo: proteger o dominio multi-loja e centralizar regras de negocio antes de expor APIs ou telas.

Foi feito:

- Criadas policies `StorePolicy`, `ProductPolicy`, `StoreOrderPolicy`, `StoreSubscriptionPolicy` e `StorePlanPolicy`.
- Implementadas regras de visibilidade publica para lojas/produtos ativos.
- Implementadas regras de membro por loja: `owner`, `manager` e `staff`.
- Implementadas regras operacionais para admin/operator e restricao financeira sensivel para admin/owner.
- Criados services `Stores::Create`, `Stores::SubmitForReview`, `Stores::Approve` e `Stores::Suspend`.
- Criado service `StoreSubscriptions::Start`.
- Criados services `Products::Publish` e `Products::AdjustStock`.
- Criados services `StoreOrders::Create` e `StoreOrders::UpdateStatus`.
- Adicionados testes de policies e services para permissoes, criacao de loja, publicacao, ajuste de estoque, criacao de pedido e status.
- Atualizado checklist de implementacao marcando M2 como concluido.

Arquivos principais:

- `app/policies/store_policy.rb`
- `app/policies/product_policy.rb`
- `app/policies/store_order_policy.rb`
- `app/policies/store_subscription_policy.rb`
- `app/policies/store_plan_policy.rb`
- `app/services/stores/create.rb`
- `app/services/stores/submit_for_review.rb`
- `app/services/stores/approve.rb`
- `app/services/stores/suspend.rb`
- `app/services/store_subscriptions/start.rb`
- `app/services/products/publish.rb`
- `app/services/products/adjust_stock.rb`
- `app/services/store_orders/create.rb`
- `app/services/store_orders/update_status.rb`
- `test/policies/store_policy_test.rb`
- `test/policies/product_policy_test.rb`
- `test/policies/store_order_policy_test.rb`
- `test/services/stores/create_test.rb`
- `test/services/products/adjust_stock_test.rb`
- `test/services/products/publish_test.rb`
- `test/services/store_orders/create_test.rb`
- `test/services/store_orders/update_status_test.rb`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
```

Resultado: `48 runs, 154 assertions, 0 failures, 0 errors, 0 skips`.

Estado atual:

- O backend ja tem dominio, policies e services para lojas/produtos/pedidos.
- Criacao de pedido via service exige loja ativa e assinatura apta.
- Ajuste de estoque via service impede estoque negativo e registra movimento.
- Publicacao de produto via service exige loja ativa, preco positivo e estoque disponivel.
- Ainda nao existem endpoints API para lojas/produtos/pedidos nem serializers do sub-marketplace.
- Ainda nao existem telas Next.js para `/lojas` ou `/minha-loja`.

## Proximo passo recomendado

Implementar M3 do sub-marketplace de lojas: API publica e API do vendedor para listar lojas/produtos, criar/gerir loja, gerir produtos e consultar/atualizar pedidos usando as policies/services ja criadas.

AVISO: O proximo passo e criar/implementar M3 do sub-marketplace de lojas: API publica e API do vendedor para stores, products, store_orders e store_subscriptions, com serializers e testes de contrato. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir `config/routes.rb` e controllers API v1 atuais para copiar padroes de envelope JSON/autorizacao.
- Criar serializers `StoreSerializer`, `StoreSummarySerializer`, `ProductSerializer`, `ProductCategorySerializer`, `StoreOrderSerializer` e `StoreSubscriptionSerializer`.
- Criar controllers publicos `Api::V1::StoresController` e `Api::V1::StoreProductsController`.
- Criar controllers autenticados em namespace `Api::V1::My` para lojas, produtos, pedidos e assinatura.
- Adicionar rotas em `/api/v1`.
- Adicionar testes de contrato API.
- Validar com `docker compose run --rm web bin/rails test` via WSL se necessario.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `config/routes.rb`
- `app/controllers/api/v1/base_controller.rb`
- `app/controllers/api/v1/marketplace_controller.rb`
- `app/controllers/api/v1/service_requests_controller.rb`
- `app/serializers/api/v1/service_request_serializer.rb`
- `app/serializers/api/v1/professional_serializer.rb`
- `app/policies/store_policy.rb`
- `app/services/stores/create.rb`
- `app/services/store_orders/create.rb`
- `test/integration/api_v1_contract_test.rb`

## Ultima etapa concluida: M1 restante do sub-marketplace de lojas

Objetivo: completar a base de banco, models, seeds e testes para catalogo, estoque, pedidos, pagamentos de loja e fees da plataforma.

Foi feito:

- Criada migration `20260525023000_create_storefront_commerce.rb`.
- Criados models `ProductCategory`, `Product`, `ProductVariant`, `InventoryMovement`, `StoreOrder`, `StoreOrderItem`, `StorePayment` e `PlatformFee`.
- Atualizadas associacoes de `Store` para categorias, produtos, estoque, pedidos, pagamentos e fees.
- Atualizada associacao de `Client` com `store_orders`.
- Expandido `db/seeds.rb` com categorias, produtos, variantes, movimentos de estoque, um pedido demo, pagamento demo e fee de plataforma.
- Adicionados testes de model para produtos e pedidos de loja.
- Atualizado o checklist de implementacao para marcar o M1 restante como concluido.

Arquivos principais:

- `db/migrate/20260525023000_create_storefront_commerce.rb`
- `db/schema.rb`
- `app/models/product_category.rb`
- `app/models/product.rb`
- `app/models/product_variant.rb`
- `app/models/inventory_movement.rb`
- `app/models/store_order.rb`
- `app/models/store_order_item.rb`
- `app/models/store_payment.rb`
- `app/models/platform_fee.rb`
- `app/models/store.rb`
- `app/models/client.rb`
- `db/seeds.rb`
- `test/models/product_test.rb`
- `test/models/store_order_test.rb`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails db:migrate'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails db:seed'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
```

Resultado: `30 runs, 109 assertions, 0 failures, 0 errors, 0 skips`.

Estado atual:

- O M1 de banco/models/seeds do sub-marketplace de lojas esta completo.
- O schema foi atualizado para a versao `2026_05_25_023000`.
- Existem dados demo para planos, lojas, categorias, produtos, variantes, estoque e um pedido de loja.
- Ainda nao existem policies, services, API publica/de vendedor nem telas Next.js para lojas.
- Calculos e transicoes complexas de pedido/estoque devem entrar na fase de services, nao diretamente nos controllers.

## Proximo passo recomendado

Implementar M2 do sub-marketplace de lojas: policies e services para proteger multi-loja e centralizar criacao/aprovacao de loja, publicacao de produto, ajuste de estoque, criacao/status de pedido e cobranca basica.

AVISO: O proximo passo e criar/implementar M2 do sub-marketplace de lojas: policies e services para Store, Product, StoreOrder, StoreSubscription, StorePlan, publicacao de produto, ajuste de estoque e criacao/status de pedido. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/implementacao_sub_marketplace_lojas.md`.
- Abrir models do sub-marketplace e `ApplicationPolicy`.
- Criar policies `StorePolicy`, `ProductPolicy`, `StoreOrderPolicy`, `StoreSubscriptionPolicy` e `StorePlanPolicy`.
- Criar services `Stores::Create`, `Stores::SubmitForReview`, `Stores::Approve`, `Stores::Suspend`, `Products::Publish`, `Products::AdjustStock`, `StoreOrders::Create` e `StoreOrders::UpdateStatus`.
- Adicionar testes de policy e service.
- Validar com `docker compose run --rm web bin/rails test` via WSL se necessario.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `app/policies/application_policy.rb`
- `app/policies/service_request_policy.rb`
- `app/models/store.rb`
- `app/models/store_membership.rb`
- `app/models/product.rb`
- `app/models/store_order.rb`
- `app/models/store_subscription.rb`
- `test/policies/service_request_policy_test.rb`
- `test/models/product_test.rb`
- `test/models/store_order_test.rb`

## Ultima etapa concluida: M1 inicial do sub-marketplace de lojas

Objetivo: criar a base de banco, models e seeds para lojas, memberships, planos e assinaturas, sem ainda implementar produtos, pedidos ou checkout.

Foi feito:

- Criada migration `20260525020000_create_storefront_core.rb` com tabelas `stores`, `store_memberships`, `store_plans` e `store_subscriptions`.
- Criados models `Store`, `StoreMembership`, `StorePlan` e `StoreSubscription`.
- Atualizado `User` com associacoes `owned_stores`, `store_memberships` e `stores`.
- Criados seeds dos planos Base, Crescimento e Pro.
- Criadas tres lojas demo com dono, membership e assinatura inicial.
- Adicionados testes de model para plano, loja, membership e assinatura.
- Atualizado o checklist de implementacao para marcar o M1 inicial como concluido.

Arquivos principais:

- `db/migrate/20260525020000_create_storefront_core.rb`
- `db/schema.rb`
- `app/models/store.rb`
- `app/models/store_membership.rb`
- `app/models/store_plan.rb`
- `app/models/store_subscription.rb`
- `app/models/user.rb`
- `db/seeds.rb`
- `test/models/store_test.rb`
- `test/models/store_membership_test.rb`
- `test/models/store_plan_test.rb`
- `test/models/store_subscription_test.rb`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails db:migrate'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails db:seed'
wsl -d Ubuntu -- bash -lc 'cd /home/alexandre/conectangola && docker compose run --rm web bin/rails test'
```

Resultado: `23 runs, 78 assertions, 0 failures, 0 errors, 0 skips`.

Estado atual:

- A base inicial de lojas e assinaturas existe no Rails.
- O schema foi atualizado para a versao `2026_05_25_020000`.
- O PowerShell nao tinha `docker` no PATH; os comandos de validacao foram executados via WSL/Ubuntu.
- Ainda nao existem produtos, pedidos de loja, pagamentos de loja, API publica de lojas nem telas Next.js para lojas.

## Proximo passo recomendado

Implementar o M1 restante do sub-marketplace de lojas: catalogo e estrutura comercial de produtos/pedidos no backend, com `ProductCategory`, `Product`, `ProductVariant`, `InventoryMovement`, `StoreOrder`, `StoreOrderItem`, `StorePayment` e `PlatformFee`.

AVISO: O proximo passo e criar/implementar o M1 restante do sub-marketplace de lojas: ProductCategory, Product, ProductVariant, InventoryMovement, StoreOrder, StoreOrderItem, StorePayment e PlatformFee. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/implementacao_sub_marketplace_lojas.md`.
- Reabrir os models recem-criados de loja e assinatura.
- Criar migrations e models de catalogo, estoque, pedidos e pagamentos de loja.
- Adicionar associacoes em `Store` e `Client`.
- Expandir seeds para categorias/produtos/pedidos demo.
- Criar testes de model para produto e pedido.
- Validar com `docker compose run --rm web bin/rails test` via WSL se necessario.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `app/models/store.rb`
- `app/models/store_subscription.rb`
- `app/models/client.rb`
- `app/models/payment.rb`
- `db/migrate/20260525020000_create_storefront_core.rb`
- `db/seeds.rb`
- `test/models/store_test.rb`

## Ultima etapa concluida: plano de implementacao do sub-marketplace de lojas

Objetivo: transformar a ideia de ecossistema com lojas proprias em um roteiro implementavel, preservando o marketplace de servicos existente.

Foi feito:

- Criado o plano de produto do sub-marketplace em `docs/plano_sub_marketplace_lojas.md`.
- Criado o roteiro pratico de implementacao em `docs/implementacao_sub_marketplace_lojas.md`.
- Definido que o MVP deve usar assinatura mensal por loja, deixando comissao por venda preparada para fase futura.
- Definido que lojas usam `store_memberships`, sem criar um papel global `seller`, porque o mesmo usuario pode ser cliente, profissional e dono de loja.
- Definido que `StoreOrder` deve ficar separado de `ServiceRequest` para nao misturar compra de produto com solicitacao de servico.

Arquivos principais:

- `docs/plano_sub_marketplace_lojas.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/AGENT_MEMORY.md`

Verificacao executada:

```bash
Get-Content -Path docs\plano_sub_marketplace_lojas.md -TotalCount 120
Get-Content -Path docs\AGENT_MEMORY.md -TotalCount 80
```

Resultado: documentacao criada e memoria atualizada. Nao houve alteracao de codigo nem execucao de testes.

Estado atual:

- O sistema continua como marketplace de servicos Rails + Next.js.
- O sub-marketplace de lojas ainda nao foi implementado em codigo.
- A proxima etapa deve comecar por banco, models e seeds.

## Proximo passo recomendado

Implementar M1 do plano de lojas: banco, models e seeds para `Store`, `StoreMembership`, `StorePlan` e `StoreSubscription`.

AVISO: O proximo passo e criar/implementar M1 do sub-marketplace de lojas: banco, models e seeds para Store, StoreMembership, StorePlan e StoreSubscription. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Ler `docs/implementacao_sub_marketplace_lojas.md`.
- Investigar models atuais `User`, `Client`, `Payment` e padroes de migration/model/test.
- Criar migrations e models iniciais de lojas e assinaturas.
- Atualizar `User` com associacoes de loja.
- Adicionar seeds dos tres planos mensais.
- Criar testes de model.
- Validar com `docker compose run --rm web bin/rails test`.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/implementacao_sub_marketplace_lojas.md`
- `docs/plano_sub_marketplace_lojas.md`
- `app/models/user.rb`
- `app/models/client.rb`
- `app/models/payment.rb`
- `db/seeds.rb`
- `db/schema.rb`
- `test/models/user_test.rb`

## Ultima etapa concluida: imagens de fundo por conceito

Objetivo: garantir que cada pagina use uma imagem de fundo coerente com o seu conceito, em vez de repetir uma imagem generica.

Foi feito:

- Layout passou a adicionar classe de rota no `body`, por exemplo `marketplace-help` e `professional-portal-wallet`.
- `page-heading` agora usa `--page-image`, permitindo imagem especifica por pagina.
- `auth-layout` agora usa `--auth-image`.
- Operacao/admin tambem usa imagem conceitual de dashboard/operacao.
- Adicionados assets locais para ajuda, confianca, funcionamento, pedidos, conta, profissionais, carteira, vagas, acesso e operacao.
- Pagina de ajuda refinada para usar imagem clara de atendimento com headset.

Arquivos principais:

- `app/assets/stylesheets/application.css`
- `app/views/layouts/application.html.erb`
- `app/assets/images/market-help.jpg`
- `app/assets/images/market-how-it-works.jpg`
- `app/assets/images/market-trust.jpg`
- `app/assets/images/market-orders.jpg`
- `app/assets/images/market-account.jpg`
- `app/assets/images/market-professionals.jpg`
- `app/assets/images/market-wallet.jpg`
- `app/assets/images/market-jobs.jpg`
- `app/assets/images/market-auth.jpg`
- `app/assets/images/market-operations.jpg`

Verificacao executada:

```bash
docker compose run --rm web bin/rails test
```

Resultado: `9 runs, 57 assertions, 0 failures, 0 errors, 0 skips`.

Validacao manual/visual executada:

- Chrome headless desktop em `/categorias`, `/ajuda`, `/confianca`.
- HTTP 200 e classes de rota confirmadas para `/categorias`, `/como-funciona`, `/ajuda`, `/confianca`, `/service_requests/new` e `/users/sign_in`.

Estado atual:

- Cada pagina principal tem imagem de fundo alinhada ao seu conceito.
- O checkout ainda e o fluxo simples de `service_requests/new`.

## Proximo passo recomendado

Implementar o checkout orientado do cliente em etapas para criacao de pedidos.

AVISO: O proximo passo e criar/implementar checkout orientado em etapas para pedidos de servico. Antes de iniciar, leia `docs/AGENT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

Plano inicial da proxima etapa:

- Investigar o fluxo atual de `ServiceRequestsController#new/#create`, policy e view existente.
- Implementar tela de solicitacao em etapas: problema, agenda, localizacao, dados do cliente e resumo.
- Manter compatibilidade com Devise/Pundit, roles e modelos atuais.
- Pre-selecionar categoria quando a origem for `/servicos/:slug`.
- Adicionar testes de criacao de pedido pelo cliente e redirecionamento de visitante para login.
- Validar com `docker compose run --rm web bin/rails test` e navegador em `http://localhost:3000/service_requests/new`.

Arquivos para investigar/abrir primeiro na proxima etapa:

- `docs/AGENT_MEMORY.md`
- `docs/proximos_passos.md`
- `app/controllers/service_requests_controller.rb`
- `app/views/service_requests/new.html.erb`
- `app/policies/service_request_policy.rb`
- `app/models/service_request.rb`
- `test/integration/authentication_flow_test.rb`
- `test/integration/marketplace_screens_test.rb`

## Historico anterior: estilo premium aplicado nas outras paginas

Objetivo: levar o mesmo estilo premium da home para as outras telas do sistema, mantendo os fluxos Rails atuais.

Foi feito:

- `page-heading` das paginas publicas, cliente e profissional virou hero fotografico full-bleed.
- Paginas de categorias, ajuda, confianca, como funciona, pedidos, conta e area profissional passaram a herdar o novo cabecalho premium.
- Detalhe de servico virou hero fotografico proprio usando a imagem da categoria.
- Login/cadastro/recuperacao de senha passaram a usar fundo imersivo com cards sobrepostos.
- Area operacional recebeu cabecalho premium discreto com fundo claro, borda e sombra.
- Responsividade mobile ajustada para textos dos heroes internos.

Verificacao executada: `docker compose run --rm web bin/rails test`.

Resultado: `9 runs, 57 assertions, 0 failures, 0 errors, 0 skips`.

## Historico anterior: hero full-page

Objetivo: fazer o hero da home ocupar a primeira tela inteira, em largura total, com visual de landing premium.

Foi feito:

- `.market-hero` saiu do container central usando full-bleed com `width: 100vw`.
- Hero passou a ter `min-height: calc(100svh - 76px)` no desktop e `100svh` no mobile.
- Removido raio do hero para ele ocupar toda a pagina horizontalmente.
- Padding interno ajustado para manter o conteudo alinhado mesmo em telas largas.

Verificacao executada: `docker compose run --rm web bin/rails test`.

Resultado: `9 runs, 57 assertions, 0 failures, 0 errors, 0 skips`.

## Historico anterior: visual premium inspirado em Airbnb

Objetivo: elevar a aparencia do sistema para uma experiencia de marketplace premium, extremamente bonita, com referencia de polimento tipo Airbnb/RBNB sem copiar marca.

Foi feito:

- Home publica redesenhada com hero fotografico, overlay escuro, busca em capsula, tags populares, cards de prova social e estatisticas.
- Categorias redesenhadas com cards fotograficos, imagens locais e badges por categoria.
- Cards de servicos populares atualizados com imagem, sombra, hover e composicao mais premium.
- Detalhe de servico ganhou imagem no resumo lateral.
- Paleta global migrada para base clara, coral principal, acento teal e sombras suaves.
- Responsividade mobile ajustada para o hero, busca, tags e cards.
- Baixados assets locais em `app/assets/images/market-*.jpg` para nao depender de imagens remotas em runtime.

Arquivos principais:

- `app/assets/stylesheets/application.css`
- `app/helpers/application_helper.rb`
- `app/views/marketplace/home.html.erb`
- `app/views/marketplace/categories.html.erb`
- `app/views/marketplace/service.html.erb`
- `app/assets/images/market-hero-service.jpg`
- `app/assets/images/market-electrician.jpg`
- `app/assets/images/market-plumbing.jpg`
- `app/assets/images/market-consulting.jpg`

Verificacao executada:

```bash
docker compose run --rm web bin/rails test
```

Resultado: `9 runs, 57 assertions, 0 failures, 0 errors, 0 skips`.

Validacao manual/visual executada:

- Chrome headless desktop em `/`.
- Chrome headless mobile em `/`.
- HTTP 200 confirmado para `/`, `/categorias` e `/servicos/ti-redes`.

Estado atual:

- O visual publico esta muito mais premium e fotografico.
- As telas continuam integradas ao Rails atual e aos dados existentes.
- O checkout ainda e o fluxo simples de `service_requests/new`.

## Historico anterior: telas do marketplace e portais

Objetivo: transformar a adaptacao visual do layout Stitch/Holy Conexao em telas reais no Rails,
mantendo autenticacao Devise/Pundit e a base operacional ja existente.

Foi feito:

- Home publica do marketplace em `/`.
- Vitrine de categorias em `/categorias`.
- Detalhe de servico em `/servicos/:slug`.
- Paginas publicas de funcionamento, ajuda e confianca.
- Area do profissional com painel, carteira, historico, vagas e cadastro.
- Area do cliente apontada por `/meus-pedidos` e `/minha-conta`.
- Layout atualizado para separar experiencia publica/profissional da experiencia operacional.
- Redirecionamento pos-login por papel: operacional vai para dashboard, profissional vai para painel profissional, cliente vai para meus pedidos.
- Helpers de icones/badges proprios substituindo Material Symbols, porque a fonte externa gerava texto de icone visivel nos cards.
- README atualizado com rotas/telas principais.
- Teste de integracao para telas publicas e painel profissional.

Arquivos principais:

- `config/routes.rb`
- `app/controllers/marketplace_controller.rb`
- `app/controllers/professional_portal_controller.rb`
- `app/controllers/account_controller.rb`
- `app/controllers/application_controller.rb`
- `app/helpers/application_helper.rb`
- `app/views/layouts/application.html.erb`
- `app/views/marketplace/home.html.erb`
- `app/views/marketplace/categories.html.erb`
- `app/views/marketplace/service.html.erb`
- `app/views/marketplace/how_it_works.html.erb`
- `app/views/marketplace/help.html.erb`
- `app/views/marketplace/trust.html.erb`
- `app/views/professional_portal/dashboard.html.erb`
- `app/views/professional_portal/wallet.html.erb`
- `app/views/professional_portal/history.html.erb`
- `app/views/professional_portal/jobs.html.erb`
- `app/views/professional_portal/registration.html.erb`
- `app/views/account/show.html.erb`
- `app/assets/stylesheets/application.css`
- `test/integration/marketplace_screens_test.rb`
- `test/integration/authentication_flow_test.rb`
- `README.md`

Verificacao executada:

```bash
docker compose run --rm web bin/rails test
```

Resultado: `9 runs, 57 assertions, 0 failures, 0 errors, 0 skips`.

Validacao manual/visual executada:

- Chrome headless gerou screenshots de `/` e `/categorias`.
- Rotas publicas validadas com HTTP 200:
  - `/`
  - `/categorias`
  - `/servicos/ti-redes`
  - `/como-funciona`
  - `/ajuda`
  - `/confianca`

Estado atual:

- O servidor Docker estava ativo em `http://localhost:3000`.
- As telas publicas renderizam com conteudo real de seeds/dados.
- As telas do profissional existem e passam em teste autenticado.
- O sistema ainda usa o fluxo simples de `service_requests/new`; o checkout em etapas ainda nao foi implementado.
- Upload de fotos/documentos via Active Storage ainda esta apenas preparado conceitualmente nas telas, sem fluxo funcional.
- Acoes do profissional para aceitar, iniciar e concluir servico ainda nao estao implementadas no painel profissional.
