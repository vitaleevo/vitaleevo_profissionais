#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-${PROFISSIONAIS_ENV_FILE:-.env.production}}"

declare -A ENV_VALUES=()
declare -a FAILURES=()
declare -a WARNINGS=()

function fail() {
  FAILURES+=("$1")
}

function warn() {
  WARNINGS+=("$1")
}

function load_env_file() {
  [[ -f "$env_file" ]] || {
    printf "FAIL env file nao encontrado: %s\n" "$env_file" >&2
    exit 1
  }

  local line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "${line:0:1}" == "#" ]] && continue

    if [[ "$line" == export[[:space:]]* ]]; then
      line="${line#export }"
    fi

    [[ "$line" == *"="* ]] || continue
    key="${line%%=*}"
    value="${line#*=}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"

    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || fail "chave invalida no env: ${key}"
    ENV_VALUES["$key"]="$value"
  done < "$env_file"
}

function value() {
  local key="$1"
  printf "%s" "${ENV_VALUES[$key]:-}"
}

function require_present() {
  local key="$1"
  [[ -n "$(value "$key")" ]] || fail "${key} e obrigatorio"
}

function require_equals() {
  local key="$1"
  local expected="$2"
  local actual
  actual="$(value "$key")"

  [[ "$actual" == "$expected" ]] || fail "${key} deve ser ${expected}"
}

function require_true() {
  require_equals "$1" "true"
}

function contains_placeholder() {
  local secret
  secret="$(printf "%s" "$1" | tr "[:upper:]" "[:lower:]")"
  [[ "$secret" == *replace_with* || "$secret" == *changeme* || "$secret" == *change_me* || "$secret" == *placeholder* || "$secret" == *example* || "$secret" == *password* ]]
}

function is_single_repeated_char() {
  local secret="$1"
  local first index
  [[ -n "$secret" ]] || return 1

  first="${secret:0:1}"
  for ((index = 1; index < ${#secret}; index++)); do
    [[ "${secret:index:1}" == "$first" ]] || return 1
  done

  return 0
}

function is_known_sequence_secret() {
  local secret stripped
  secret="$(printf "%s" "$1" | tr "[:upper:]" "[:lower:]")"
  stripped="${secret//0123456789abcdef/}"

  [[ -z "$stripped" || "$secret" == "abcdefghijklmnopqrstuvwxyz"* ]]
}

function require_secret() {
  local key="$1"
  local min_length="$2"
  local secret
  secret="$(value "$key")"

  require_present "$key"
  [[ -n "$secret" ]] || return
  (( ${#secret} >= min_length )) || fail "${key} deve ter pelo menos ${min_length} caracteres"
  if contains_placeholder "$secret"; then
    fail "${key} ainda parece placeholder/inseguro"
  fi

  if is_single_repeated_char "$secret" || is_known_sequence_secret "$secret"; then
    fail "${key} parece sequencia previsivel/insegura"
  fi
}

function require_rails_master_key() {
  local secret
  require_secret "RAILS_MASTER_KEY" 32
  secret="$(value RAILS_MASTER_KEY)"

  [[ -z "$secret" || "$secret" =~ ^[0-9a-fA-F]{32}$ ]] ||
    fail "RAILS_MASTER_KEY deve ter exatamente 32 caracteres hexadecimais"
}

function require_positive_integer() {
  local key="$1"
  local actual
  actual="$(value "$key")"

  [[ "$actual" =~ ^[0-9]+$ && "$actual" -gt 0 ]] || fail "${key} deve ser inteiro positivo"
}

function require_integer_between() {
  local key="$1"
  local min="$2"
  local max="$3"
  local actual
  actual="$(value "$key")"

  require_positive_integer "$key"
  [[ "$actual" =~ ^[0-9]+$ ]] || return
  (( actual >= min && actual <= max )) || fail "${key} deve estar entre ${min} e ${max}"
}

function require_url_scheme() {
  local key="$1"
  local expected_scheme="$2"
  local actual
  actual="$(value "$key")"

  require_present "$key"
  [[ -z "$actual" || "$actual" == "${expected_scheme}://"* ]] || fail "${key} deve comecar com ${expected_scheme}://"
}

function require_list_contains() {
  local key="$1"
  local expected="$2"
  local actual
  actual=",${ENV_VALUES[$key]:-},"

  [[ "$actual" == *",${expected},"* ]] || fail "${key} deve incluir ${expected}"
}

function check_domain_config() {
  local root cookie_domain allowed_hosts rails_hosts asset_hosts
  root="$(value PROFISSIONAIS_ROOT_DOMAIN)"
  cookie_domain="$(value SESSION_COOKIE_DOMAIN)"
  allowed_hosts="$(value FRONTEND_ALLOWED_HOSTS)"
  rails_hosts="$(value RAILS_HOSTS)"
  asset_hosts="$(value NEXT_PUBLIC_RAILS_ASSET_HOSTS)"

  require_present "PROFISSIONAIS_ROOT_DOMAIN"
  [[ "$root" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]] ||
    fail "PROFISSIONAIS_ROOT_DOMAIN deve ser um host valido"
  [[ "$cookie_domain" == ".${root}" ]] || fail "SESSION_COOKIE_DOMAIN deve ser .${root}"

  for host in "$root" "www.${root}" "admin.${root}" "operacoes.${root}" "app.${root}"; do
    require_list_contains "RAILS_HOSTS" "$host"
    require_list_contains "FRONTEND_ALLOWED_HOSTS" "$host"
    [[ ",${asset_hosts}," == *",https://${host},"* ]] || fail "NEXT_PUBLIC_RAILS_ASSET_HOSTS deve incluir https://${host}"
  done

  require_list_contains "RAILS_HOSTS" "rails"
  [[ -n "$allowed_hosts" ]] || fail "FRONTEND_ALLOWED_HOSTS e obrigatorio"
  [[ "$rails_hosts" != *"*"* ]] || fail "RAILS_HOSTS nao deve conter wildcard"
}

function check_storage_backup_config() {
  local service path image volume
  service="$(value PROFISSIONAIS_STORAGE_SERVICE)"
  path="$(value PROFISSIONAIS_STORAGE_PATH)"
  image="$(value PROFISSIONAIS_STORAGE_BACKUP_IMAGE)"
  volume="$(value PROFISSIONAIS_STORAGE_DOCKER_VOLUME)"

  [[ -n "$service" ]] || fail "PROFISSIONAIS_STORAGE_SERVICE e obrigatorio"
  [[ "$service" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "PROFISSIONAIS_STORAGE_SERVICE invalido"
  [[ -n "$path" ]] || fail "PROFISSIONAIS_STORAGE_PATH e obrigatorio"
  [[ "$path" == /* && "$path" != *".."* ]] || fail "PROFISSIONAIS_STORAGE_PATH deve ser caminho absoluto seguro"
  [[ -n "$image" ]] || fail "PROFISSIONAIS_STORAGE_BACKUP_IMAGE e obrigatorio"
  [[ "$image" != *[[:space:]]* ]] || fail "PROFISSIONAIS_STORAGE_BACKUP_IMAGE nao deve conter espacos"
  [[ -z "$volume" || "$volume" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "PROFISSIONAIS_STORAGE_DOCKER_VOLUME invalido"
}

function check_required_config() {
  require_equals "RAILS_ENV" "production"
  require_equals "NODE_ENV" "production"
  require_present "RAILS_LOG_LEVEL"
  [[ "$(value RAILS_LOG_LEVEL)" =~ ^(info|warn|error|fatal)$ ]] ||
    fail "RAILS_LOG_LEVEL deve ser info, warn, error ou fatal em producao"
  require_rails_master_key
  require_secret "SECRET_KEY_BASE" 64
  require_secret "POSTGRES_PASSWORD" 24
  [[ "$(value POSTGRES_PASSWORD)" != "$(value POSTGRES_USER)" ]] || fail "POSTGRES_PASSWORD nao pode ser igual a POSTGRES_USER"

  require_true "RAILS_FORCE_SSL"
  require_true "RAILS_ASSUME_SSL"
  require_true "SESSION_COOKIE_SECURE"
  require_equals "SESSION_COOKIE_SAME_SITE" "lax"
  require_integer_between "SESSION_TIMEOUT_MINUTES" 15 1440
  require_integer_between "DEVISE_REMEMBER_FOR_DAYS" 1 30
  require_present "DEVISE_MAILER_SENDER"
  [[ "$(value DEVISE_MAILER_SENDER)" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] ||
    fail "DEVISE_MAILER_SENDER deve ser email valido"

  require_url_scheme "FRONTEND_PUBLIC_BASE_URL" "https"
  require_url_scheme "RAILS_PUBLIC_BASE_URL" "https"
  require_present "RAILS_API_BASE_URL"
  [[ "$(value RAILS_API_BASE_URL)" =~ ^http://(rails|localhost|127\.0\.0\.1)(:[0-9]+)?$ ]] ||
    fail "RAILS_API_BASE_URL deve apontar para rede interna http://rails:80 ou localhost"

  require_positive_integer "RATE_LIMIT_AUTH_PER_MINUTE"
  require_positive_integer "RATE_LIMIT_PUBLIC_SEARCH_PER_MINUTE"
  require_positive_integer "RATE_LIMIT_API_PER_MINUTE"
  require_positive_integer "YANDEX_TRIP_INFO_RATE_LIMIT_PER_MINUTE"
  require_positive_integer "PROFISSIONAIS_BACKUP_RETENTION_DAYS"

  [[ "$(value ACTIVE_STORAGE_SERVICE)" != "local" ]] ||
    warn "ACTIVE_STORAGE_SERVICE=local exige backup operacional do volume rails_storage"
}

load_env_file
check_required_config
check_domain_config
check_storage_backup_config

if ((${#WARNINGS[@]} > 0)); then
  for warning in "${WARNINGS[@]}"; do
    printf "WARN %s\n" "$warning"
  done
fi

if ((${#FAILURES[@]} > 0)); then
  for failure in "${FAILURES[@]}"; do
    printf "FAIL %s\n" "$failure" >&2
  done
  exit 1
fi

printf "OK   env de producao validado: %s\n" "$env_file"
