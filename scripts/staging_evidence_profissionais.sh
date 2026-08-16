#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

env_file="${PROFISSIONAIS_ENV_FILE:-.env.production}"
compose_file="${PROFISSIONAIS_COMPOSE_FILE:-compose.production.example.yaml}"
evidence_dir="${PROFISSIONAIS_EVIDENCE_DIR:-tmp/staging-evidence/$(date -u +%Y%m%dT%H%M%SZ)}"
run_remote="${PROFISSIONAIS_RUN_REMOTE_CHECKS:-false}"
run_remote_frontend_smoke="${PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE:-false}"
run_local_preflight="${PROFISSIONAIS_RUN_LOCAL_PREFLIGHT:-true}"
run_integrated_smoke="${PROFISSIONAIS_RUN_INTEGRATED_SMOKE:-true}"
run_screenshots="${PROFISSIONAIS_RUN_SCREENSHOTS:-false}"
run_manual_qa_template="${PROFISSIONAIS_RUN_MANUAL_QA_TEMPLATE:-true}"
require_manual_qa="${PROFISSIONAIS_REQUIRE_MANUAL_QA:-false}"
manual_qa_file="${PROFISSIONAIS_MANUAL_QA_FILE:-${evidence_dir}/manual-qa-checklist.md}"

function info() {
  printf "== %s ==\n" "$1"
}

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

function require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio nao encontrado: $1"
}

function require_env() {
  local key="$1"
  [[ -n "${!key:-}" ]] || fail "${key} e obrigatorio para PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true"
}

function require_remote_frontend_smoke_env() {
  require_env PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL
  require_env PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL
  require_env PROFISSIONAIS_FRONTEND_SMOKE_CLIENT_EMAIL
  require_env PROFISSIONAIS_FRONTEND_SMOKE_REVIEW_CLIENT_EMAIL
  require_env PROFISSIONAIS_FRONTEND_SMOKE_PROFESSIONAL_EMAIL
  require_env PROFISSIONAIS_FRONTEND_SMOKE_ADMIN_EMAIL
  require_env PROFISSIONAIS_FRONTEND_SMOKE_PASSWORD
}

function run_step() {
  local name="$1"
  shift

  local log_file="${evidence_dir}/${name}.log"
  info "$name"
  printf "+ %q" "$@" >"$log_file"
  printf "\n" >>"$log_file"

  if "$@" >>"$log_file" 2>&1; then
    printf "OK   %s\n" "$name"
  else
    printf "FAIL %s - veja %s\n" "$name" "$log_file" >&2
    return 1
  fi
}

function write_summary() {
  local summary_file="${evidence_dir}/README.md"

  cat >"$summary_file" <<EOF
# Evidencia de Staging - Profissionais

Gerado em UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Entradas

- Env file: \`${env_file}\`
- Compose file: \`${compose_file}\`
- Run remote checks: \`${run_remote}\`
- Run remote frontend smoke: \`${run_remote_frontend_smoke}\`
- Run local preflight: \`${run_local_preflight}\`
- Run integrated smoke: \`${run_integrated_smoke}\`
- Run screenshots: \`${run_screenshots}\`
- Run manual QA template: \`${run_manual_qa_template}\`
- Require manual QA approval: \`${require_manual_qa}\`
- Manual QA file: \`${manual_qa_file}\`

## Evidencias

- \`env-check.log\`
- \`compose-config.log\`
- \`integrated-smoke.log\` quando habilitado
- \`local-preflight.log\` quando habilitado
- \`remote-preflight.log\` quando habilitado
- \`remote-smoke.log\` quando habilitado
- \`remote-frontend-smoke.log\` quando habilitado
- \`demo-screenshots.log\` e \`demo-screenshots/\` quando habilitado
- \`manual-qa-template.log\` e \`manual-qa-checklist.md\`
- \`manual-qa-check.log\` quando \`PROFISSIONAIS_REQUIRE_MANUAL_QA=true\`

## Gate

O staging so deve ser considerado pronto quando:

- todos os logs acima terminam com sucesso;
- o preflight remoto valida DNS/TLS/headers/cookies no dominio real;
- o smoke remoto autenticado usa credenciais de cliente de staging;
- o smoke frontend remoto autenticado valida cliente, profissional e admin;
- screenshots seguros existem para paginas publicas e fluxos por perfil;
- browser manual confirma cliente, profissional e admin no dominio real;
- \`manual-qa-checklist.md\` esta preenchido e aprovado quando o gate manual
  for exigido.
EOF
}

require_command docker
require_command bash

mkdir -p "$evidence_dir"
write_summary

run_step env-check bash ./scripts/check_profissionais_env.sh "$env_file"
run_step compose-config docker compose --env-file "$env_file" -f "$compose_file" config

if [[ "$run_manual_qa_template" == "true" ]]; then
  run_step manual-qa-template env PROFISSIONAIS_MANUAL_QA_FILE="$manual_qa_file" bash ./scripts/create_staging_manual_qa_checklist_profissionais.sh "$manual_qa_file"
else
  printf "SKIP manual QA template: PROFISSIONAIS_RUN_MANUAL_QA_TEMPLATE=false\n"
fi

if [[ "$require_manual_qa" == "true" ]]; then
  run_step manual-qa-check bash ./scripts/check_staging_manual_qa_profissionais.sh "$manual_qa_file"
else
  printf "SKIP manual QA approval: defina PROFISSIONAIS_REQUIRE_MANUAL_QA=true depois de preencher o checklist manual.\n"
fi

if [[ "$run_integrated_smoke" == "true" ]]; then
  run_step integrated-smoke bash ./scripts/smoke_integrated_session_profissionais.sh
else
  printf "SKIP integrated-smoke: PROFISSIONAIS_RUN_INTEGRATED_SMOKE=false\n"
fi

if [[ "$run_local_preflight" == "true" ]]; then
  run_step local-preflight bash ./scripts/test_preflight_profissionais_staging.sh
else
  printf "SKIP local-preflight: PROFISSIONAIS_RUN_LOCAL_PREFLIGHT=false\n"
fi

if [[ "$run_screenshots" == "true" ]]; then
  run_step demo-screenshots env PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR="${evidence_dir}/demo-screenshots" bash ./scripts/capture_profissionais_demo_screenshots.sh
else
  printf "SKIP screenshots: defina PROFISSIONAIS_RUN_SCREENSHOTS=true quando o frontend estiver acessivel para captura.\n"
fi

if [[ "$run_remote" == "true" ]]; then
  run_step remote-preflight bash ./scripts/preflight_profissionais_staging.sh
  run_step remote-smoke bash ./scripts/smoke_profissionais_deploy.sh
else
  printf "SKIP remote checks: defina PROFISSIONAIS_RUN_REMOTE_CHECKS=true quando DNS/TLS/credenciais estiverem prontos.\n"
fi

if [[ "$run_remote_frontend_smoke" == "true" ]]; then
  require_remote_frontend_smoke_env
  run_step remote-frontend-smoke bash ./scripts/smoke_frontend_routes_profissionais.sh
else
  printf "SKIP remote frontend smoke: defina PROFISSIONAIS_RUN_REMOTE_FRONTEND_SMOKE=true com credenciais de cliente/profissional/admin.\n"
fi

printf "OK   evidencias de staging em %s\n" "$evidence_dir"
