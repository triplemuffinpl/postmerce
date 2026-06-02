# Architecture

## Shape

Postmerce is a monolith split by responsibility, not by services.

- `apps/marketing`: Astro public site for SEO, ads, docs and sales pages.
- `apps/app`: Fastify application for the private panel, API endpoints, workers and migrations.
- PostgreSQL is the source of truth.
- Publication jobs live in PostgreSQL and are processed by CLI workers.

## Main Boundaries

HTTP routes:

- render pages,
- validate form inputs,
- call services,
- never publish directly to social APIs.

Services:

- own workflow logic,
- enqueue jobs,
- classify retries,
- sanitize logs.

Platforms:

- own API-specific publishing, token refresh and account checks.
- return typed results to services.

UI:

- small page functions and components,
- no business logic,
- replaceable later by a designed UI.

## Database Queue

The queue uses PostgreSQL row locks:

```sql
SELECT *
FROM publish_jobs
WHERE status = 'pending'
  AND run_after <= now()
ORDER BY run_after ASC, id ASC
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

This gives simple multi-worker safety without RabbitMQ/Kafka.

Current flow:

- post creation can enqueue one `publish_jobs` row per target,
- workers claim due rows and lock them for a bounded time,
- dry-run publishing marks target rows as `simulated`,
- retries and manual retry/cancel stay visible in `/jobs`,
- worker liveness is recorded in `worker_heartbeats`.

## Storage

Start with local VPS storage. Media tables include disk/key/path fields so later migration to S3-compatible storage is possible.

## SaaS Later

Do not add users, workspaces, billing or teams yet. Keep models easy to extend by avoiding hard-coded assumptions that only one account can ever exist.
