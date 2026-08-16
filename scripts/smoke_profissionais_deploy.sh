#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

scheme="$(env_value PROFISSIONAIS_SMOKE_SCHEME CONEXAO_SMOKE_SCHEME https)"
base_domain="$(env_value PROFISSIONAIS_SMOKE_BASE_DOMAIN CONEXAO_SMOKE_BASE_DOMAIN profiangola.ao)"
port="$(env_value PROFISSIONAIS_SMOKE_PORT CONEXAO_SMOKE_PORT)"
target_ip="$(env_value PROFISSIONAIS_SMOKE_TARGET_IP CONEXAO_SMOKE_TARGET_IP)"
api_base_url="$(env_value PROFISSIONAIS_SMOKE_API_BASE_URL CONEXAO_SMOKE_API_BASE_URL)"
smoke_email="$(env_value PROFISSIONAIS_SMOKE_EMAIL CONEXAO_SMOKE_EMAIL)"
smoke_password="$(env_value PROFISSIONAIS_SMOKE_PASSWORD CONEXAO_SMOKE_PASSWORD)"

hosts=(
  "${base_domain}|/|ProfiAngola"
  "www.${base_domain}|/servicos|Servicos"
  "admin.${base_domain}|/operacoes|ProfiAngola Ops"
  "operacoes.${base_domain}|/operacoes|ProfiAngola Ops"
  "app.${base_domain}|/conta|Conta"
)

curl_common=(-fsS --max-time 20 --retry 2 --retry-delay 1)
curl_status_common=(-sS --max-time 20 --retry 2 --retry-delay 1)

csrf_body=""
login_body=""
categories_body=""
internal_budget_body=""
logout_body=""
cookie_jar=""

function cleanup() {
  rm -f "$csrf_body" "$login_body" "$categories_body" "$internal_budget_body" "$logout_body" "$cookie_jar"
}

trap cleanup EXIT

function url_for() {
  local host="$1"
  local path="$2"

  if [[ -n "$port" ]]; then
    printf "%s://%s:%s%s" "$scheme" "$host" "$port" "$path"
  else
    printf "%s://%s%s" "$scheme" "$host" "$path"
  fi
}

function url_host() {
  local url="$1"
  local without_scheme host_port

  without_scheme="${url#*://}"
  host_port="${without_scheme%%/*}"
  printf "%s" "${host_port%%:*}"
}

function url_scheme() {
  local url="$1"

  printf "%s" "${url%%://*}"
}

function url_port() {
  local url="$1"
  local without_scheme host_port scheme_value

  without_scheme="${url#*://}"
  host_port="${without_scheme%%/*}"
  if [[ "$host_port" == *":"* ]]; then
    printf "%s" "${host_port##*:}"
    return 0
  fi

  scheme_value="$(url_scheme "$url")"
  if [[ "$scheme_value" == "https" ]]; then
    printf "443"
  else
    printf "80"
  fi
}

function curl_host() {
  local host="$1"
  local path="$2"
  local url
  url="$(url_for "$host" "$path")"

  if [[ -n "$target_ip" ]]; then
    local resolved_port="$port"
    if [[ -z "$resolved_port" ]]; then
      if [[ "$scheme" == "https" ]]; then
        resolved_port="443"
      else
        resolved_port="80"
      fi
    fi

    curl "${curl_common[@]}" --resolve "${host}:${resolved_port}:${target_ip}" "$url"
  else
    curl "${curl_common[@]}" "$url"
  fi
}

function curl_api() {
  local path="$1"
  shift

  local url
  url="${api_base_url}${path}"

  if [[ -n "$target_ip" ]]; then
    local host resolved_port
    host="$(url_host "$api_base_url")"
    resolved_port="$(url_port "$api_base_url")"

    curl "$@" --resolve "${host}:${resolved_port}:${target_ip}" "$url"
  else
    curl "$@" "$url"
  fi
}

function assert_contains() {
  local body="$1"
  local expected="$2"
  local label="$3"

  if ! grep -qi "$expected" <<<"$body"; then
    printf "FAIL %s: nao encontrou '%s'\n" "$label" "$expected" >&2
    return 1
  fi
}

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
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

function check_authenticated_security() {
  if [[ -z "$smoke_email" && -z "$smoke_password" ]]; then
    printf "SKIP authenticated security checks: defina PROFISSIONAIS_SMOKE_EMAIL e PROFISSIONAIS_SMOKE_PASSWORD.\n"
    return 0
  fi

  [[ -n "$smoke_email" && -n "$smoke_password" ]] ||
    fail "defina PROFISSIONAIS_SMOKE_EMAIL e PROFISSIONAIS_SMOKE_PASSWORD em conjunto"

  csrf_body="$(mktemp)"
  login_body="$(mktemp)"
  categories_body="$(mktemp)"
  internal_budget_body="$(mktemp)"
  logout_body="$(mktemp)"
  cookie_jar="$(mktemp)"

  local csrf_status csrf_token login_status post_login_csrf_status categories_status category_id internal_budget_status logout_status

  csrf_status="$(
    curl_api "/api/v1/session/csrf" \
      "${curl_status_common[@]}" \
      -H "Accept: application/json" \
      -b "$cookie_jar" \
      -c "$cookie_jar" \
      -o "$csrf_body" \
      -w "%{http_code}"
  )"
  assert_status "$csrf_status" "200" "CSRF pre-login"
  csrf_token="$(json_string_value "csrf_token" "$csrf_body")"
  [[ -n "$csrf_token" ]] || fail "CSRF pre-login nao retornou token"

  login_status="$(
    curl_api "/api/v1/session" \
      "${curl_status_common[@]}" \
      -H "Accept: application/json" \
      -H "X-CSRF-Token: ${csrf_token}" \
      -b "$cookie_jar" \
      -c "$cookie_jar" \
      -o "$login_body" \
      -w "%{http_code}" \
      -X POST \
      --data-urlencode "email=${smoke_email}" \
      --data-urlencode "password=${smoke_password}"
  )"
  assert_status "$login_status" "200" "login autenticado"
  assert_contains_file "$login_body" "$smoke_email" "login autenticado"
  printf "OK   %s/api/v1/session login autenticado\n" "$api_base_url"

  post_login_csrf_status="$(
    curl_api "/api/v1/session/csrf" \
      "${curl_status_common[@]}" \
      -H "Accept: application/json" \
      -b "$cookie_jar" \
      -c "$cookie_jar" \
      -o "$csrf_body" \
      -w "%{http_code}"
  )"
  assert_status "$post_login_csrf_status" "200" "CSRF autenticado"
  csrf_token="$(json_string_value "csrf_token" "$csrf_body")"
  [[ -n "$csrf_token" ]] || fail "CSRF autenticado nao retornou token"

  categories_status="$(
    curl_api "/api/v1/service_categories" \
      "${curl_status_common[@]}" \
      -H "Accept: application/json" \
      -b "$cookie_jar" \
      -o "$categories_body" \
      -w "%{http_code}"
  )"
  assert_status "$categories_status" "200" "categorias autenticadas"
  category_id="$(first_json_integer_value "id" "$categories_body")"
  [[ -n "$category_id" ]] || fail "categorias nao retornou id para smoke autenticado"

  internal_budget_status="$(
    curl_api "/api/v1/service_requests" \
      "${curl_status_common[@]}" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -H "X-CSRF-Token: ${csrf_token}" \
      -b "$cookie_jar" \
      -c "$cookie_jar" \
      -o "$internal_budget_body" \
      -w "%{http_code}" \
      -X POST \
      --data "{\"client\":{\"name\":\"Cliente Smoke\",\"phone\":\"+244930777000\",\"address\":\"Talatona\"},\"service_request\":{\"service_category_id\":${category_id},\"title\":\"Smoke campo interno\",\"description\":\"Tentativa bloqueada de orcamento interno.\",\"location\":\"Talatona\",\"urgency\":\"normal\",\"budget_cents\":1,\"budget_aoa\":12000}}"
  )"
  assert_status "$internal_budget_status" "422" "bloqueio autenticado de budget_cents"
  assert_contains_file "$internal_budget_body" "internal_budget_not_allowed" "bloqueio autenticado de budget_cents"
  printf "OK   %s/api/v1/service_requests bloqueou budget_cents interno para cliente\n" "$api_base_url"

  logout_status="$(
    curl_api "/api/v1/session" \
      "${curl_status_common[@]}" \
      -H "Accept: application/json" \
      -H "X-CSRF-Token: ${csrf_token}" \
      -b "$cookie_jar" \
      -c "$cookie_jar" \
      -o "$logout_body" \
      -w "%{http_code}" \
      -X DELETE
  )"
  assert_status "$logout_status" "200" "logout autenticado"
  printf "OK   %s/api/v1/session logout autenticado\n" "$api_base_url"
}

for entry in "${hosts[@]}"; do
  IFS="|" read -r host path expected <<<"$entry"
  label="${host}${path}"
  body="$(curl_host "$host" "$path")"
  assert_contains "$body" "$expected" "$label"
  printf "OK   %s\n" "$label"
done

if [[ -n "$api_base_url" ]]; then
  api_base_url="${api_base_url%/}"
  curl_api "/up" "${curl_common[@]}" >/dev/null
  printf "OK   %s/up\n" "$api_base_url"

  health_payload="$(curl_api "/api/v1/health" "${curl_common[@]}" -H "Accept: application/json")"
  assert_contains "$health_payload" '"status":"ok"' "${api_base_url}/api/v1/health"
  printf "OK   %s/api/v1/health\n" "$api_base_url"

  home_payload="$(curl_api "/api/v1/marketplace/home" "${curl_common[@]}" -H "Accept: application/json")"
  assert_contains "$home_payload" "categories" "${api_base_url}/api/v1/marketplace/home"
  printf "OK   %s/api/v1/marketplace/home\n" "$api_base_url"

  categories_payload="$(curl_api "/api/v1/service_categories" "${curl_common[@]}" -H "Accept: application/json")"
  assert_contains "$categories_payload" "data" "${api_base_url}/api/v1/service_categories"
  printf "OK   %s/api/v1/service_categories\n" "$api_base_url"

  check_authenticated_security
else
  printf "SKIP API checks: defina PROFISSIONAIS_SMOKE_API_BASE_URL para validar Rails.\n"
fi
