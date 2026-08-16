#!/usr/bin/env bash
set -euo pipefail

checklist_file="${1:-${PROFISSIONAIS_MANUAL_QA_FILE:-tmp/staging-manual-qa/manual-qa-checklist.md}}"

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

[[ -f "$checklist_file" ]] || fail "checklist manual nao encontrado: ${checklist_file}"

unchecked_count="$(grep -Ec '^- \[ \]' "$checklist_file" || true)"
checked_count="$(grep -Ec '^- \[[xX]\]' "$checklist_file" || true)"

if [[ "$unchecked_count" != "0" ]]; then
  grep -n '^- \[ \]' "$checklist_file" >&2 || true
  fail "checklist manual ainda tem ${unchecked_count} itens pendentes"
fi

(( checked_count >= 40 )) || fail "checklist manual tem poucos itens aprovados (${checked_count}); arquivo parece incompleto"

grep -q '^Resultado final: APROVADO$' "$checklist_file" ||
  fail "Resultado final deve ser exatamente: APROVADO"

if grep -q 'PENDENTE' "$checklist_file"; then
  grep -n 'PENDENTE' "$checklist_file" >&2 || true
  fail "checklist manual ainda contem campos PENDENTE"
fi

printf "OK checklist manual aprovado: %s (%s itens)\n" "$checklist_file" "$checked_count"
