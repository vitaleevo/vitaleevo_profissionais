#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
project_name="$(basename "$project_root")"
container_name="${COMPOSE_TEST_CONTAINER_NAME:-${project_name}-rails-test}"

cd "$project_root"

cleanup() {
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  docker compose down >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker compose build web
docker rm -f "$container_name" >/dev/null 2>&1 || true
docker compose down
docker compose up -d db
docker compose run -d --name "$container_name" -e RAILS_ENV=test web sleep 600 >/dev/null

docker exec "$container_name" bundle install
docker exec "$container_name" bin/rails db:drop db:create db:schema:load
docker exec "$container_name" bin/rails test "$@"
