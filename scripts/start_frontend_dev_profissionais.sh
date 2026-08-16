#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

port="${PROFISSIONAIS_FRONTEND_DEV_PORT:-3001}"
bind_host="${PROFISSIONAIS_FRONTEND_DEV_HOST:-0.0.0.0}"
public_host="${PROFISSIONAIS_FRONTEND_PUBLIC_HOST:-127.0.0.1}"
log_file="${PROFISSIONAIS_FRONTEND_DEV_LOG:-tmp/frontend-dev.log}"
pid_file="${PROFISSIONAIS_FRONTEND_DEV_PID:-tmp/frontend-dev.pid}"
health_path="${PROFISSIONAIS_FRONTEND_DEV_HEALTH_PATH:-/demo}"

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

if command -v docker >/dev/null 2>&1; then
  docker rm -f profissionais-next-local >/dev/null 2>&1 || true
fi

if [[ -f "$pid_path" ]]; then
  old_pid="$(cat "$pid_path" || true)"
  if [[ "$old_pid" =~ ^[0-9]+$ ]] && kill -0 "$old_pid" >/dev/null 2>&1; then
    kill "$old_pid" >/dev/null 2>&1 || true
    for _ in $(seq 1 20); do
      kill -0 "$old_pid" >/dev/null 2>&1 || break
      sleep 0.2
    done
  fi
fi

rm -f "$pid_path"

if command -v setsid >/dev/null 2>&1; then
  setsid bash "$root_dir/scripts/run_frontend_dev_profissionais.sh" >/dev/null 2>&1 &
else
  nohup bash "$root_dir/scripts/run_frontend_dev_profissionais.sh" >/dev/null 2>&1 &
fi

launcher_pid="$!"
pid=""

url="http://${public_host}:${port}${health_path}"

for _ in $(seq 1 90); do
  pid="$(cat "$pid_path" 2>/dev/null || true)"

  if curl -fsS "$url" >/dev/null 2>&1; then
    printf "OK frontend hot reload ativo em http://%s:%s (pid %s)\n" "$public_host" "$port" "${pid:-$launcher_pid}"
    printf "LOG %s\n" "$log_file"
    exit 0
  fi

  if [[ "$pid" =~ ^[0-9]+$ ]] && ! kill -0 "$pid" >/dev/null 2>&1; then
    printf "FAIL frontend dev server terminou cedo\n" >&2
    tail -80 "$log_path" >&2 || true
    exit 1
  fi

  if [[ -z "$pid" ]] && ! kill -0 "$launcher_pid" >/dev/null 2>&1; then
    printf "FAIL launcher do frontend dev terminou cedo\n" >&2
    tail -80 "$log_path" >&2 || true
    exit 1
  fi

  sleep 1
done

printf "FAIL frontend dev server nao respondeu em %s\n" "$url" >&2
tail -80 "$log_path" >&2 || true
exit 1
