# Guia de Deploy no Railway - Profissionais

Este guia detalha a subida completa do sistema **Profissionais** no [Railway](https://railway.app).

---

## 1. Arquitetura no Railway

O projeto no Railway deve conter **3 serviços**:

1. **PostgreSQL** (Plugin nativo do Railway)
2. **Backend (Rails API)** (Baseado no `Dockerfile` raiz)
3. **Frontend (Next.js)** (Baseado em `frontend/Dockerfile`)

```
[ Navegador / Cliente ]
           │
           ▼
┌──────────────────────┐        Rede Privada Railway        ┌──────────────────────┐
│  Frontend (Next.js)  │ ─────────────────────────────────> │   Backend (Rails)    │
│   Porta 3001 (Web)   │                                    │    Porta 80 (Web)    │
└──────────────────────┘                                    └──────────────────────┘
                                                                       │
                                                                       ▼
                                                            ┌──────────────────────┐
                                                            │  PostgreSQL Database │
                                                            └──────────────────────┘
```

---

## 2. Passo a Passo de Criação no Railway

### Passo 1: Criar o Projeto e o Banco de Dados
1. Acesse [railway.app](https://railway.app) e clique em **New Project**.
2. Selecione **Provision PostgreSQL**.
3. O Railway criará o banco gerenciado e a variável `${{Postgres.DATABASE_URL}}`.

### Passo 2: Adicionar o Serviço Backend (Rails)
1. No mesmo projeto, clique em **+ New** > **GitHub Repo** (ou via Railway CLI).
2. Selecione o repositório do projeto.
3. Configure o serviço:
   - **Name**: `backend` (ou `rails`)
   - **Root Directory**: `/`
   - **Dockerfile Path**: `Dockerfile`
4. Na aba **Variables**, configure as seguintes variáveis:
   ```env
   RAILS_ENV=production
   RAILS_LOG_TO_STDOUT=true
   RAILS_LOG_LEVEL=info
   RAILS_FORCE_SSL=true
   RAILS_ASSUME_SSL=true
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY_BASE=0d81bacc5cbbad614e26996598ed7872847c9fb69ed8fa84daffba5c2f6966ac6fa8660daae6e1585059a472cd0f2241181234cff317aec85abe6575ad81c48a
   SESSION_COOKIE_KEY=_profiangola_session
   SESSION_COOKIE_SAME_SITE=lax
   RATE_LIMIT_AUTH_PER_MINUTE=10
   RATE_LIMIT_PUBLIC_SEARCH_PER_MINUTE=60
   RATE_LIMIT_API_PER_MINUTE=300
   ```
5. Na aba **Settings**:
   - Em **Networking**, clique em **Generate Domain** (ex: `backend-production.up.railway.app`).
   - Em **Healthcheck Path**, defina `/up`.

### Passo 3: Adicionar o Serviço Frontend (Next.js)
1. No mesmo projeto, clique em **+ New** > **GitHub Repo**.
2. Selecione o mesmo repositório.
3. Configure o serviço:
   - **Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `Dockerfile`
4. Na aba **Variables**, configure:
   ```env
   NODE_ENV=production
   PORT=3001
   RAILS_API_BASE_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:80
   RAILS_PUBLIC_BASE_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   FRONTEND_PUBLIC_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
   FRONTEND_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},localhost,127.0.0.1
   SESSION_COOKIE_KEY=_profiangola_session
   SESSION_COOKIE_SAME_SITE=lax
   ```
5. Na aba **Settings**:
   - Em **Networking**, clique em **Generate Domain** (ou adicione o domínio customizado, ex: `profiangola.ao`).
   - Em **Healthcheck Path**, defina `/`.

---

## 3. Seeds e Dados Iniciais (Opcional)

Se desejar carregar os dados demonstrativos no Railway:
1. No Railway Dashboard, abra o serviço **backend**.
2. Vá na aba **Deployments** > clique no menu de 3 pontos do deployment ativo > **Exec**.
3. Execute o comando:
   ```bash
   bin/rails db:seed
   ```

---

## 4. Deploy via CLI (Alternativa)

Se preferir usar o terminal:
```bash
# 1. Login no Railway
npx @railway/cli login

# 2. Conectar ou criar o projeto
npx @railway/cli init

# 3. Subir o backend
npx @railway/cli up

# 4. Conectar o banco
npx @railway/cli add -p postgresql
```
