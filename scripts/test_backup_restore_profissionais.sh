#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

backup_dir="$(env_value PROFISSIONAIS_BACKUP_DIR CONEXAO_BACKUP_DIR backups)"
restore_database="$(env_value PROFISSIONAIS_RESTORE_DATABASE CONEXAO_RESTORE_DATABASE profissionais_restore_validation)"

new_backup_output="$(PROFISSIONAIS_BACKUP_DIR="$backup_dir" "$(dirname "$0")/backup_profissionais_postgres.sh")"
printf "%s\n" "$new_backup_output"

backup_file="$(printf "%s\n" "$new_backup_output" | awk -F': ' '/backup criado/ {print $2}' | tail -n 1)"
[[ -n "$backup_file" ]] || {
  printf "FAIL nao foi possivel identificar o backup criado\n" >&2
  exit 1
}

PROFISSIONAIS_RESTORE_CONFIRM=restore \
PROFISSIONAIS_RESTORE_DATABASE="$restore_database" \
  "$(dirname "$0")/restore_profissionais_postgres.sh" "$backup_file"

printf "OK   backup e restore de Postgres testados com %s\n" "$backup_file"

"$(dirname "$0")/test_storage_backup_restore_profissionais.sh"

printf "OK   backup e restore de Postgres e storage testados\n"
