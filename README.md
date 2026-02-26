# Domilix Monorepo

This repository contains:

- `domilix.com` -> frontend (React + Vite)
- `api.domilix.com` -> backend (Laravel)

## Run the app (recommended: Docker)

From repository root:

```bash
docker compose up --build
```

Access:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- MySQL: `localhost:3307`

Stop:

```bash
docker compose down
```

## Production deploy (Traefik)

Production uses split compose files in `deploy/`:

- `deploy/docker-compose.domilix.com.yml` (frontend)
- `deploy/docker-compose.api.domilix.com.yml` (backend + db)

Prepare env file:

```bash
cp deploy/.env.production.example deploy/.env.production
```

Then start both stacks:

```bash
docker compose --env-file deploy/.env.production -f deploy/docker-compose.domilix.com.yml up -d
docker compose --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml up -d
```
