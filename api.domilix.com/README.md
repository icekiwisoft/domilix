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
