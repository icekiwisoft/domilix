# Domilix Nest Backend

NestJS + Prisma migration target for `api.domilix.com`.

## Implemented now

- `GET /`
- `GET /health`
- `GET /categories`
- `GET /categories/:id`
- `GET /announcers`
- `GET /announcers/:id`
- `GET /announces`
- `GET /announces/:id`
- `GET /cities`

These endpoints use Prisma directly against the MySQL schema from Laravel.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm start:dev
```

## Environment

- `DATABASE_URL=mysql://root:@127.0.0.1:3306/domilix`
- `PORT=8000`

## Swagger

- `http://localhost:8000/swagger`

## Notes

- Le backend expose directement ses routes a la racine (`/auth/...`, `/announces/...`, etc.).
- This is a real Nest + Prisma migration, not a proxy.
- Public read endpoints are migrated first.
- Write/auth/payment/upload endpoints still need parity work before Laravel can be fully retired.
