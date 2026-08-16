#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
workdir="$(mktemp -d)"

cleanup() {
  rm -rf "$workdir"
}
trap cleanup EXIT

template_file="${workdir}/manual-qa-template.md"
completed_file="${workdir}/manual-qa-completed.md"
incomplete_file="${workdir}/manual-qa-incomplete.md"
failed_output="${workdir}/failed-output.log"

PROFISSIONAIS_MANUAL_QA_BASE_URL=https://profiangola.test \
PROFISSIONAIS_RELEASE_ID=test-release \
PROFISSIONAIS_MANUAL_QA_TESTER="QA Test" \
  bash "${root_dir}/scripts/create_staging_manual_qa_checklist_profissionais.sh" "$template_file" >/dev/null

if bash "${root_dir}/scripts/check_staging_manual_qa_profissionais.sh" "$template_file" >"$failed_output" 2>&1; then
  printf "FAIL checklist pendente foi aprovado\n" >&2
  exit 1
fi

grep -q "itens pendentes" "$failed_output" || {
  printf "FAIL validacao pendente nao explicou itens pendentes\n" >&2
  exit 1
}

sed \
  -e 's/^- \[ \]/- [x]/' \
  -e 's/^Resultado final: PENDENTE$/Resultado final: APROVADO/' \
  -e 's/^Data\/hora final: PENDENTE$/Data\/hora final: 2026-06-03T00:00:00Z/' \
  -e 's|^Evidencias anexadas: PENDENTE$|Evidencias anexadas: tmp/staging-evidence/test|' \
  -e 's/PENDENTE/APROVADO/g' \
  "$template_file" >"$completed_file"

bash "${root_dir}/scripts/check_staging_manual_qa_profissionais.sh" "$completed_file" >/dev/null

sed '0,/^- \[x\]/{s/^- \[x\]/- [ ]/}' "$completed_file" >"$incomplete_file"

if bash "${root_dir}/scripts/check_staging_manual_qa_profissionais.sh" "$incomplete_file" >"$failed_output" 2>&1; then
  printf "FAIL checklist incompleto foi aprovado\n" >&2
  exit 1
fi

grep -q "itens pendentes" "$failed_output" || {
  printf "FAIL validacao incompleta nao explicou itens pendentes\n" >&2
  exit 1
}

printf "OK staging manual QA gate\n"
