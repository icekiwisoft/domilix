# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm start        # Run production build
pnpm lint         # ESLint check
```

No test suite is configured.

## Environment

Copy `.env.example` to `.env`. Required variables:

- `NEXT_PUBLIC_API_BASE_URL` — backend root URL (e.g. `http://localhost:8000`). **Do not include a trailing `/api`**; the service layer appends paths directly.
- `NEXT_PUBLIC_GEOAPIFY_API_KEY` — Geoapify token for address search and maps.

## Architecture

### Page / View split

Next.js App Router pages live in `src/app/`. Each page is a thin shell that renders a view component from `src/views/`. The actual UI logic belongs in the view, not the page file.

### API layer (`src/services/`)

All HTTP calls go through the singleton Axios instance in `src/services/api.ts`. It:
- Reads the JWT from Zustand and injects it as `Authorization: Bearer …` on every request.
- Proactively refreshes expired tokens before the request is sent (deduplicating concurrent refresh calls).
- Calls `clearAuthState()` on refresh failure, logging the user out.

Domain-specific modules (`authApi.ts`, `announceApi.ts`, `favoritesApi.ts`, etc.) import from `api.ts` and export typed functions — never call `axios` directly.

### State management (`src/stores/defineStore.ts`)

Two Zustand stores, both with `persist` middleware writing to `localStorage`:

- **`useAuthStore`** — `token`, `user`, `authData` (status: `'unknow' | 'guess' | 'logged'`), hydration flags. On rehydration, `syncAuthFromToken` re-derives `authData` from the stored JWT.
- **`useUiStore`** — `signinModal` open state, toast-style `message`, `theme`.

Non-component code (e.g. service interceptors) must use the action helpers (`getAuthToken`, `setAuthToken`, `clearAuthState`, …) exported from the same file rather than calling hooks.

### Auth initialization

`AppBootstrap` (rendered in the root layout) waits for Zustand hydration (`hasHydrated`), then calls `useAuth().authenticate()` which hits `GET /auth/me` to validate the stored token and populate the user. The app renders `null` until hydration is complete, preventing a flash of unauthenticated state.

### Protected routes

`ProtectedRoute` redirects unauthenticated users to `/401`. The global `SigninDialog` is mounted in `AppBootstrap` and toggled via `useUiStore`.

### Media URLs

Backend-stored file paths are relative (e.g. `/storage/…`). Always run them through `mediaUrl()` from `src/utils/mediaUrl.ts` before rendering — it prepends the correct origin for both dev and prod.

### Path aliases

Configured in `tsconfig.json`:

| Alias | Resolves to |
|---|---|
| `@components/*` | `src/components/*` |
| `@hooks/*` | `src/hooks/*` |
| `@services/*` | `src/services/*` |
| `@stores/*` | `src/stores/*` |
| `@utils/*` | `src/utils/*` |
| `@assets/*` | `src/assets/*` |
| `@pages/*` | `src/views/*` |
| `@router` | `src/lib/router` |

### Legal pages

`src/app/(legal)/` is a route group with an MDX layout. Legal content is authored in `.mdx` files; adding a new legal page means creating a `.mdx` file in that group.

## Conventions

- Named components must use **function declarations**, not arrow functions (ESLint enforces this).
- All client-only code (stores, hooks, components using browser APIs) must include `'use client'` at the top.
- Imports are ordered: external → internal aliases → relative. ESLint enforces the order and requires a blank line between groups.
- TypeScript build errors are currently ignored (`ignoreBuildErrors: true`); the project relies on the editor/ESLint for type safety during development.
- `no-console` is a warning — avoid `console.log` in committed code.
