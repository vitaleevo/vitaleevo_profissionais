#!/usr/bin/env bash
set -euo pipefail

base_url="${PROFISSIONAIS_FRONTEND_SMOKE_BASE_URL:-http://127.0.0.1:3001}"
client_email="${PROFISSIONAIS_FRONTEND_SMOKE_CLIENT_EMAIL:-ana.manuel@example.com}"
review_client_email="${PROFISSIONAIS_FRONTEND_SMOKE_REVIEW_CLIENT_EMAIL:-operacoes@kiala.co.ao}"
professional_email="${PROFISSIONAIS_FRONTEND_SMOKE_PROFESSIONAL_EMAIL:-joaquim@conectaangola.ao}"
admin_email="${PROFISSIONAIS_FRONTEND_SMOKE_ADMIN_EMAIL:-admin@conectaangola.ao}"
password="${PROFISSIONAIS_FRONTEND_SMOKE_PASSWORD:-Conecta123!}"
rails_api_base_url="${PROFISSIONAIS_FRONTEND_SMOKE_API_BASE_URL:-http://127.0.0.1:3000}"
curl_timeout="${PROFISSIONAIS_FRONTEND_SMOKE_CURL_TIMEOUT:-40}"

tmp_dir="$(mktemp -d)"

function cleanup() {
  rm -rf "$tmp_dir"
}

trap cleanup EXIT

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

function require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio nao encontrado: $1"
}

function assert_contains_file() {
  local file="$1"
  local expected="$2"
  local label="$3"

  grep -q "$expected" "$file" || fail "${label}: nao encontrou '${expected}'"
}

function assert_not_contains_file() {
  local file="$1"
  local unexpected="$2"
  local label="$3"

  if grep -q "$unexpected" "$file"; then
    fail "${label}: encontrou texto inesperado '${unexpected}'"
  fi
}

function assert_status() {
  local actual="$1"
  local expected="$2"
  local label="$3"

  [[ "$actual" == "$expected" ]] || fail "${label}: esperado HTTP ${expected}, recebeu ${actual}"
}

function get_route() {
  local path="$1"
  local body_file="$2"
  local cookie_jar="${3:-}"

  if [[ -n "$cookie_jar" ]]; then
    curl -sS --max-time "$curl_timeout" -b "$cookie_jar" -o "$body_file" -w "%{http_code}" "${base_url}${path}"
  else
    curl -sS --max-time "$curl_timeout" -o "$body_file" -w "%{http_code}" "${base_url}${path}"
  fi
}

function get_api_route() {
  local path="$1"
  local body_file="$2"
  local cookie_jar="$3"

  curl -sS --max-time "$curl_timeout" \
    -H "Accept: application/json" \
    -b "$cookie_jar" \
    -o "$body_file" \
    -w "%{http_code}" \
    "${rails_api_base_url}${path}"
}

function login_as() {
  local email="$1"
  local cookie_jar="$2"
  local body_file="$tmp_dir/login-${email//@/-}.html"
  local status

  status="$(
    curl -sS --max-time "$curl_timeout" \
      -c "$cookie_jar" \
      -b "$cookie_jar" \
      -o "$body_file" \
      -w "%{http_code}" \
      -X POST \
      -d "email=${email}" \
      -d "password=${password}" \
      "${base_url}/api/auth/login"
  )"
  assert_status "$status" "303" "login ${email}"
}

function assert_public_route() {
  local path="$1"
  local expected="$2"
  local body_file="$tmp_dir/public-${path//\//_}.html"
  local status

  status="$(get_route "$path" "$body_file")"
  assert_status "$status" "200" "public ${path}"
  assert_contains_file "$body_file" "$expected" "public ${path}"
  assert_not_contains_file "$body_file" "Application error" "public ${path}"
}

function assert_auth_route() {
  local path="$1"
  local cookie_jar="$2"
  local expected="$3"
  local label="$4"
  local body_file="$tmp_dir/${label}-${path//\//_}.html"
  local status

  status="$(get_route "$path" "$body_file" "$cookie_jar")"
  assert_status "$status" "200" "${label} ${path}"
  assert_contains_file "$body_file" "$expected" "${label} ${path}"
  assert_not_contains_file "$body_file" "Application error" "${label} ${path}"
}

function assert_auth_route_contains() {
  local path="$1"
  local cookie_jar="$2"
  local label="$3"
  shift 3

  local body_file="$tmp_dir/${label}-${path//\//_}.html"
  local status

  status="$(get_route "$path" "$body_file" "$cookie_jar")"
  assert_status "$status" "200" "${label} ${path}"
  assert_not_contains_file "$body_file" "Application error" "${label} ${path}"

  for expected in "$@"; do
    assert_contains_file "$body_file" "$expected" "${label} ${path}"
  done
}

function assert_anonymous_protected_route() {
  local path="$1"
  local body_file="$tmp_dir/protected-${path//\//_}.html"
  local status

  status="$(get_route "$path" "$body_file")"
  assert_status "$status" "200" "anonymous protected ${path}"
  assert_contains_file "$body_file" "Entre para ver a rede de profissionais" "anonymous protected ${path}"
  assert_not_contains_file "$body_file" "Workspace" "anonymous protected ${path}"
}

function service_request_id_by_title() {
  local body_file="$1"
  local title="$2"

  node -e '
    const fs = require("fs");
    const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const title = process.argv[2];
    const request = payload.data.find((item) => item.title === title);
    if (!request) {
      console.error(`service_request title not found: ${title}`);
      process.exit(1);
    }
    console.log(request.id);
  ' "$body_file" "$title"
}

function professional_id_by_name() {
  local body_file="$1"
  local name="$2"

  node -e '
    const fs = require("fs");
    const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const name = process.argv[2];
    const professional = payload.data.find((item) => item.name === name);
    if (!professional) {
      console.error(`professional name not found: ${name}`);
      process.exit(1);
    }
    console.log(professional.id);
  ' "$body_file" "$name"
}

function assert_reviewed_request_detail() {
  local cookie_jar="$1"
  local list_body="$tmp_dir/review-client-requests.json"
  local status request_id

  assert_auth_route "/pedidos" "$cookie_jar" "Revisao de contrato de fornecedor" "review-client"

  status="$(get_api_route "/api/v1/service_requests" "$list_body" "$cookie_jar")"
  assert_status "$status" "200" "review-client API pedidos"
  request_id="$(service_request_id_by_title "$list_body" "Revisao de contrato de fornecedor")"

  assert_auth_route_contains \
    "/pedidos/${request_id}" \
    "$cookie_jar" \
    "review-client-detail" \
    "Pedido" \
    "Revisao de contrato de fornecedor" \
    "Avaliacao do cliente" \
    "Servico avaliado" \
    "Parecer claro"

  assert_auth_route_contains \
    "/pedidos/${request_id}?sucesso=Avaliacao%20enviada%20com%20sucesso." \
    "$cookie_jar" \
    "review-client-feedback" \
    "Avaliacao enviada com sucesso." \
    "Servico avaliado"
}

require_command curl
require_command grep
require_command node

assert_public_route "/" "ProfiAngola"
assert_public_route "/servicos" "Catalogo verificado"
assert_public_route "/profissionais" "Encontre profissionais por categoria"
assert_public_route "/cliente" "Solicite servicos"
assert_public_route "/como-funciona" "Como funciona"
assert_public_route "/confianca" "Confianca"
assert_public_route "/demo" "Demo guiada"
assert_public_route "/ajuda" "Ajuda"
assert_public_route "/login" "Entrar"

assert_anonymous_protected_route "/operacoes/profissionais"

client_cookie="$tmp_dir/client.cookie"
review_client_cookie="$tmp_dir/review-client.cookie"
professional_cookie="$tmp_dir/professional.cookie"
admin_cookie="$tmp_dir/admin.cookie"

login_as "$client_email" "$client_cookie"
assert_auth_route "/pedidos" "$client_cookie" "Meus pedidos" "client"
assert_auth_route "/pedidos/novo" "$client_cookie" "Triagem de servico" "client"
assert_auth_route "/conta" "$client_cookie" "Minha conta" "client"

login_as "$review_client_email" "$review_client_cookie"
assert_reviewed_request_detail "$review_client_cookie"

login_as "$professional_email" "$professional_cookie"
assert_auth_route "/profissional" "$professional_cookie" "Painel profissional" "professional"
assert_auth_route "/profissional/vagas" "$professional_cookie" "Pedidos abertos" "professional"
assert_auth_route "/profissional/carteira" "$professional_cookie" "Carteira profissional" "professional"

login_as "$admin_email" "$admin_cookie"
assert_auth_route_contains \
  "/operacoes" \
  "$admin_cookie" \
  "admin-dashboard" \
  "Dashboard operacional" \
  "SLA e qualidade" \
  "Alertas de risco" \
  "Auditoria operacional" \
  "Ultimas acoes criticas"
assert_auth_route_contains \
  "/operacoes?audit_action=service_request.status_updated" \
  "$admin_cookie" \
  "admin-dashboard-audit-filter" \
  "Auditoria operacional" \
  "Estado do pedido" \
  "Pedido atualizado"
assert_auth_route "/operacoes/profissionais" "$admin_cookie" "Rede operacional" "admin"
admin_professionals_body="$tmp_dir/admin-professionals.json"
admin_professionals_status="$(get_api_route "/api/v1/professionals" "$admin_professionals_body" "$admin_cookie")"
assert_status "$admin_professionals_status" "200" "admin API profissionais"
admin_professional_id="$(professional_id_by_name "$admin_professionals_body" "Joaquim Mateus")"
assert_auth_route_contains \
  "/operacoes/profissionais/${admin_professional_id}" \
  "$admin_cookie" \
  "admin-professional-detail" \
  "Controle operacional" \
  "Revisao documental" \
  "Historico operacional"
assert_auth_route "/pedidos" "$admin_cookie" "Pedidos" "admin"
assert_auth_route "/pedidos?status=assigned&province=Luanda&urgency=urgent" "$admin_cookie" "Quadro eletrico com disparos constantes" "admin-filters"

printf "OK frontend route smoke passed: %s\n" "$base_url"
