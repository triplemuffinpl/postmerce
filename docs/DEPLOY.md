# Deploy

Deployment target: VPS behind Caddy or nginx.

## Planned Runtime

- Node.js 22 or newer.
- PostgreSQL.
- Caddy or nginx.
- systemd service for the app.
- systemd service for workers.
- FFmpeg/FFprobe installed for media stages.

## First VPS Deploy Checklist

1. Read the VPS source of truth in `vps-tm-test-cx33-1/VPS.md`.
2. Choose an isolated app directory and port.
3. Configure `.env` on the server.
4. Install dependencies.
5. Run migrations.
6. Start app service.
7. Start worker service only after queue stage exists.
8. Add Basic Auth at proxy level.
9. Add backups.

Do not deploy over an existing app or port without checking the VPS map first.
