# CI/CD setup (Frontend + Backend)

This repository now includes 2 GitHub Actions workflows:

- `.github/workflows/ci.yml`: quality checks on pull requests/pushes
- `.github/workflows/cd.yml`: deployment after `Docker Publish` succeeds (or manual trigger)

## CI

### Frontend (`domilix.com`)
- Install dependencies (`npm ci`)
- Lint (`eslint`)
- Build (`npm run build`)

### Backend (`api.domilix.com`)
- Validate composer config
- Install dependencies
- Prepare Laravel env for CI
- Run `php artisan test` with SQLite

## CD

The deployment workflow is Dockerized:

- If `domilix.com/**`, `api.domilix.com/**`, `deploy/**`, or `.github/workflows/cd.yml` changes,
  it uploads `deploy/` files to `/opt/domilix/deploy/` and runs independent jobs:
  - Frontend job: `docker compose -p domilix_frontend --env-file deploy/.env.production -f deploy/docker-compose.domilix.com.yml pull && up`
  - Backend job: `docker compose -p domilix_backend --env-file deploy/.env.production -f deploy/docker-compose.api.domilix.com.yml pull && up`

## Required GitHub secrets

Set these in repository settings (`Settings > Secrets and variables > Actions`):

- `VPS_SSH`: private SSH key (workflow uses `root@domilix.com`)
- `GHCR_USERNAME`: GitHub username (or bot user) for GHCR login on VPS
- `GHCR_TOKEN`: GitHub token/PAT with `read:packages` for GHCR pull

If `GHCR_USERNAME`/`GHCR_TOKEN` are not set, CD falls back to `${GITHUB_TOKEN}` and `${{ github.actor }}`.

Deployment paths are fixed in workflow:

- Deploy stack root: `/opt/domilix/`
- Compose files path: `/opt/domilix/deploy/`

Optional:

- `POST_DEPLOY_CMD`: command run after `docker compose up` (example: `docker image prune -f`)

## Notes

- `deploy/.env.production` is not overwritten by workflow.
- If missing, workflow auto-creates it from `deploy/.env.production.example`.
- Keep production values in `/opt/domilix/deploy/.env.production` on server.
- Workflow auto-rewrites `ghcr.io/your-org/...` to `ghcr.io/<repo-owner>/...` in `deploy/.env.production`.
