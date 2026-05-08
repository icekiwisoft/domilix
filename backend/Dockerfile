FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache ffmpeg
RUN corepack enable && corepack prepare pnpm@10.33.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.1 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma:generate && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg
RUN apk add --no-cache ffmpeg
RUN corepack enable && corepack prepare pnpm@10.33.1 --activate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env.example ./.env.example
COPY --from=builder /app/src ./src
EXPOSE 8000
CMD ["pnpm", "start:prod"]
