#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

port="${PROFISSIONAIS_FRONTEND_DEV_PORT:-3001}"
bind_host="${PROFISSIONAIS_FRONTEND_DEV_HOST:-0.0.0.0}"
log_file="${PROFISSIONAIS_FRONTEND_DEV_LOG:-tmp/frontend-dev.log}"
pid_file="${PROFISSIONAIS_FRONTEND_DEV_PID:-tmp/frontend-dev.pid}"

if [[ "$log_file" == /* ]]; then
  log_path="$log_file"
else
  log_path="$root_dir/$log_file"
fi

if [[ "$pid_file" == /* ]]; then
  pid_path="$pid_file"
else
  pid_path="$root_dir/$pid_file"
fi

mkdir -p "$(dirname "$log_path")" "$(dirname "$pid_path")"

if [[ "${PROFISSIONAIS_FRONTEND_DEV_LOGGING:-0}" != "1" ]]; then
  export PROFISSIONAIS_FRONTEND_DEV_LOGGING=1
  exec "$0" "$@" >"$log_path" 2>&1
fi

if command -v docker >/dev/null 2>&1; then
  docker rm -f profissionais-next-local >/dev/null 2>&1 || true
fi

echo "$$" >"$pid_path"

export PORT="$port"
export HOSTNAME="$bind_host"
export RAILS_API_BASE_URL="${RAILS_API_BASE_URL:-http://127.0.0.1:3000}"
export RAILS_PUBLIC_BASE_URL="${RAILS_PUBLIC_BASE_URL:-http://127.0.0.1:3000}"
export FRONTEND_PUBLIC_BASE_URL="${FRONTEND_PUBLIC_BASE_URL:-http://127.0.0.1:${port}}"
export FRONTEND_ALLOWED_HOSTS="${FRONTEND_ALLOWED_HOSTS:-127.0.0.1,localhost}"
export SESSION_COOKIE_KEY="${SESSION_COOKIE_KEY:-_profiangola_session}"
export SESSION_COOKIE_SAME_SITE="${SESSION_COOKIE_SAME_SITE:-lax}"
export NEXT_PUBLIC_RAILS_ASSET_HOSTS="${NEXT_PUBLIC_RAILS_ASSET_HOSTS:-http://127.0.0.1:3000}"

cd "$root_dir/frontend"
exec npm run dev -- -H "$bind_host" -p "$port"
