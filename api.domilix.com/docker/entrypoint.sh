#!/bin/sh
set -eu

cd /var/www/html

# Ensure Laravel writable/cache directories exist at runtime
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Keep permissions compatible with php-fpm worker user
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwX storage bootstrap/cache || true

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ "${DB_CONNECTION:-}" = "mysql" ]; then
  echo "[entrypoint] Waiting for MySQL (${DB_HOST:-db}:${DB_PORT:-3306})..."
  ATTEMPT=0
  MAX_ATTEMPTS="${DB_WAIT_MAX_ATTEMPTS:-30}"

  until mysqladmin ping -h"${DB_HOST:-db}" -P"${DB_PORT:-3306}" -u"${DB_USERNAME:-root}" -p"${DB_PASSWORD:-}" --silent; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
      echo "[entrypoint] MySQL not reachable after ${MAX_ATTEMPTS} attempts, continuing startup"
      break
    fi
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
