# CI/CD setup (Frontend + Backend)

This repository now includes 2 GitHub Actions workflows:

- `.github/workflows/ci.yml`: quality checks on pull requests/pushes
- `.github/workflows/cd.yml`: deployment on push to `main`/`master`

## CI

### Frontend (`domilix.com`)
- Install dependencies (`pnpm install --frozen-lockfile`)
- Lint (`eslint`)
- Build (`pnpm run build`)

### Backend (`api.domilix.com`)
- Validate composer config
- Install dependencies
- Prepare Laravel env for CI
- Run `php artisan test` with SQLite

## CD

The deployment workflow deploys only the app that changed:

- If `domilix.com/**` changed -> deploy frontend build (`dist/`) via rsync
- If `api.domilix.com/**` changed -> deploy backend source via rsync + run Laravel deploy commands

## Required GitHub secrets

Set these in repository settings (`Settings > Secrets and variables > Actions`):

- `VPS_SSH`: private SSH key (workflow uses `root@domilix.com`)

Deployment paths are fixed in workflow:

- Frontend static files: `/opt/domilix/domilix.com/dist/`
- Backend source/app: `/opt/domilix/api.domilix.com/`

Optional:

- `FRONTEND_POST_DEPLOY_CMD`: command run on server after frontend upload (example: reload nginx)
- `BACKEND_POST_DEPLOY_CMD`: command run on server after backend deploy (example: `sudo systemctl reload php8.2-fpm`)

## Notes

- Backend rsync excludes: `.env`, `vendor`, `node_modules`, `storage/logs`
- Keep your production `.env` on the server (not in git)
- Adjust deployment commands in `.github/workflows/cd.yml` if your infra differs (Docker, Forge, etc.)
