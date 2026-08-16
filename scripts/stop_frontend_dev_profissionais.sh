#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

pid_file="${PROFISSIONAIS_FRONTEND_DEV_PID:-tmp/frontend-dev.pid}"

if [[ "$pid_file" == /* ]]; then
  pid_path="$pid_file"
else
  pid_path="$root_dir/$pid_file"
fi

if [[ ! -f "$pid_path" ]]; then
  echo "SKIP nenhum frontend dev registrado em $pid_file"
  exit 0
fi

pid="$(cat "$pid_path" || true)"

if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" >/dev/null 2>&1; then
  kill "$pid" >/dev/null 2>&1 || true
  for _ in $(seq 1 20); do
    kill -0 "$pid" >/dev/null 2>&1 || break
    sleep 0.2
  done
  echo "OK frontend dev parado (pid $pid)"
else
  echo "SKIP pid antigo nao estava ativo"
fi

rm -f "$pid_path"
