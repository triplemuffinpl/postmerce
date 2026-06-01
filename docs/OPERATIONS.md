# Operations

## Local Commands

```powershell
npm install
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

## Workers

Workers should run as separate processes under systemd on VPS. The worker must be safe to restart.

## Logs

Never log secrets. Platform events and app logs should store redacted payloads.

## Backups

PostgreSQL dumps should be stored outside the repo under VPS storage backup paths. Keep restore instructions close to the deploy target once the VPS path is chosen.
