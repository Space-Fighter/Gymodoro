#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull origin main

echo "==> Building images"
docker compose build

echo "==> Running database migrations (direct connection)"
set -a
source backend/.env
set +a
docker compose run --rm -e DATABASE_URL="$DIRECT_DATABASE_URL" backend npx prisma migrate deploy

echo "==> Starting containers"
docker compose up -d

echo "==> Removing unused old images"
docker image prune -f

echo "==> Done"
docker compose ps
