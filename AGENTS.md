# AGENTS.md

This file provides guidance to AI coding agents when working with this repository.

## Project Overview

Domilix is a Cameroonian real estate platform with three sub-projects:

| Directory | Role | Stack |
|---|---|---|
| `domilix.com/` | Frontend (public site) | Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, Axios |
| `backend/` | API server | NestJS 11, Prisma, PostgreSQL, Wasabi (S3) object storage |
| `dashboard-domilix/` | Admin dashboard | React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7 |

APIs and integrations: Mapbox, Leaflet, Campay (payments), Wasabi S3.

## Commands

### Frontend (`domilix.com/`)
```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Run production build
pnpm lint         # ESLint check
```

### Backend (`backend/`)
```bash
pnpm start:dev    # Start dev with watch mode
pnpm build        # Compile (nest build)
pnpm start:prod   # Run production build
pnpm prisma:generate  # Generate Prisma client
pnpm lint         # ESLint
```

### Dashboard (`dashboard-domilix/`)
```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
```

No test suite is configured for frontend or dashboard. Backend uses Jest.

## Environment

Each sub-project requires a `.env` file (copy from `.env.example`):

- **Frontend**: `NEXT_PUBLIC_API_BASE_URL` (no `/api` suffix), `NEXT_PUBLIC_GEOAPIFY_API_KEY`
- **Backend**: Database URL, Wasabi S3 keys, Campay credentials, JWT secret
- **Dashboard**: `VITE_API_URL` (defaults to `https://api.domilix.com`)

## Architecture

### Frontend (`domilix.com/`)

- **Page/View split**: `src/app/` contains thin Next.js App Router page shells; `src/views/` contains the actual UI logic.
- **API layer**: All HTTP calls go through the singleton Axios instance in `src/services/api.ts`. Domain modules (`authApi.ts`, `announceApi.ts`, etc.) import from it — never call `axios` directly.
- **State management**: Zustand stores with `persist` middleware in `src/stores/defineStore.ts` (`useAuthStore`, `useUiStore`).
- **Auth**: JWT in localStorage, refreshed proactively by Axios interceptor. `AppBootstrap` in root layout handles hydration + token validation via `GET /auth/me`.
- **Media URLs**: Always use `mediaUrl()` from `src/utils/mediaUrl.ts` to resolve relative paths to absolute URLs.
- **Path aliases**: `@components/*`, `@hooks/*`, `@services/*`, `@stores/*`, `@utils/*`, `@assets/*`, `@pages/*` (→ `src/views/*`), `@router`.

### Backend (`backend/`)

- **Framework**: NestJS 11 with Prisma ORM.
- **Admin routes**: Under `/admin/` prefix, guarded by `AuthGuard` + `isAdmin` check.
- **Public routes**: Under `/announces`, `/maps`, `/auth`, `/subscriptions`, etc.
- **Maps module**: Separate subscription system (`MapsSubscription` model). Plans hardcoded in `maps.service.ts`.
- **Object storage**: Wasabi S3 for media. `ObjectStorageService` provides presigned URLs for private bucket access.
- **Validation**: Global `ValidationPipe({ transform: true, whitelist: true })` strips undeclared fields.

### Dashboard (`dashboard-domilix/`)

- **Admin panel** served on `admin.domilix.com`.
- **API layer**: `request<T>()` wrapper in `src/services/api.ts` with service objects (`announcesService`, `usersService`, etc.).
- **Auth**: `AuthContext` with JWT in localStorage, `ProtectedRoute` for guarded pages.
- **Styling**: Tailwind CSS v4 with custom brand palette (brand-25 through brand-700).

## Key API Contracts

### Announces (`/announces`)
- `GET /announces` — paginated list with filters (`type`, `ad_type`, `city`, `price_min`, `price_max`, `liked`, `unlocked`, `search`, `page`, `per_page`). Returns Laravel-style pagination.
- `GET /announces/:id` — single ad detail with `medias[]`, `announcer`, `liked`, `unlocked`.
- `POST /announces/:id/unlock` — unlock an ad using 1 Domicoin. Returns `{ message, unlocking, remaining_credits }`.
- `PATCH /announces/:id/like` — toggle favorite.
- `type` values: `"realestate"` or `"furniture"` (mapped from `App\Models\RealEstate` / `App\Models\Furniture`).
- `ad_type` values: `"location"` or `"sale"`.

### Maps (`/maps`)
- `GET /maps/announces` — map-specific listings with `medias[]`, `is_liked`, `is_unlocked`. Supports `is_liked=1`, `is_unlocked=1`.
- `GET /maps/listings/nearby?lat=...&lng=...&radius=...` — proximity search.
- `GET /maps/plans` — available subscription plans.
- `POST /maps/subscribe` — body `{ plan: "decouverte"|"starter"|"pro"|"business" }`.
- `GET /maps/subscription` — current subscription status.
- `POST /maps/cancel` — cancel current subscription.
- Maps plans: Découverte (free/12h), Starter (2000 FCFA/30d), Pro (5000 FCFA/30d), Business (15000 FCFA/30d).

### Media shape
```typescript
{
  id: string;
  file: string | null;      // Full URL (presigned or proxied)
  thumbnail: string | null; // Thumbnail URL
  url: string | null;       // Same as file (legacy)
  path: string | null;      // Relative storage path
  type: string | null;      // MIME type
}
```

## Coding Conventions

- **French UI** — user-facing copy is in French.
- **Named components** use function declarations, not arrow functions (ESLint enforced in frontend).
- **`'use client'`** required at top of all client-only files.
- **Imports** ordered: external → internal aliases → relative (ESLint enforced).
- **No `any`** in dashboard — explicit interfaces required.
- **Tailwind CSS v4** only in dashboard (no inline styles or CSS modules, always add `dark:` variants).
- **No `console.log`** in committed code (ESLint warning).
- **Prefer non-blocking side effects** for notifications, emails, thumbnails, analytics.

## Key Business Logic

- Domilix Maps is a separate subscription from Domicoins: Maps is for browsing properties on a map, Domicoins are for unlocking contact details.
- Media uploads go through backend → Wasabi S3 (private bucket). Read via presigned URLs (or fallback to `/storage/...`).
- Thumbnails are generated as WebP on upload. `thumbnailPath` is used if different from `originalPath`.
- Media cleanup (orphaned files) is handled via delayed/async garbage collection, not immediate deletion.

## Deployment

- Production backend API: `https://api.domilix.com` (no `/api` prefix).
- Dashboard served on `admin.domilix.com`.
- Deploy triggers are tied to `main` branch CI/CD workflows.
- Prisma migrations must be applied before new models/routes work in production.
