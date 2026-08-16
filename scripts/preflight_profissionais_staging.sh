#!/usr/bin/env bash
set -euo pipefail

function env_value() {
  local primary="$1"
  local legacy="$2"
  local default="${3:-}"

  printf "%s" "${!primary:-${!legacy:-$default}}"
}

scheme="$(env_value PROFISSIONAIS_PREFLIGHT_SCHEME CONEXAO_PREFLIGHT_SCHEME https)"
base_domain="$(env_value PROFISSIONAIS_PREFLIGHT_BASE_DOMAIN CONEXAO_PREFLIGHT_BASE_DOMAIN profiangola.ao)"
port="$(env_value PROFISSIONAIS_PREFLIGHT_PORT CONEXAO_PREFLIGHT_PORT)"
target_ip="$(env_value PROFISSIONAIS_PREFLIGHT_TARGET_IP CONEXAO_PREFLIGHT_TARGET_IP)"
expected_ip="$(env_value PROFISSIONAIS_PREFLIGHT_EXPECTED_IP CONEXAO_PREFLIGHT_EXPECTED_IP)"
api_base_url="$(env_value PROFISSIONAIS_PREFLIGHT_API_BASE_URL CONEXAO_PREFLIGHT_API_BASE_URL "${scheme}://${base_domain}")"
min_tls_days="$(env_value PROFISSIONAIS_PREFLIGHT_MIN_TLS_DAYS CONEXAO_PREFLIGHT_MIN_TLS_DAYS 14)"
require_cookie_domain="$(env_value PROFISSIONAIS_PREFLIGHT_REQUIRE_COOKIE_DOMAIN CONEXAO_PREFLIGHT_REQUIRE_COOKIE_DOMAIN true)"
expected_cookie_domain="$(env_value PROFISSIONAIS_PREFLIGHT_COOKIE_DOMAIN CONEXAO_PREFLIGHT_COOKIE_DOMAIN ".${base_domain}")"
expected_cookie_name="$(env_value PROFISSIONAIS_PREFLIGHT_COOKIE_NAME CONEXAO_PREFLIGHT_COOKIE_NAME _profiangola_session)"
skip_dns="$(env_value PROFISSIONAIS_PREFLIGHT_SKIP_DNS CONEXAO_PREFLIGHT_SKIP_DNS false)"
require_http_redirect="$(env_value PROFISSIONAIS_PREFLIGHT_REQUIRE_HTTP_REDIRECT CONEXAO_PREFLIGHT_REQUIRE_HTTP_REDIRECT true)"
http_port="$(env_value PROFISSIONAIS_PREFLIGHT_HTTP_PORT CONEXAO_PREFLIGHT_HTTP_PORT 80)"

hosts=(
  "${base_domain}"
  "www.${base_domain}"
  "admin.${base_domain}"
  "operacoes.${base_domain}"
  "app.${base_domain}"
)

curl_common=(-fsS --max-time 20 --retry 2 --retry-delay 1)

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

function resolved_ips() {
  local host="$1"
  getent ahosts "$host" | awk '{print $1}' | sort -u
}

function check_dns() {
  if [[ "$skip_dns" == "true" ]]; then
    printf "SKIP DNS: PROFISSIONAIS_PREFLIGHT_SKIP_DNS=true\n"
    return 0
  fi

  info "DNS"

  for host in "${hosts[@]}"; do
    local ips
    ips="$(resolved_ips "$host" || true)"

    if [[ -z "$ips" ]]; then
      fail "${host} nao resolve em DNS"
    fi

    printf "OK   %s -> %s\n" "$host" "$(tr '\n' ' ' <<<"$ips" | sed 's/[[:space:]]*$//')"

    if [[ -n "$expected_ip" ]] && ! grep -qx "$expected_ip" <<<"$ips"; then
      fail "${host} nao aponta para PROFISSIONAIS_PREFLIGHT_EXPECTED_IP=${expected_ip}"
    fi
  done
}

function check_http_redirect() {
  [[ "$scheme" == "https" && "$require_http_redirect" == "true" ]] || return 0

  info "HTTP redirect"

  for host in "${hosts[@]}"; do
    local url response http_status redirect_url
    if [[ "$http_port" == "80" ]]; then
      url="http://${host}/"
    else
      url="http://${host}:${http_port}/"
    fi

    if [[ -n "$target_ip" ]]; then
      response="$(curl -sS --max-time 20 --retry 2 --retry-delay 1 --resolve "${host}:${http_port}:${target_ip}" -o /dev/null -w "%{http_code} %{redirect_url}" "$url")" ||
        fail "${host} nao respondeu em HTTP para validar redirect"
    else
      response="$(curl -sS --max-time 20 --retry 2 --retry-delay 1 -o /dev/null -w "%{http_code} %{redirect_url}" "$url")" ||
        fail "${host} nao respondeu em HTTP para validar redirect"
    fi

    http_status="${response%% *}"
    redirect_url="${response#* }"

    [[ "$http_status" == "301" || "$http_status" == "308" ]] ||
      fail "${host} deve redirecionar HTTP para HTTPS com 301/308, recebeu ${http_status}"
    [[ "$redirect_url" == "https://${host}/"* || "$redirect_url" == "https://${host}:"* ]] ||
      fail "${host} redirecionou HTTP para destino inesperado: ${redirect_url}"

    printf "OK   http://%s/ -> %s\n" "$host" "$redirect_url"
  done
}

function tls_connect_target() {
  local host="$1"
  local connect_host="${target_ip:-$host}"
  local connect_port="${port:-443}"
  printf "%s:%s" "$connect_host" "$connect_port"
}

function url_for() {
  local host="$1"
  local path="$2"

  if [[ -n "$port" ]]; then
    printf "%s://%s:%s%s" "$scheme" "$host" "$port" "$path"
  else
    printf "%s://%s%s" "$scheme" "$host" "$path"
  fi
}

function curl_host_headers() {
  local host="$1"
  local path="$2"
  local headers_file="$3"
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

    curl "${curl_common[@]}" -D "$headers_file" -o /dev/null --resolve "${host}:${resolved_port}:${target_ip}" "$url"
  else
    curl "${curl_common[@]}" -D "$headers_file" -o /dev/null "$url"
  fi
}

function check_tls() {
  [[ "$scheme" == "https" ]] || return 0

  info "TLS"
  local min_seconds=$((min_tls_days * 24 * 60 * 60))

  for host in "${hosts[@]}"; do
    local cert_file
    cert_file="$(mktemp)"

    if ! timeout 20 bash -c "echo | openssl s_client -servername '$host' -connect '$(tls_connect_target "$host")' 2>/dev/null | openssl x509 > '$cert_file'"; then
      rm -f "$cert_file"
      fail "${host} nao entregou certificado TLS valido"
    fi

    openssl x509 -in "$cert_file" -checkend "$min_seconds" -noout >/dev/null ||
      fail "${host} tem certificado expirando em menos de ${min_tls_days} dias"

    printf "OK   %s " "$host"
    openssl x509 -in "$cert_file" -noout -subject -issuer -enddate | tr '\n' ' '
    printf "\n"
    rm -f "$cert_file"
  done
}

function check_cookie_flags() {
  info "Cookie"

  local headers_file cookie_header cookie_header_lower expected_cookie_domain_lower
  headers_file="$(mktemp)"

  if ! curl "${curl_common[@]}" -D "$headers_file" -o /dev/null -H "Accept: application/json" "${api_base_url%/}/api/v1/session/csrf"; then
    rm -f "$headers_file"
    fail "nao foi possivel acessar ${api_base_url%/}/api/v1/session/csrf"
  fi

  cookie_header="$(grep -i "^set-cookie: ${expected_cookie_name}=" "$headers_file" | head -n 1 || true)"
  if [[ -z "$cookie_header" ]]; then
    rm -f "$headers_file"
    fail "endpoint CSRF nao retornou cookie ${expected_cookie_name}"
  fi

  cookie_header_lower="$(printf "%s" "$cookie_header" | tr "[:upper:]" "[:lower:]")"
  expected_cookie_domain_lower="$(printf "%s" "$expected_cookie_domain" | tr "[:upper:]" "[:lower:]")"

  if [[ "$require_cookie_domain" == "true" ]] && [[ "$cookie_header_lower" != *"domain=${expected_cookie_domain_lower}"* ]]; then
    rm -f "$headers_file"
    fail "cookie ${expected_cookie_name} sem Domain=${expected_cookie_domain}"
  fi

  [[ "$cookie_header_lower" == *"secure"* ]] || fail "cookie ${expected_cookie_name} sem Secure"
  [[ "$cookie_header_lower" == *"httponly"* ]] || fail "cookie ${expected_cookie_name} sem HttpOnly"
  [[ "$cookie_header_lower" == *"samesite=lax"* ]] || fail "cookie ${expected_cookie_name} sem SameSite=Lax"

  rm -f "$headers_file"
  printf "OK   %s com dominio, Secure, HttpOnly e SameSite=Lax\n" "$expected_cookie_name"
}

function require_header() {
  local headers_file="$1"
  local header="$2"
  local expected="${3:-}"

  grep -qi "^${header}:" "$headers_file" || fail "header ausente: ${header}"
  if [[ -n "$expected" ]] && ! grep -qi "^${header}:.*${expected}" "$headers_file"; then
    fail "header ${header} nao contem ${expected}"
  fi
}

function check_security_headers() {
  info "Headers"

  local headers_file
  headers_file="$(mktemp)"

  if ! curl_host_headers "$base_domain" "/" "$headers_file"; then
    rm -f "$headers_file"
    fail "nao foi possivel validar headers em $(url_for "$base_domain" "/")"
  fi

  require_header "$headers_file" "content-security-policy" "default-src"
  require_header "$headers_file" "referrer-policy" "strict-origin-when-cross-origin"
  require_header "$headers_file" "x-content-type-options" "nosniff"
  require_header "$headers_file" "x-frame-options" "SAMEORIGIN"
  require_header "$headers_file" "permissions-policy"
  require_header "$headers_file" "permissions-policy" "camera=()"
  require_header "$headers_file" "permissions-policy" "microphone=()"
  require_header "$headers_file" "permissions-policy" "payment=()"
  require_header "$headers_file" "cross-origin-opener-policy" "same-origin"
  if [[ "$scheme" == "https" ]]; then
    require_header "$headers_file" "strict-transport-security" "max-age"
    require_header "$headers_file" "strict-transport-security" "includeSubDomains"
  fi

  rm -f "$headers_file"
  printf "OK   headers defensivos presentes em %s\n" "$(url_for "$base_domain" "/")"
}

function check_smoke() {
  info "Smoke"

  PROFISSIONAIS_SMOKE_SCHEME="$scheme" \
  PROFISSIONAIS_SMOKE_BASE_DOMAIN="$base_domain" \
  PROFISSIONAIS_SMOKE_PORT="$port" \
  PROFISSIONAIS_SMOKE_TARGET_IP="$target_ip" \
  PROFISSIONAIS_SMOKE_API_BASE_URL="$api_base_url" \
    "$(dirname "$0")/smoke_profissionais_deploy.sh"
}

require_command curl
require_command getent
require_command openssl

check_dns
check_tls
check_http_redirect
check_cookie_flags
check_security_headers
check_smoke

printf "OK   preflight de staging Profissionais concluido\n"
