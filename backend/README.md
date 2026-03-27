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
- `JWT_SECRET=change-me`
- `JWT_REFRESH_SECRET=change-me-too`
- `MAPBOX_ACCESS_TOKEN=`

## Swagger

- `http://localhost:8000/swagger`

## Docker deployment notes

- The backend container reads a full `DATABASE_URL` directly.
- Do not rebuild `DATABASE_URL` from separate pieces inside the app.
- If the MySQL password contains special characters like `@`, `#`, `%`, `:`, or `/`, it must be URL-encoded.

Example:

```env
DATABASE_URL=mysql://domilix:MyP%40ss%232026@db:3306/domilix
```

- The deployment compose uses MySQL 8 with `mysql_native_password` enabled for compatibility.
- If an existing MySQL user was created with another auth plugin, update it manually:

```sql
ALTER USER 'domilix'@'%' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

## Production deploy env

The deploy stack expects these values in `deploy/.env.production`:

- `BACKEND_IMAGE`
- `DB_ROOT_PASSWORD`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MAPBOX_ACCESS_TOKEN`

## Notes

- Le backend expose directement ses routes a la racine (`/auth/...`, `/announces/...`, etc.).
- This is a real Nest + Prisma migration, not a proxy.
- Public read endpoints are migrated first.
- Write/auth/payment/upload endpoints still need parity work before Laravel can be fully retired.
