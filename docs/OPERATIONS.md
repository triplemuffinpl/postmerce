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

Workers should run as separate processes under systemd on VPS. The worker must be safe to restart.

## VPS Staging

Current staging host:

```text
https://postmerce-91-99-63-80.sslip.io
```

Deploy from a clean committed local tree:

```powershell
.\scripts\deploy-vps.ps1
```

The app runs in Docker Compose under `/srv/apps/postmerce`; runtime data lives under `/srv/data/postmerce`.

## Logs

Never log secrets. Platform events and app logs should store redacted payloads.

## Backups

PostgreSQL dumps should be stored outside the repo under VPS storage backup paths. Keep restore instructions close to the deploy target once the VPS path is chosen.
