#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

env_file="$(env_value PROFISSIONAIS_ENV_FILE CONEXAO_ENV_FILE)"
compose_file="$(env_value PROFISSIONAIS_COMPOSE_FILE CONEXAO_COMPOSE_FILE compose.production.example.yaml)"
backup_dir="$(env_value PROFISSIONAIS_BACKUP_DIR CONEXAO_BACKUP_DIR backups)"
retention_days="$(env_value PROFISSIONAIS_BACKUP_RETENTION_DAYS CONEXAO_BACKUP_RETENTION_DAYS 14)"
backup_database="$(env_value PROFISSIONAIS_BACKUP_DATABASE CONEXAO_BACKUP_DATABASE)"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/profissionais-${timestamp}.sql.gz"
tmp_file="${backup_file}.tmp"

mkdir -p "$backup_dir"

compose_args=(-f "$compose_file")
if [[ -n "$env_file" ]]; then
  compose_args=(--env-file "$env_file" "${compose_args[@]}")
elif [[ -f .env.production ]]; then
  compose_args=(--env-file .env.production "${compose_args[@]}")
fi

docker compose "${compose_args[@]}" exec -T -e BACKUP_DATABASE="$backup_database" db \
  sh -c 'database="${BACKUP_DATABASE:-${POSTGRES_DB:-${POSTGRES_DATABASE:-$POSTGRES_USER}}}"; pg_dump -U "$POSTGRES_USER" -d "$database" --format=plain --no-owner --no-privileges' |
  gzip -9 > "$tmp_file"

test -s "$tmp_file"
mv "$tmp_file" "$backup_file"
sha256sum "$backup_file" > "${backup_file}.sha256"

find "$backup_dir" -type f \( -name 'profissionais-*.sql.gz' -o -name 'profissionais-*.sql.gz.sha256' \) -mtime +"$retention_days" -print -delete

printf "OK   backup criado: %s\n" "$backup_file"
printf "OK   checksum: %s.sha256\n" "$backup_file"
