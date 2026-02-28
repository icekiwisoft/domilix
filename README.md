# Domilix Monorepo

Domilix is split into two applications in the same repository:

- `domilix.com` - frontend (React + Vite)
- `api.domilix.com` - backend (Laravel + JWT)

## Quick Start (Docker)

Run everything from the repository root:

```bash
docker compose up --build
```

Local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger: `http://localhost:8000/api/documentation`
- MySQL: `localhost:3307`

Stop services:

```bash
docker compose down
```

## Local Development (without Docker)

Frontend:

```bash
cd domilix.com
npm ci
npm run dev
```

Backend:

```bash
cd api.domilix.com
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
```

## Production Deployment (Traefik)

Production deployment uses two compose files in `deploy/`:

- `deploy/docker-compose.domilix.com.yml` - frontend service
- `deploy/docker-compose.api.domilix.com.yml` - backend + db services

Create your production environment file:

```bash
cp deploy/.env.production.example deploy/.env.production
```

Start/update frontend stack:

```bash
docker compose --env-file deploy/.env.production -f deploy/docker-compose.domilix.com.yml up -d
```

Start/update backend stack:

```bash
docker compose --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml up -d
```

## CI/CD Overview

- `CI` runs lint/build (frontend) and tests + swagger generation (backend)
- `Docker Publish` builds and pushes frontend/backend images to GHCR
- `CD` deploys frontend and backend independently on VPS using Docker Compose

See also:

- `CI_CD.md`
- `DOCKER.md`
