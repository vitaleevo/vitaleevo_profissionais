#!/usr/bin/env bash
set -euo pipefail

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

function info() {
  printf "== %s ==\n" "$1"
}

function require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio nao encontrado: $1"
}

function cleanup() {
  for container in "${containers[@]:-}"; do
    docker rm -f "$container" >/dev/null 2>&1 || true
  done

  rm -rf "$workdir"
}

function write_nginx_config() {
  local path="$1"
  local cookie_attrs="$2"

  cat >"$path" <<EOF
events {}

http {
  server {
    listen 80;
    server_name _;

    add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; frame-ancestors 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self), payment=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;

    location = / {
      return 200 "ProfiAngola";
    }

    location = /servicos {
      return 200 "Servicos";
    }

    location = /operacoes {
      return 200 "ProfiAngola Ops";
    }

    location = /conta {
      return 200 "Conta";
    }

    location = /up {
      return 200 "up";
    }

    location = /api/v1/session/csrf {
      add_header Set-Cookie "_profiangola_session=test-session; Domain=.profiangola.test; Path=/; ${cookie_attrs}" always;
      return 200 '{"data":{"csrf_token":"test-token"}}';
    }

    location = /api/v1/session {
      if (\$request_method = POST) {
        return 200 '{"data":{"email":"cliente@example.com","role":"client"}}';
      }

      if (\$request_method = DELETE) {
        add_header Set-Cookie "_profiangola_session=; Domain=.profiangola.test; Path=/; Max-Age=0; ${cookie_attrs}" always;
        return 200 '{"data":{"signed_out":true}}';
      }

      return 405;
    }

    location = /api/v1/health {
      return 200 '{"status":"ok"}';
    }

    location = /api/v1/marketplace/home {
      return 200 '{"categories":[]}';
    }

    location = /api/v1/service_categories {
      return 200 '{"data":[{"id":1,"name":"Smoke"}]}';
    }

    location = /api/v1/service_requests {
      return 422 '{"error":{"code":"internal_budget_not_allowed","message":"Campo de orcamento interno nao permitido."}}';
    }
  }
}
EOF
}

function start_nginx() {
  local name="$1"
  local config_file="$2"
  local container

  container="profissionais-preflight-test-${name}-$$"
  containers+=("$container")

  docker run --rm -d \
    --name "$container" \
    -p 127.0.0.1::80 \
    -v "${config_file}:/etc/nginx/nginx.conf:ro" \
    nginx:alpine >/dev/null

  started_port="$(docker port "$container" 80/tcp | awk -F: '{print $NF}')"
}

function run_preflight() {
  local port="$1"

  PROFISSIONAIS_PREFLIGHT_SCHEME=http \
  PROFISSIONAIS_PREFLIGHT_BASE_DOMAIN=profiangola.test \
  PROFISSIONAIS_PREFLIGHT_PORT="$port" \
  PROFISSIONAIS_PREFLIGHT_TARGET_IP=127.0.0.1 \
  PROFISSIONAIS_PREFLIGHT_SKIP_DNS=true \
  PROFISSIONAIS_PREFLIGHT_REQUIRE_HTTP_REDIRECT=false \
  PROFISSIONAIS_PREFLIGHT_API_BASE_URL="http://127.0.0.1:${port}" \
  PROFISSIONAIS_SMOKE_EMAIL=cliente@example.com \
  PROFISSIONAIS_SMOKE_PASSWORD=password123 \
  PROFISSIONAIS_PREFLIGHT_COOKIE_DOMAIN=.profiangola.test \
    ./scripts/preflight_profissionais_staging.sh
}

require_command awk
require_command docker

workdir="$(mktemp -d)"
containers=()
started_port=""
trap cleanup EXIT

good_config="${workdir}/nginx-good.conf"
bad_config="${workdir}/nginx-bad-cookie.conf"
bad_output="${workdir}/bad-output.log"

write_nginx_config "$good_config" "Secure; HttpOnly; SameSite=Lax"
write_nginx_config "$bad_config" "Secure; SameSite=Lax"

info "Preflight positivo com headers e cookie seguro"
start_nginx good "$good_config"
good_port="$started_port"
run_preflight "$good_port"
printf "OK   preflight positivo passou\n"

info "Preflight negativo bloqueia cookie sem HttpOnly"
start_nginx bad "$bad_config"
bad_port="$started_port"
if run_preflight "$bad_port" >"$bad_output" 2>&1; then
  fail "preflight aceitou cookie sem HttpOnly"
fi

grep -q "sem HttpOnly" "$bad_output" || fail "falha negativa nao mencionou HttpOnly"
printf "OK   preflight bloqueou cookie sem HttpOnly\n"
