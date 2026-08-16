#!/usr/bin/env bash
set -euo pipefail

echo "Configuring backend variables..."
npx --yes @railway/cli variable set --service backend \
  RAILS_ENV=production \
  RAILS_LOG_TO_STDOUT=true \
  RAILS_LOG_LEVEL=info \
  RAILS_FORCE_SSL=true \
  RAILS_ASSUME_SSL=true \
  'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  SECRET_KEY_BASE='0d81bacc5cbbad614e26996598ed7872847c9fb69ed8fa84daffba5c2f6966ac6fa8660daae6e1585059a472cd0f2241181234cff317aec85abe6575ad81c48a' \
  SESSION_COOKIE_KEY=_profiangola_session \
  SESSION_COOKIE_SAME_SITE=lax \
  RATE_LIMIT_AUTH_PER_MINUTE=10 \
  RATE_LIMIT_PUBLIC_SEARCH_PER_MINUTE=60 \
  RATE_LIMIT_API_PER_MINUTE=300 \
  --skip-deploys --json

echo "Configuring frontend variables..."
npx --yes @railway/cli variable set --service frontend \
  NODE_ENV=production \
  PORT=3001 \
  'RAILS_API_BASE_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:80' \
  'RAILS_PUBLIC_BASE_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}' \
  'FRONTEND_PUBLIC_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}' \
  'FRONTEND_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},localhost,127.0.0.1' \
  SESSION_COOKIE_KEY=_profiangola_session \
  SESSION_COOKIE_SAME_SITE=lax \
  --skip-deploys --json

echo "Railway variables configured successfully!"
