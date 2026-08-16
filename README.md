# Projeto Profissionais

Projeto independente para conectar clientes a profissionais liberais em Angola.
Esta pasta nasceu da separacao do antigo `conectangola`: daqui para frente este produto
deve evoluir sozinho, sem depender do marketplace de lojas como ecossistema.

O frontend fica em `frontend/` (Next.js) e o Rails atua como backend de API,
autenticacao, regras de negocio, matching, pedidos e pagamentos.

## Escopo do produto

- Catalogo publico de servicos.
- Pesquisa nacional de profissionais por provincia, municipio, bairro, categoria e proximidade.
- Area do cliente para abrir e acompanhar pedidos.
- Area do profissional com painel, carteira, historico, vagas abertas e cadastro.
- Operacao/admin para acompanhar pedidos, profissionais, pagamentos e qualidade.
- Matching por avaliacao, proximidade, disponibilidade e experiencia.
- API em `/api/v1/professionals`, `/api/v1/professionals/search`,
  `/api/v1/service_requests` e `/api/v1/service_requests/:id/matches`.

Fora do escopo ativo: marketplace de lojas, produtos, carrinho e assinatura de vendedores.
O backend, schema, seeds, testes e contrato OpenAPI dessas partes ja foram removidos deste
projeto.

## Rodar com Docker

```bash
docker compose up --build
```

Depois acesse o Rails em `http://localhost:3000`.

Em outro terminal, suba o frontend Next em `http://localhost:3001` apontando
para a API local:

```bash
bash scripts/start_frontend_dev_profissionais.sh
```

O script remove apenas o container production local do frontend, sobe `next dev`
com hot reload na porta `3001`, grava o PID em `tmp/frontend-dev.pid` e o log em
`tmp/frontend-dev.log`. Para parar o hot reload:

```bash
bash scripts/stop_frontend_dev_profissionais.sh
```

As rotas HTML antigas do Rails redirecionam para o frontend Next.

Para carregar dados de demonstracao:

```bash
docker compose run --rm web bin/rails db:seed
```

## Telas principais

- Publico: `/`, `/cliente`, `/servicos`, `/servicos/ti-redes`, `/profissionais`, `/como-funciona`, `/ajuda`, `/confianca`, `/privacidade`, `/termos`.
- Cliente: `/pedidos`, `/pedidos/novo`, `/conta`.
- Profissional: `/profissional`, `/profissional/carteira`, `/profissional/historico`, `/profissional/vagas`, `/profissional/cadastro`.
- Operacao/admin: `/operacoes`, `/operacoes/profissionais`, `/operacoes/profissionais/:id`, `/pedidos`.

## Acessos demo

Senha para todas as contas: `Conecta123!`

- Admin: `admin@conectaangola.ao`
- Operador: `operador@conectaangola.ao`
- Profissional: `joaquim@conectaangola.ao`
- Cliente: `ana.manuel@example.com`

Para rodar testes:

```bash
scripts/test_rails_compose.sh
```

Para validar as principais rotas do frontend local, incluindo paginas publicas,
rotas protegidas sem sessao e areas autenticadas de cliente, profissional e
admin. O smoke tambem abre o detalhe de um pedido concluido ja avaliado para
provar que o cliente ve o historico de avaliacao no produto:

```bash
bash scripts/smoke_frontend_routes_profissionais.sh
```

Por padrao ele usa a API Rails em `http://127.0.0.1:3000`, o frontend em
`http://127.0.0.1:3001` e os dados de seed. Para outro ambiente:

```bash
PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL=https://profiangola.ao \
PROFISSIONAIS_FRONTEND_SMOKE_CLIENT_EMAIL=<cliente_staging> \
PROFISSIONAIS_FRONTEND_SMOKE_REVIEW_CLIENT_EMAIL=<cliente_com_pedido_avaliado> \
PROFISSIONAIS_FRONTEND_SMOKE_PROFESSIONAL_EMAIL=<profissional_staging> \
PROFISSIONAIS_FRONTEND_SMOKE_ADMIN_EMAIL=<admin_staging> \
PROFISSIONAIS_FRONTEND_SMOKE_PASSWORD=<senha_staging> \
bash scripts/smoke_frontend_routes_profissionais.sh
```

Para rodar apenas um arquivo ou teste especifico, passe os argumentos para o script:

```bash
scripts/test_rails_compose.sh test/integration/api_v1_contract_test.rb
```

## Producao

Os artefatos de deploy ficam em `docs/deploy/`:

- `staging_production_profissionais.md`: subida inicial, DNS, SSL e smoke.
- `production_readiness_profissionais.md`: observabilidade, backup/restore e rollback.
- `env.production.example`: checklist de variaveis e secrets.
- `nginx-profissionais.example.conf`: reverse proxy recomendado.

Scripts canonicos:

```bash
./scripts/preflight_profissionais_staging.sh
./scripts/smoke_profissionais_deploy.sh
./scripts/backup_profissionais_postgres.sh
./scripts/test_backup_restore_profissionais.sh
./scripts/rollback_profissionais_plan.sh
```

## Separacao

O registro da separacao esta em [docs/ESCOPO_PROJETO.md](docs/ESCOPO_PROJETO.md).
