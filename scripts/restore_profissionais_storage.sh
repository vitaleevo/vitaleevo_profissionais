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

function validate_archive_entries() {
  local entry normalized part
  local -a parts

  gzip -t "$backup_file"
  while IFS= read -r entry; do
    normalized="${entry#./}"
    [[ -z "$normalized" || "$normalized" == "." ]] && continue
    [[ "$normalized" != /* ]] || fail "arquivo contem caminho absoluto: ${entry}"

    IFS="/" read -r -a parts <<< "$normalized"
    for part in "${parts[@]}"; do
      [[ "$part" != ".." ]] || fail "arquivo contem path traversal: ${entry}"
    done
  done < <(tar -tzf "$backup_file")
}

backup_file="${1:-}"
env_file="$(env_value PROFISSIONAIS_ENV_FILE CONEXAO_ENV_FILE)"
compose_file="$(env_value PROFISSIONAIS_COMPOSE_FILE CONEXAO_COMPOSE_FILE compose.production.example.yaml)"
storage_service="$(env_value PROFISSIONAIS_STORAGE_SERVICE CONEXAO_STORAGE_SERVICE rails)"
storage_path="$(env_value PROFISSIONAIS_STORAGE_PATH CONEXAO_STORAGE_PATH /rails/storage)"
storage_volume="$(env_value PROFISSIONAIS_STORAGE_DOCKER_VOLUME CONEXAO_STORAGE_DOCKER_VOLUME)"
storage_image="$(env_value PROFISSIONAIS_STORAGE_BACKUP_IMAGE CONEXAO_STORAGE_BACKUP_IMAGE postgres:16-alpine)"
confirm="$(env_value PROFISSIONAIS_STORAGE_RESTORE_CONFIRM CONEXAO_STORAGE_RESTORE_CONFIRM)"

[[ -n "$backup_file" ]] || fail "informe o caminho do backup .tar.gz"
[[ -f "$backup_file" ]] || fail "backup nao encontrado: $backup_file"
[[ "$backup_file" == *.tar.gz ]] || fail "backup precisa terminar em .tar.gz"
[[ "$confirm" == "restore-storage" ]] || fail "defina PROFISSIONAIS_STORAGE_RESTORE_CONFIRM=restore-storage para executar"
[[ "$storage_service" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "PROFISSIONAIS_STORAGE_SERVICE invalido"
[[ "$storage_path" == /* && "$storage_path" != *".."* ]] || fail "PROFISSIONAIS_STORAGE_PATH deve ser caminho absoluto seguro"
[[ -z "$storage_volume" || "$storage_volume" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "PROFISSIONAIS_STORAGE_DOCKER_VOLUME invalido"

if [[ -f "${backup_file}.sha256" ]]; then
  sha256sum -c "${backup_file}.sha256"
fi
validate_archive_entries

if [[ -n "$storage_volume" ]]; then
  docker run --rm -i \
    -e STORAGE_PATH="$storage_path" \
    -v "${storage_volume}:${storage_path}" \
    "$storage_image" \
    sh -c 'mkdir -p "$STORAGE_PATH" && find "$STORAGE_PATH" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -C "$STORAGE_PATH" -xzf -' < "$backup_file"
else
  mapfile -d '' compose_args < <(compose_arguments "$env_file" "$compose_file")
  docker compose "${compose_args[@]}" exec -T \
    -e STORAGE_PATH="$storage_path" \
    "$storage_service" \
    sh -c 'mkdir -p "$STORAGE_PATH" && find "$STORAGE_PATH" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -C "$STORAGE_PATH" -xzf -' < "$backup_file"
fi

printf "OK   restore de storage concluido em: %s\n" "$storage_path"
