#!/bin/sh
set -eu

echo "[entrypoint] Running Prisma migrations"
prisma migrate deploy

if [ "${RUN_DB_SEED:-true}" = "true" ]; then
  echo "[entrypoint] Running runtime seed"
  node ./prisma/seed-runtime.mjs
else
  echo "[entrypoint] Skipping seed (RUN_DB_SEED=${RUN_DB_SEED:-false})"
fi

echo "[entrypoint] Starting app"
exec "$@"
