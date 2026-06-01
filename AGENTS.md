# Postmerce Agent Guide

Postmerce is the private publishing product for Wojtek. It may become a SaaS later, but the current priority is a working personal system with a clean technical core.

## Read First

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/ROADMAP.md`
4. The local file or module related to the current task

Do not load the whole repository by default. Avoid `node_modules`, `dist`, `.astro`, storage folders and generated outputs unless the task requires them.

## Product Direction

Postmerce is not a WooCommerce plugin anymore.

Current product loop:

1. Upload one media asset.
2. Create one post.
3. Prepare separate platform targets.
4. Queue publication jobs.
5. Publish or dry-run through workers.
6. Inspect per-target status, logs and retries.

## Stack

- Astro for the public marketing site.
- TypeScript + Fastify for the app monolith.
- PostgreSQL for persistence and queue locking.
- FFmpeg/FFprobe for media inspection.
- Caddy or nginx on VPS.
- systemd workers.

## Code Rules

- Use strict TypeScript.
- Do not use `any`. Use explicit types, `unknown`, discriminated unions or small DTOs.
- Keep business logic outside HTTP routes.
- Keep platform API logic in `src/platforms`.
- Keep database access behind small service/repository functions.
- Keep UI replaceable: routes call page functions; pages use components; components do not publish or mutate data.
- Do not log OAuth tokens, Authorization headers, raw secrets or full request headers.
- Sanitize raw platform responses before storing them.
- Web requests may create posts, targets and jobs; workers publish.
- No direct platform publishing in a request handler.
- Add migrations for schema changes. Do not edit production data by hand.
- Prefer focused checks: typecheck, lint, and the smallest relevant runtime smoke.

## Token Budget Rules For Agents

This repo should stay agent-friendly and cheap to work in.

- Read narrowly.
- Use `rg` before opening files.
- Do not run broad test suites when a typecheck or targeted check is enough for the change.
- Do not create large docs unless they are source of truth.
- Do not introduce framework layers just because they are fashionable.
- Keep comments useful and rare.
- Prefer one clean abstraction over five speculative abstractions.

## UI Rules

The current UI is intentionally light. A designer may replace it later.

- Keep markup semantic and componentized.
- Use stable class names.
- Avoid embedding styling decisions in business logic.
- Do not make app logic depend on CSS or DOM structure.

## Security Rules

- `.env` is never committed.
- OAuth tokens are encrypted before storage.
- Uploads get random names and are never executable.
- Admin protection is expected at proxy level first: Caddy/nginx Basic Auth and optional IP allowlist.
- If in-app admin auth is added later, keep it single-admin and simple until SaaS work starts.

## Hub Updates

After meaningful work, update the parent hub memory:

`C:\Users\wojta\OneDrive\Desktop\github\things-codex\memory.md`

Keep entries short: date, what changed, files touched, validation, next step.
