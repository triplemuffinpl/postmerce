# Deploy

Deployment target: VPS behind Caddy or nginx.

## Planned Runtime

- Node.js 22 or newer.
- PostgreSQL.
- Caddy or nginx.
- systemd service for the app.
- worker process, currently via Docker Compose service on staging.
- FFmpeg/FFprobe installed for media stages.

The current staging deploy uses Docker Compose on `tm-test-cx33-1`:

- app directory: `/srv/apps/postmerce`
- data directory: `/srv/data/postmerce`
- internal app port: `4310`
- host bind port: `127.0.0.1:4501`
- test host: `https://postmerce-91-99-63-80.sslip.io`

## First VPS Deploy Checklist

1. Read the VPS source of truth in `vps-tm-test-cx33-1/VPS.md`.
2. Choose an isolated app directory and port.
3. Configure `.env` on the server.
4. Install dependencies.
5. Run migrations.
6. Start app service.
7. Start worker service after migrations.
8. Add Basic Auth at proxy level.
9. Add backups.

Do not deploy over an existing app or port without checking the VPS map first.

## Deploy Command

From the local repo:

```powershell
.\scripts\deploy-vps.ps1
```

The script deploys the current `HEAD`, not uncommitted files. It creates `.env.server`
on the VPS if missing, preserves it on later deploys, runs migrations, then starts
the `app` and `worker` Compose services.

## Caddy Route

The test host should reverse proxy to:

```text
127.0.0.1:4501
```

Use proxy-level Basic Auth for the private panel until SaaS auth exists.
