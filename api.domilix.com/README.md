# Domilix Backend (`api.domilix.com`)

Laravel API service.

## Local run (without Docker)

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
```

## Dockerized run (recommended)

From repository root:

```bash
docker compose up --build
```

API will be available at `http://localhost:8000`.

## Swagger

Swagger UI is available at:

- `http://localhost:8000/api/documentation`

Regenerate docs after annotations changes:

```bash
php artisan l5-swagger:generate
```
