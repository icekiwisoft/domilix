# Domilix Frontend (`domilix.com`)

Frontend web app built with **Next.js 16**, **App Router**, **MDX**, and **Zustand**.

## Stack

- Next.js 16
- React 18
- Tailwind CSS
- Zustand for client state
- Axios for API calls
- MDX for legal pages

## Requirements

- Node.js 20+
- pnpm 10+

## Environment

Create a local env file from the example:

```bash
cp .env.example .env
```

Main variables:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here`

## Local development

```bash
pnpm install
pnpm dev
```

App URL:

```bash
http://localhost:3000
```

## Build

```bash
pnpm build
```

## Production start

```bash
pnpm start
```

## Useful routes

- `/houses`
- `/search`
- `/favorite`
- `/subscriptions`
- `/privacy-policy`
- `/cgu`
- `/mentions-legales`

## Notes

- The frontend talks directly to the Nest backend root URL, without `/api` in the base URL.
- Authentication state is handled with Zustand.
- Routing is handled with the Next App Router.
- Legal pages are written in MDX.
