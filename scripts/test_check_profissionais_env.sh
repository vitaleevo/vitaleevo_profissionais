#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_example="${root_dir}/docs/deploy/env.production.example"
env_checker="${root_dir}/scripts/check_profissionais_env.sh"
compose_file="${root_dir}/compose.production.example.yaml"
evidence_script="${root_dir}/scripts/staging_evidence_profissionais.sh"

tmp_env="$(mktemp)"
tmp_bad_env="$(mktemp)"
tmp_output="$(mktemp)"
tmp_evidence_dir="$(mktemp -d)"

cleanup() {
  rm -f "$tmp_env" "$tmp_bad_env" "$tmp_output"
  rm -rf "$tmp_evidence_dir"
}
trap cleanup EXIT

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"

  sed -i "s|^${key}=.*|${key}=${value}|" "$file"
}

cp "$env_example" "$tmp_env"
set_env_value "$tmp_env" "RAILS_MASTER_KEY" "8f2a9c4d7b1e3f506a8c9d0e2b4f6a1c"
set_env_value "$tmp_env" "SECRET_KEY_BASE" "stageSecretBaseValue8f2a9c4d7b1e3f506a8c9d0e2b4f6a1c7d3e9b0a5c2f4d6e8f1a3b5c7d9e0f2a4b6c8d"
set_env_value "$tmp_env" "POSTGRES_PASSWORD" "StageDbSecret-8f2a9c4d7b1e3f50"

bash "$env_checker" "$tmp_env" >/dev/null

cp "$tmp_env" "$tmp_bad_env"
set_env_value "$tmp_bad_env" "SESSION_TIMEOUT_MINUTES" "10"
if bash "$env_checker" "$tmp_bad_env" >"$tmp_output" 2>&1; then
  printf "FAIL SESSION_TIMEOUT_MINUTES invalido deveria falhar\n" >&2
  exit 1
fi
grep -q "SESSION_TIMEOUT_MINUTES deve estar entre 15 e 1440" "$tmp_output"

cp "$tmp_env" "$tmp_bad_env"
set_env_value "$tmp_bad_env" "RAILS_LOG_LEVEL" "debug"
if bash "$env_checker" "$tmp_bad_env" >"$tmp_output" 2>&1; then
  printf "FAIL RAILS_LOG_LEVEL invalido deveria falhar\n" >&2
  exit 1
fi
grep -q "RAILS_LOG_LEVEL deve ser info, warn, error ou fatal" "$tmp_output"

if command -v docker >/dev/null 2>&1; then
  docker compose --env-file "$tmp_env" -f "$compose_file" config >"$tmp_output"
  PROFISSIONAIS_ENV_FILE="$tmp_env" \
    PROFISSIONAIS_EVIDENCE_DIR="$tmp_evidence_dir" \
  PROFISSIONAIS_RUN_INTEGRATED_SMOKE=false \
  PROFISSIONAIS_RUN_LOCAL_PREFLIGHT=false \
  PROFISSIONAIS_RUN_REMOTE_CHECKS=false \
  PROFISSIONAIS_RUN_SCREENSHOTS=false \
  bash "$evidence_script" >"$tmp_output"
  [[ -f "${tmp_evidence_dir}/README.md" ]] || {
    printf "FAIL pacote de evidencias nao gerou README.md\n" >&2
    exit 1
  }
  [[ -f "${tmp_evidence_dir}/env-check.log" ]] || {
    printf "FAIL pacote de evidencias nao gerou env-check.log\n" >&2
    exit 1
  }
  [[ -f "${tmp_evidence_dir}/compose-config.log" ]] || {
    printf "FAIL pacote de evidencias nao gerou compose-config.log\n" >&2
    exit 1
  }
else
  printf "SKIP docker compose config: docker nao encontrado\n"
fi

printf "OK check_profissionais_env\n"
