# Docker quick start

This repo now has Docker setup for frontend + backend (PHP-FPM + Nginx) + MySQL.

## Services

- `frontend` (Vite build served by Nginx) -> `http://localhost:3000`
- `backend` (Laravel PHP-FPM runtime)
- `backend-nginx` (Nginx serving Laravel) -> `http://localhost:8000`
- `db` (MySQL 8) -> `localhost:3307`

## Run

From repository root:

```bash
docker compose up --build
```

## Stop

```bash
docker compose down
```

## Notes

- Backend uses `api.domilix.com/.env` plus Docker overrides for DB host/credentials.
- Backend container entrypoint runs project initialization automatically:
  - waits for MySQL
  - `php artisan key:generate` (if needed)
  - `php artisan migrate --force`
  - `php artisan storage:link`
- MySQL credentials used by Docker compose:
  - database: `domilis`
  - user: `domilix`
  - password: `domilix`
  - root password: `root`

## Production with external Traefik

Use split production compose files:

- `deploy/docker-compose.domilix.com.yml` (frontend)
- `deploy/docker-compose.api.domilix.com.yml` (backend + db)

1. Create production env file:

```bash
cp deploy/.env.production.example deploy/.env.production
```

2. Fill your real values (images, domains, DB passwords).

3. Start production stack:

```bash
docker compose --env-file deploy/.env.production -f deploy/docker-compose.domilix.com.yml up -d
docker compose --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml up -d
```

These compose files attach `frontend` and `backend-nginx` to your external Traefik network and expose routes via labels (no direct host ports required).
