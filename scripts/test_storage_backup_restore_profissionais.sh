#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

storage_image="$(env_value PROFISSIONAIS_STORAGE_BACKUP_IMAGE CONEXAO_STORAGE_BACKUP_IMAGE postgres:16-alpine)"
test_id="profissionais-storage-test-$(date -u +%Y%m%dT%H%M%SZ)-$$"
source_volume="${test_id}-source"
restore_volume="${test_id}-restore"
backup_dir="tmp/${test_id}-backups"
script_dir="$(cd "$(dirname "$0")" && pwd)"

function cleanup() {
  docker volume rm -f "$source_volume" "$restore_volume" >/dev/null 2>&1 || true
  rm -rf "$backup_dir"
}

trap cleanup EXIT

mkdir -p "$backup_dir"
docker volume create "$source_volume" >/dev/null
docker volume create "$restore_volume" >/dev/null

docker run --rm \
  -v "${source_volume}:/rails/storage" \
  "$storage_image" \
  sh -c 'mkdir -p /rails/storage/blobs/nested /rails/storage/empty-dir && printf "%s" "documento-profissional" > /rails/storage/blobs/nested/document.txt && printf "%s" "metadata" > /rails/storage/.active-storage-test'

new_backup_output="$(
  PROFISSIONAIS_STORAGE_DOCKER_VOLUME="$source_volume" \
  PROFISSIONAIS_BACKUP_DIR="$backup_dir" \
  PROFISSIONAIS_STORAGE_BACKUP_IMAGE="$storage_image" \
    "$script_dir/backup_profissionais_storage.sh"
)"
printf "%s\n" "$new_backup_output"

backup_file="$(printf "%s\n" "$new_backup_output" | awk -F': ' '/backup de storage criado/ {print $2}' | tail -n 1)"
[[ -n "$backup_file" ]] || {
  printf "FAIL nao foi possivel identificar o backup de storage criado\n" >&2
  exit 1
}

PROFISSIONAIS_STORAGE_DOCKER_VOLUME="$restore_volume" \
PROFISSIONAIS_STORAGE_BACKUP_IMAGE="$storage_image" \
PROFISSIONAIS_STORAGE_RESTORE_CONFIRM=restore-storage \
  "$script_dir/restore_profissionais_storage.sh" "$backup_file"

docker run --rm \
  -v "${restore_volume}:/rails/storage:ro" \
  "$storage_image" \
  sh -c 'test "$(cat /rails/storage/blobs/nested/document.txt)" = "documento-profissional" && test "$(cat /rails/storage/.active-storage-test)" = "metadata" && test -d /rails/storage/empty-dir'

printf "OK   backup e restore de storage testados com %s\n" "$backup_file"
