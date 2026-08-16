#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

backup_file="${1:-}"
env_file="$(env_value PROFISSIONAIS_ENV_FILE CONEXAO_ENV_FILE)"
compose_file="$(env_value PROFISSIONAIS_COMPOSE_FILE CONEXAO_COMPOSE_FILE compose.production.example.yaml)"
restore_database="$(env_value PROFISSIONAIS_RESTORE_DATABASE CONEXAO_RESTORE_DATABASE profissionais_restore_validation)"
confirm="$(env_value PROFISSIONAIS_RESTORE_CONFIRM CONEXAO_RESTORE_CONFIRM)"

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

[[ -n "$backup_file" ]] || fail "informe o caminho do backup .sql.gz"
[[ -f "$backup_file" ]] || fail "backup nao encontrado: $backup_file"
[[ "$backup_file" == *.sql.gz ]] || fail "backup precisa terminar em .sql.gz"
[[ "$restore_database" =~ ^[A-Za-z0-9_]+$ ]] || fail "PROFISSIONAIS_RESTORE_DATABASE invalido"
[[ "$confirm" == "restore" ]] || fail "defina PROFISSIONAIS_RESTORE_CONFIRM=restore para executar"

if [[ -f "${backup_file}.sha256" ]]; then
  sha256sum -c "${backup_file}.sha256"
fi

compose_args=(-f "$compose_file")
if [[ -n "$env_file" ]]; then
  compose_args=(--env-file "$env_file" "${compose_args[@]}")
elif [[ -f .env.production ]]; then
  compose_args=(--env-file .env.production "${compose_args[@]}")
fi

docker compose "${compose_args[@]}" exec -T -e RESTORE_DATABASE="$restore_database" db \
  sh -c 'dropdb --if-exists -U "$POSTGRES_USER" "$RESTORE_DATABASE" && createdb -U "$POSTGRES_USER" "$RESTORE_DATABASE"'

gunzip -c "$backup_file" |
  docker compose "${compose_args[@]}" exec -T -e RESTORE_DATABASE="$restore_database" db \
    sh -c 'psql -U "$POSTGRES_USER" -d "$RESTORE_DATABASE" -v ON_ERROR_STOP=1 >/dev/null'

docker compose "${compose_args[@]}" exec -T -e RESTORE_DATABASE="$restore_database" db \
  sh -c 'psql -U "$POSTGRES_USER" -d "$RESTORE_DATABASE" -Atc "select current_database(), count(*) from information_schema.tables where table_schema = '\''public'\'';"'

printf "OK   restore concluido em database de validacao: %s\n" "$restore_database"
