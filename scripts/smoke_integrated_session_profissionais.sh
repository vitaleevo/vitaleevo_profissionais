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
  print_container_logs "${rails_container:-}" "Rails"
  print_container_logs "${next_container:-}" "Next"
  exit 1
}

function info() {
  printf "== %s ==\n" "$1"
}

function print_container_logs() {
  local container="${1:-}"
  local label="$2"

  if [[ -n "$container" ]] && command -v docker >/dev/null 2>&1; then
    printf "\n== %s logs (%s) ==\n" "$label" "$container" >&2
    docker logs --tail 120 "$container" >&2 || true
  fi
}

function require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio nao encontrado: $1"
}

function wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts="${3:-60}"

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS --max-time 5 "$url" >/dev/null 2>&1; then
      printf "OK   %s\n" "$label"
      return 0
    fi
    sleep 2
  done

  fail "timeout aguardando ${label}: ${url}"
}

function header_value() {
  local header_name="$1"
  local headers_file="$2"
  awk -v name="$header_name" '
    BEGIN { IGNORECASE = 1 }
    index($0, name ":") == 1 {
      sub(/^[^:]+:[[:space:]]*/, "", $0)
      sub(/\r$/, "", $0)
      print $0
      exit
    }
  ' "$headers_file"
}

function assert_status() {
  local actual="$1"
  local expected="$2"
  local label="$3"

  [[ "$actual" == "$expected" ]] || fail "${label}: esperado HTTP ${expected}, recebeu ${actual}"
}

function assert_contains_file() {
  local file="$1"
  local expected="$2"
  local label="$3"

  grep -q "$expected" "$file" || fail "${label}: nao encontrou ${expected}"
}

function json_string_value() {
  local key="$1"
  local file="$2"

  awk -v marker="\"${key}\":\"" '
    {
      start = index($0, marker)
      if (start == 0) {
        next
      }

      value = substr($0, start + length(marker))
      end = index(value, "\"")
      if (end > 0) {
        print substr(value, 1, end - 1)
        exit
      }
    }
  ' "$file"
}

function first_json_integer_value() {
  local key="$1"
  local file="$2"

  awk -v marker="\"${key}\":" '
    {
      start = index($0, marker)
      if (start == 0) {
        next
      }

      value = substr($0, start + length(marker))
      if (match(value, /^[[:space:]]*[0-9]+/)) {
        result = substr(value, RSTART, RLENGTH)
        gsub(/[[:space:]]/, "", result)
        print result
        exit
      }
    }
  ' "$file"
}

function cleanup() {
  docker rm -f "$next_container" "$rails_container" >/dev/null 2>&1 || true
  docker compose -p "$compose_project" down --volumes --remove-orphans >/dev/null 2>&1 || true
  rm -f "$login_headers" "$login_body" "$logout_headers" "$logout_body" "$me_body" "$csrf_body" "$categories_body" "$internal_budget_body" "$cookie_jar" "$evil_headers" "$evil_body"
}

require_command curl
require_command docker
require_command awk
require_command grep

rails_port="$(env_value PROFISSIONAIS_INTEGRATED_RAILS_PORT CONEXAO_INTEGRATED_RAILS_PORT 3018)"
next_port="$(env_value PROFISSIONAIS_INTEGRATED_NEXT_PORT CONEXAO_INTEGRATED_NEXT_PORT 3019)"
rails_wait_attempts="$(env_value PROFISSIONAIS_INTEGRATED_RAILS_WAIT_ATTEMPTS CONEXAO_INTEGRATED_RAILS_WAIT_ATTEMPTS 150)"
next_wait_attempts="$(env_value PROFISSIONAIS_INTEGRATED_NEXT_WAIT_ATTEMPTS CONEXAO_INTEGRATED_NEXT_WAIT_ATTEMPTS 60)"
email="$(env_value PROFISSIONAIS_INTEGRATED_EMAIL CONEXAO_INTEGRATED_EMAIL cliente@example.com)"
password="$(env_value PROFISSIONAIS_INTEGRATED_PASSWORD CONEXAO_INTEGRATED_PASSWORD password123)"
suffix="$(date -u +%Y%m%dh%Hm%Ss)-$$"
compose_project="profissionais-integrated-smoke-${suffix}"
rails_container="${compose_project}-rails"
next_container="${compose_project}-next"
next_image="profissionais-frontend-integrated-smoke:${suffix}"
network_name="${compose_project}_default"
rails_base_url="http://127.0.0.1:${rails_port}"
next_base_url="http://127.0.0.1:${next_port}"
login_headers="$(mktemp)"
login_body="$(mktemp)"
logout_headers="$(mktemp)"
logout_body="$(mktemp)"
me_body="$(mktemp)"
csrf_body="$(mktemp)"
categories_body="$(mktemp)"
internal_budget_body="$(mktemp)"
cookie_jar="$(mktemp)"
evil_headers="$(mktemp)"
evil_body="$(mktemp)"

trap cleanup EXIT

info "Build Rails test image"
docker compose -p "$compose_project" build web

info "Start Rails test server"
docker compose -p "$compose_project" up -d db
bundle_volume="$(env_value PROFISSIONAIS_BUNDLE_VOLUME CONEXAO_BUNDLE_VOLUME profissionais_bundle-cache)"

docker compose -p "$compose_project" run -d \
  --name "$rails_container" \
  -e RAILS_ENV=test \
  -e RAILS_LOG_TO_STDOUT=true \
  -v "${bundle_volume}:/bundle" \
  -p "127.0.0.1:${rails_port}:3000" \
  web \
  bash -lc "bundle check || bundle install && bin/rails db:drop db:create db:schema:load db:fixtures:load && bin/rails runner 'ServiceCategory.find_or_create_by!(slug: \"smoke-integrated\") { |category| category.name = \"Smoke Integrado\"; category.base_price_cents = 1000000; category.average_duration_minutes = 60 }' && bin/rails server -b 0.0.0.0 -p 3000" >/dev/null
wait_for_url "${rails_base_url}/up" "Rails /up" "$rails_wait_attempts"

info "Build Next image"
docker build -f frontend/Dockerfile frontend -t "$next_image"

info "Start Next server"
docker run --rm -d \
  --name "$next_container" \
  --network "$network_name" \
  --read-only \
  --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  -p "127.0.0.1:${next_port}:3001" \
  -e FRONTEND_PUBLIC_BASE_URL="$next_base_url" \
  -e FRONTEND_ALLOWED_HOSTS="127.0.0.1,localhost" \
  -e RAILS_API_BASE_URL="http://${rails_container}:3000" \
  -e RAILS_PUBLIC_BASE_URL="$rails_base_url" \
  -e SESSION_COOKIE_KEY="_profiangola_session" \
  -e SESSION_COOKIE_SAME_SITE="lax" \
  "$next_image" >/dev/null
wait_for_url "${next_base_url}/favicon.ico" "Next /favicon.ico" "$next_wait_attempts"

info "Login via Next proxy"
login_status="$(
  curl -sS \
    -D "$login_headers" \
    -o "$login_body" \
    -c "$cookie_jar" \
    -b "$cookie_jar" \
    -w "%{http_code}" \
    -X POST \
    -H "X-Forwarded-Host: 127.0.0.1:${next_port}" \
    -H "X-Forwarded-Proto: http" \
    -H "X-Forwarded-Port: ${next_port}" \
    -d "email=${email}" \
    -d "password=${password}" \
    "${next_base_url}/api/auth/login"
)"
assert_status "$login_status" "303" "login via Next"
login_location="$(header_value "Location" "$login_headers")"
[[ "$login_location" == "${next_base_url}/conta" || "$login_location" == "${next_base_url}/pedidos" ]] || fail "login redirecionou para destino inesperado: ${login_location}"
grep -qi "^Set-Cookie: _profiangola_session=" "$login_headers" || fail "login nao retornou cookie de sessao"
grep -qi "httponly" "$login_headers" || fail "cookie de login sem HttpOnly"
grep -qi "samesite=lax" "$login_headers" || fail "cookie de login sem SameSite=Lax"
printf "OK   login via Next rotacionou cookie e redirecionou para rota autenticada (%s)\n" "$login_location"

info "Rails /me with Next-issued cookie"
me_status="$(
  curl -sS \
    -H "Accept: application/json" \
    -b "$cookie_jar" \
    -o "$me_body" \
    -w "%{http_code}" \
    "${rails_base_url}/api/v1/me"
)"
assert_status "$me_status" "200" "Rails /me autenticado"
assert_contains_file "$me_body" "$email" "Rails /me autenticado"
printf "OK   Rails aceitou cookie emitido pelo fluxo Next\n"

info "Internal budget field blocked for client"
csrf_status="$(
  curl -sS \
    -H "Accept: application/json" \
    -b "$cookie_jar" \
    -c "$cookie_jar" \
    -o "$csrf_body" \
    -w "%{http_code}" \
    "${rails_base_url}/api/v1/session/csrf"
)"
assert_status "$csrf_status" "200" "Rails CSRF autenticado"
csrf_token="$(json_string_value "csrf_token" "$csrf_body")"
[[ -n "$csrf_token" ]] || fail "Rails CSRF nao retornou token"

categories_status="$(
  curl -sS \
    -H "Accept: application/json" \
    -b "$cookie_jar" \
    -o "$categories_body" \
    -w "%{http_code}" \
    "${rails_base_url}/api/v1/service_categories"
)"
assert_status "$categories_status" "200" "Rails categorias"
category_id="$(first_json_integer_value "id" "$categories_body")"
[[ -n "$category_id" ]] || fail "Rails categorias nao retornou categoria para smoke"

internal_budget_status="$(
  curl -sS \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: ${csrf_token}" \
    -b "$cookie_jar" \
    -c "$cookie_jar" \
    -o "$internal_budget_body" \
    -w "%{http_code}" \
    -X POST \
    --data "{\"client\":{\"name\":\"Cliente Smoke\",\"phone\":\"+244930777000\",\"address\":\"Talatona\"},\"service_request\":{\"service_category_id\":${category_id},\"title\":\"Smoke campo interno\",\"description\":\"Tentativa bloqueada de orcamento interno.\",\"location\":\"Talatona\",\"urgency\":\"normal\",\"budget_cents\":1,\"budget_aoa\":12000}}" \
    "${rails_base_url}/api/v1/service_requests"
)"
assert_status "$internal_budget_status" "422" "bloqueio de budget_cents interno"
assert_contains_file "$internal_budget_body" "internal_budget_not_allowed" "bloqueio de budget_cents interno"
printf "OK   Rails bloqueou budget_cents interno para cliente autenticado\n"

info "Logout via Next proxy"
logout_status="$(
  curl -sS \
    -D "$logout_headers" \
    -o "$logout_body" \
    -c "$cookie_jar" \
    -b "$cookie_jar" \
    -w "%{http_code}" \
    -X POST \
    -H "X-Forwarded-Host: 127.0.0.1:${next_port}" \
    -H "X-Forwarded-Proto: http" \
    -H "X-Forwarded-Port: ${next_port}" \
    "${next_base_url}/api/auth/logout"
)"
assert_status "$logout_status" "303" "logout via Next"
logout_location="$(header_value "Location" "$logout_headers")"
[[ "$logout_location" == "${next_base_url}/login" ]] || fail "logout redirecionou para destino inesperado: ${logout_location}"
grep -Eiq "^Set-Cookie: _profiangola_session=.*(Max-Age=0|expires=Thu, 01 Jan 1970)" "$logout_headers" ||
  fail "logout nao expirou cookie de sessao"
printf "OK   logout via Next expirou cookie e redirecionou para /login\n"

info "Rails /me after logout"
me_after_logout_status="$(
  curl -sS \
    -H "Accept: application/json" \
    -b "$cookie_jar" \
    -o "$me_body" \
    -w "%{http_code}" \
    "${rails_base_url}/api/v1/me"
)"
assert_status "$me_after_logout_status" "401" "Rails /me apos logout"
printf "OK   Rails rejeitou cookie apos logout\n"

info "Untrusted host canonical redirect"
evil_status="$(
  curl -sS \
    -D "$evil_headers" \
    -o "$evil_body" \
    -w "%{http_code}" \
    -X POST \
    -H "Host: attacker.example" \
    -H "X-Forwarded-Host: attacker.example" \
    -H "X-Forwarded-Proto: http" \
    -d "email=${email}" \
    -d "password=${password}" \
    "${next_base_url}/api/auth/login"
)"
assert_status "$evil_status" "303" "login com host nao permitido"
evil_location="$(header_value "Location" "$evil_headers")"
[[ "$evil_location" == "${next_base_url}/conta" || "$evil_location" == "${next_base_url}/pedidos" ]] || fail "host nao permitido nao caiu na origem canonica: ${evil_location}"
[[ "$evil_location" != *"attacker.example"* ]] || fail "redirect refletiu host nao permitido"
printf "OK   host nao permitido cai na origem canonica\n"

printf "OK   smoke integrado Rails+Next de sessao/origem concluido\n"
