# Domilix Monorepo

Domilix is split into two applications in the same repository:

- `domilix.com` - frontend (React + Vite)
- `api.domilix.com` - backend (Laravel + JWT)

## Repository Structure

- `domilix.com/` frontend app
- `api.domilix.com/` backend API app
- `deploy/` production compose files and deployment config
- `.github/workflows/` CI, Docker publish, and CD pipelines

## Quick Start (Docker, recommended)

From repository root:

```bash
docker compose up --build
```

Local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api/documentation`
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

Production is split into 2 independent stacks:

- `deploy/docker-compose.domilix.com.yml` for frontend
- `deploy/docker-compose.api.domilix.com.yml` for backend + db

Create environment file once:

```bash
cp deploy/.env.production.example deploy/.env.production
```

Minimum required values in `deploy/.env.production`:

- `FRONTEND_IMAGE`
- `BACKEND_IMAGE`
- `FRONTEND_HOST`
- `BACKEND_HOST`
- `DB_ROOT_PASSWORD`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_KEY`
- `JWT_SECRET`
- `APP_URL=https://api.domilix.com`

Deploy frontend:

```bash
docker compose --env-file deploy/.env.production -f deploy/docker-compose.domilix.com.yml up -d
```

Deploy backend:

```bash
docker compose --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml up -d
```

## CI/CD Overview

- `CI`: frontend lint/build + backend tests + swagger generation
- `Docker Publish`: builds and pushes frontend/backend images to GHCR
- `CD`: deploys frontend and backend independently on VPS (`/opt/domilix`)

## Useful Commands (VPS)

Backend stack status:

```bash
cd /opt/domilix
docker compose -p domilix_backend --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml ps
```

Backend logs:

```bash
docker compose -p domilix_backend --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml logs -f backend backend-nginx db
```

Laravel application logs:

```bash
docker compose -p domilix_backend --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml exec backend sh -lc 'tail -n 200 storage/logs/laravel.log'
```

## Troubleshooting

- `manifest unknown` during deploy:
  - run `Docker Publish` first, then CD
  - ensure image tag in deploy matches published tag
- Swagger page mixed-content (`http` assets on `https`):
  - verify `APP_URL=https://api.domilix.com`
  - set `L5_SWAGGER_USE_ABSOLUTE_PATH=false`
  - clear config cache and restart backend
- `Please provide a valid cache path`:
  - ensure storage/cache directories exist and are writable
  - redeploy latest backend image (entrypoint handles this)

## Additional Docs

- `CI_CD.md`
- `DOCKER.md`
- `domilix.com/README.md`
- `api.domilix.com/README.md`
