#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

incident_id="$(env_value PROFISSIONAIS_ROLLBACK_INCIDENT_ID CONEXAO_ROLLBACK_INCIDENT_ID "$(date -u +%Y%m%dT%H%M%SZ)")"
env_file="$(env_value PROFISSIONAIS_ENV_FILE CONEXAO_ENV_FILE .env.production)"
compose_file="$(env_value PROFISSIONAIS_COMPOSE_FILE CONEXAO_COMPOSE_FILE compose.production.example.yaml)"
backup_file="$(env_value PROFISSIONAIS_ROLLBACK_BACKUP_FILE CONEXAO_ROLLBACK_BACKUP_FILE)"

cat <<PLAN
# Rollback Profissionais - ${incident_id}

1. Congelar deploys e avisar operacao.
2. Capturar estado atual:
   docker compose --env-file ${env_file} -f ${compose_file} ps
   docker compose --env-file ${env_file} -f ${compose_file} logs --tail=300 rails frontend db
3. Se o erro for somente aplicacao, voltar para a release/imagem anterior e subir:
   docker compose --env-file ${env_file} -f ${compose_file} up -d --no-build
4. Se houve migracao/dado corrompido, restaurar em ambiente separado primeiro:
   PROFISSIONAIS_RESTORE_CONFIRM=restore ./scripts/restore_profissionais_postgres.sh <backup.sql.gz>
5. So restaurar producao depois de confirmar impacto, janela e backup atual.
6. Rodar smoke:
   PROFISSIONAIS_SMOKE_API_BASE_URL=https://profiangola.ao ./scripts/smoke_profissionais_deploy.sh
7. Registrar causa, tempo de indisponibilidade, decisao tomada e proximo fix.

Backup sugerido para validacao: ${backup_file:-"<defina PROFISSIONAIS_ROLLBACK_BACKUP_FILE se aplicavel>"}
PLAN
