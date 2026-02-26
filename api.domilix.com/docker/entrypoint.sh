#!/bin/sh
set -eu

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ "${DB_CONNECTION:-}" = "mysql" ]; then
  echo "[entrypoint] Waiting for MySQL (${DB_HOST:-db}:${DB_PORT:-3306})..."
  until mysqladmin ping -h"${DB_HOST:-db}" -P"${DB_PORT:-3306}" -u"${DB_USERNAME:-root}" -p"${DB_PASSWORD:-}" --silent; do
    sleep 2
  done
fi

if [ -f artisan ]; then
  if [ -z "${APP_KEY:-}" ]; then
    php artisan key:generate --force || true
  fi

  php artisan migrate --force || true
  php artisan storage:link || true
fi

exec "$@"
