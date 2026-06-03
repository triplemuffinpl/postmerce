# Operations

## Local Commands

```powershell
npm install
docker compose -f docker-compose.dev.yml up -d
npm run migrate
npm run typecheck
npm run lint
npm run dev:app
npm run dev:marketing
npm run migrate
npm run worker
npm run worker:once
```

## Healthcheck

The app exposes:

```text
GET /health
```

It checks the app process and database connectivity. Storage and worker heartbeat checks should be added with the media and worker stages.

## Media Storage

Local uploads live under `STORAGE_ROOT`, defaulting to `./storage` relative to the running app process.

Expected directories:

- `uploads/`
- `thumbnails/`
- `temp/`
- `logs/`
- `backups/`

These folders are runtime data and are ignored by Git.

## Workers

Workers run as separate processes and must be safe to restart.

Current staging uses a Docker Compose `worker` service with:

```text
node apps/app/dist/workers/publish-worker.js
```

Useful local smoke command:

```powershell
npm run worker:once
```

The worker:

- claims due `publish_jobs` with PostgreSQL row locks,
- marks targets as `publishing`,
- uses the dry-run publisher while `DRY_RUN=true`,
- marks successful targets as `simulated`,
- writes `worker_heartbeats`,
- retries retryable failures with the policy in `src/services/retry.ts`.

Manual retry/cancel actions are available at:

```text
GET /jobs
```

## VPS Staging

Current staging host:

```text
https://staging.postmerce.pl
```

Deploy from a clean committed local tree:

```powershell
.\scripts\deploy-vps.ps1
```

The app runs on the second Hetzner VPS in Docker Compose under
`/srv/apps/postmerce`; runtime data lives under `/srv/data/postmerce`.
Administration goes through Tailscale SSH:

```powershell
tailscale ssh ops@tm-levelsio-cax11
```

## Logs

Never log secrets. Platform events and app logs should store redacted payloads.

## Backups

PostgreSQL dumps should be stored outside the repo under VPS storage backup paths. Keep restore instructions close to the deploy target once the VPS path is chosen.
