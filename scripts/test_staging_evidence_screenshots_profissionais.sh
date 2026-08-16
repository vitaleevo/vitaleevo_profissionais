#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_example="${root_dir}/docs/deploy/env.production.example"
evidence_script="${root_dir}/scripts/staging_evidence_profissionais.sh"
tmp_env="$(mktemp)"
evidence_dir="${root_dir}/tmp/staging-evidence/test-screenshots"
frontend_smoke_fail_dir="${root_dir}/tmp/staging-evidence/test-frontend-smoke-missing-env"

cleanup() {
  rm -f "$tmp_env"
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

rm -rf "$evidence_dir"
rm -rf "$frontend_smoke_fail_dir"

PROFISSIONAIS_ENV_FILE="$tmp_env" \
  PROFISSIONAIS_EVIDENCE_DIR="$evidence_dir" \
  PROFISSIONAIS_RUN_INTEGRATED_SMOKE=false \
  PROFISSIONAIS_RUN_LOCAL_PREFLIGHT=false \
  PROFISSIONAIS_RUN_REMOTE_CHECKS=false \
  PROFISSIONAIS_RUN_SCREENSHOTS=true \
  bash "$evidence_script" >/tmp/profissionais-staging-evidence-screenshots.log

[[ -f "${evidence_dir}/demo-screenshots/manifest.json" ]] || {
  printf "FAIL manifest de screenshots nao foi gerado\n" >&2
  exit 1
}

[[ -f "${evidence_dir}/demo-screenshots/public-demo-mobile.png" ]] || {
  printf "FAIL screenshot mobile da demo nao foi gerado\n" >&2
  exit 1
}

[[ -f "${evidence_dir}/manual-qa-checklist.md" ]] || {
  printf "FAIL checklist manual de QA nao foi gerado no pacote de evidencias\n" >&2
  exit 1
}

grep -q "Resultado final: PENDENTE" "${evidence_dir}/manual-qa-checklist.md"
grep -q '"hasHorizontalOverflow": false' "${evidence_dir}/demo-screenshots/manifest.json"
grep -q '"applicationError": false' "${evidence_dir}/demo-screenshots/manifest.json"

if PROFISSIONAIS_ENV_FILE="$tmp_env" \
  PROFISSIONAIS_EVIDENCE_DIR="$frontend_smoke_fail_dir" \
  PROFISSIONAIS_RUN_INTEGRATED_SMOKE=false \
  PROFISSIONAIS_RUN_LOCAL_PREFLIGHT=false \
  PROFISSIONAIS_RUN_REMOTE_CHECKS=false \
  PROFISSIONAIS_RUN_SCREENSHOTS=false \
  PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true \
  bash "$evidence_script" >/tmp/profissionais-staging-evidence-frontend-smoke-missing-env.log 2>&1; then
  printf "FAIL remote frontend smoke aceitou ambiente sem credenciais explicitas\n" >&2
  exit 1
fi

grep -q "PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL e obrigatorio" /tmp/profissionais-staging-evidence-frontend-smoke-missing-env.log || {
  printf "FAIL erro de credenciais ausentes nao foi claro\n" >&2
  exit 1
}

printf "OK staging evidence screenshots\n"
