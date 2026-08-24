FROM node:22.23.2-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM dependencies AS builder

COPY . .
ENV DATABASE_URL="postgresql://user:password@127.0.0.1:5432/pawpass"
RUN pnpm build

FROM node:22.23.2-bookworm-slim AS runtime

ENV NODE_ENV="production"
ENV HOSTNAME="0.0.0.0"
ENV PORT="8080"

WORKDIR /app

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/messages ./messages
COPY --from=builder --chown=node:node /app/next.config.ts ./next.config.ts

USER node
EXPOSE 8080

CMD ["./node_modules/.bin/next", "start", "-p", "8080"]
