#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

image="${PROFISSIONAIS_SCREENSHOT_DOCKER_IMAGE:-mcr.microsoft.com/playwright:v1.57.0-noble}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output_dir="${PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR:-tmp/demo-screenshots/${timestamp}}"
base_url="${PROFISSIONAIS_SCREENSHOT_BASE_URL:-${PROFISSIONAIS_SMOKE_API_BASE_URL:-}}"
docker_network="${PROFISSIONAIS_SCREENSHOT_DOCKER_NETWORK:-}"

function fail() {
  printf "FAIL %s\n" "$1" >&2
  exit 1
}

function absolute_path() {
  local path="$1"

  if [[ "$path" == /* ]]; then
    printf "%s" "$path"
  else
    printf "%s/%s" "$root_dir" "$path"
  fi
}

command -v docker >/dev/null 2>&1 || fail "docker e obrigatorio para capturar screenshots"

host_output_dir="$(absolute_path "$output_dir")"
mkdir -p "$host_output_dir"

network_args=()
if [[ -n "$docker_network" ]]; then
  network_args=(--network "$docker_network")
else
  network_args=(--network host)
fi

if [[ -z "$base_url" ]]; then
  base_url="http://127.0.0.1:3001"
fi

container_output_dir="/workspace/${host_output_dir#"$root_dir"/}"

docker run --rm \
  "${network_args[@]}" \
  -v "$root_dir:/workspace" \
  -w /workspace \
  -e PROFISSIONAIS_SCREENSHOT_BASE_URL="$base_url" \
  -e PROFISSIONAIS_SCREENSHOT_API_BASE_URL="${PROFISSIONAIS_SCREENSHOT_API_BASE_URL:-http://127.0.0.1:3000}" \
  -e PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR="$container_output_dir" \
  -e PROFISSIONAIS_SCREENSHOT_CHROME_BIN=/ms-playwright/chromium-1200/chrome-linux64/chrome \
  -e PROFISSIONAIS_SCREENSHOT_AUTHENTICATED="${PROFISSIONAIS_SCREENSHOT_AUTHENTICATED:-true}" \
  -e PROFISSIONAIS_SCREENSHOT_CLIENT_EMAIL="${PROFISSIONAIS_SCREENSHOT_CLIENT_EMAIL:-ana.manuel@example.com}" \
  -e PROFISSIONAIS_SCREENSHOT_PROFESSIONAL_EMAIL="${PROFISSIONAIS_SCREENSHOT_PROFESSIONAL_EMAIL:-joaquim@conectaangola.ao}" \
  -e PROFISSIONAIS_SCREENSHOT_ADMIN_EMAIL="${PROFISSIONAIS_SCREENSHOT_ADMIN_EMAIL:-admin@conectaangola.ao}" \
  -e PROFISSIONAIS_SCREENSHOT_PASSWORD="${PROFISSIONAIS_SCREENSHOT_PASSWORD:-Conecta123!}" \
  "$image" \
  node scripts/qa/capture_profissionais_demo_screenshots.mjs

printf "OK screenshots gerados em %s\n" "$host_output_dir"
