# Postmerce

Postmerce is a private-first social publishing system for Wojtek and Triple Muffin.

The current goal is a working personal product:

- upload one video,
- prepare per-platform captions and options,
- schedule or publish through a worker,
- see target-level status, retries and errors,
- keep the core ready for a future SaaS without building SaaS overhead too early.

## Stack Decision

- Public marketing site: Astro.
- Product app: TypeScript + Fastify monolith.
- Database: PostgreSQL.
- Queue: PostgreSQL-backed jobs.
- Workers: TypeScript CLI processes under systemd on VPS.
- Reverse proxy: Caddy or nginx.
- Media: local VPS storage first, abstracted enough for later S3/MinIO.

## Repository Layout

```text
apps/
  marketing/  Astro site for postmerce.pl
  app/        Fastify app, panel, API, workers, migrations
docs/         architecture, operations and API notes
scripts/      local/deploy helper scripts
```

## Platform Onboarding

The detailed Polish checklist for Triple Muffin social accounts, developer
applications, OAuth, reviews and Postmerce connection is in:

[docs/PLATFORM_ONBOARDING_PL.md](docs/PLATFORM_ONBOARDING_PL.md)

## Marketing and Content

The current positioning, website copy, content plan, ready-to-use assets and
claim guardrails are in:

[docs/marketing/README.md](docs/marketing/README.md)

## First Local Run

```powershell
npm install
Copy-Item .env.example .env
docker compose -f docker-compose.dev.yml up -d
npm run migrate
npm run dev:marketing
npm run dev:app
```

The app uses PostgreSQL through `docker-compose.dev.yml` for local development. Dry-run mode is enabled by default.

## Working Rules

Read `AGENTS.md` before making changes. Keep the product simple, but keep the core clean: typed contracts, no token logging, no direct publishing inside HTTP requests, and no broad rewrites without a concrete reason.
