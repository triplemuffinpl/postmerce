FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json eslint.config.js ./
COPY apps/app/package.json apps/app/tsconfig.json ./apps/app/
COPY apps/marketing/package.json ./apps/marketing/package.json

RUN npm ci

COPY apps/app ./apps/app

RUN npm run build -w @postmerce/app
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/app/package.json ./apps/app/package.json
COPY --from=build /app/apps/app/dist ./apps/app/dist
COPY --from=build /app/apps/app/public ./apps/app/public
COPY --from=build /app/apps/app/migrations ./apps/app/migrations

CMD ["node", "apps/app/dist/server.js"]
