#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

function compose_arguments() {
  local env_file="$1"
  local compose_file="$2"

  if [[ -n "$env_file" ]]; then
    printf "%s\0" --env-file "$env_file" -f "$compose_file"
  elif [[ -f .env.production ]]; then
    printf "%s\0" --env-file .env.production -f "$compose_file"
  else
    printf "%s\0" -f "$compose_file"
  fi
}

env_file="$(env_value PROFISSIONAIS_ENV_FILE CONEXAO_ENV_FILE)"
compose_file="$(env_value PROFISSIONAIS_COMPOSE_FILE CONEXAO_COMPOSE_FILE compose.production.example.yaml)"
backup_dir="$(env_value PROFISSIONAIS_BACKUP_DIR CONEXAO_BACKUP_DIR backups)"
retention_days="$(env_value PROFISSIONAIS_BACKUP_RETENTION_DAYS CONEXAO_BACKUP_RETENTION_DAYS 14)"
storage_service="$(env_value PROFISSIONAIS_STORAGE_SERVICE CONEXAO_STORAGE_SERVICE rails)"
storage_path="$(env_value PROFISSIONAIS_STORAGE_PATH CONEXAO_STORAGE_PATH /rails/storage)"
storage_volume="$(env_value PROFISSIONAIS_STORAGE_DOCKER_VOLUME CONEXAO_STORAGE_DOCKER_VOLUME)"
storage_image="$(env_value PROFISSIONAIS_STORAGE_BACKUP_IMAGE CONEXAO_STORAGE_BACKUP_IMAGE postgres:16-alpine)"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/profissionais-storage-${timestamp}.tar.gz"
tmp_file="${backup_file}.tmp"

[[ "$retention_days" =~ ^[0-9]+$ && "$retention_days" -gt 0 ]] || fail "PROFISSIONAIS_BACKUP_RETENTION_DAYS deve ser inteiro positivo"
[[ "$storage_service" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "PROFISSIONAIS_STORAGE_SERVICE invalido"
[[ "$storage_path" == /* && "$storage_path" != *".."* ]] || fail "PROFISSIONAIS_STORAGE_PATH deve ser caminho absoluto seguro"
[[ -z "$storage_volume" || "$storage_volume" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "PROFISSIONAIS_STORAGE_DOCKER_VOLUME invalido"

mkdir -p "$backup_dir"

if [[ -n "$storage_volume" ]]; then
  docker run --rm \
    -e STORAGE_PATH="$storage_path" \
    -v "${storage_volume}:${storage_path}:ro" \
    "$storage_image" \
    sh -c 'test -d "$STORAGE_PATH" && tar -C "$STORAGE_PATH" -czf - .' > "$tmp_file"
else
  mapfile -d '' compose_args < <(compose_arguments "$env_file" "$compose_file")
  docker compose "${compose_args[@]}" exec -T \
    -e STORAGE_PATH="$storage_path" \
    "$storage_service" \
    sh -c 'test -d "$STORAGE_PATH" && tar -C "$STORAGE_PATH" -czf - .' > "$tmp_file"
fi

test -s "$tmp_file"
gzip -t "$tmp_file"
tar -tzf "$tmp_file" >/dev/null
mv "$tmp_file" "$backup_file"
sha256sum "$backup_file" > "${backup_file}.sha256"

find "$backup_dir" -type f \( -name 'profissionais-storage-*.tar.gz' -o -name 'profissionais-storage-*.tar.gz.sha256' \) -mtime +"$retention_days" -print -delete

printf "OK   backup de storage criado: %s\n" "$backup_file"
printf "OK   checksum: %s.sha256\n" "$backup_file"
