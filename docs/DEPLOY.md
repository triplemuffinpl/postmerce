# Deploy

Deployment target: VPS behind Caddy or nginx.

## Planned Runtime

- Node.js 22 or newer.
- PostgreSQL.
- Caddy or nginx.
- systemd service for the app.
- worker process, currently via Docker Compose service on staging.
- FFmpeg/FFprobe installed for media stages.

The current staging deploy uses Docker Compose on the second Hetzner VPS
`tm-levelsio-cax11`:

- app directory: `/srv/apps/postmerce`
- data directory: `/srv/data/postmerce`
- internal app port: `4310`
- host bind port: `127.0.0.1:4501`
- staging host: `https://staging.postmerce.pl`
- SSH: Tailscale address `100.109.177.115`, user `ops`

The public marketing site is static Astro output served by Caddy:

- build output: `apps/marketing/dist`
- server path: `/srv/apps/postmerce-marketing/current`
- public host: `https://postmerce.pl`
- `www.postmerce.pl` redirects to `https://postmerce.pl`

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

The staging host reverse proxies to:

```text
127.0.0.1:4501
```

Use proxy-level Basic Auth for the private panel until SaaS auth exists. Keep
`/oauth/*` reachable without Basic Auth because platform OAuth callbacks return
through the user's browser and are protected by signed `state`.

The current second VPS firewall allows public HTTP and HTTPS only from
Cloudflare IP ranges. Port `80` is open for Cloudflare so plain
`http://postmerce.pl` can reach Caddy and redirect to HTTPS instead of timing
out at the Cloudflare edge. With the current Caddy internal certificate setup,
the Cloudflare DNS record for `staging.postmerce.pl` should be proxied and
Cloudflare SSL/TLS mode should be `Full`, not `Flexible`. Use `Full (strict)`
only after adding a Cloudflare Origin Certificate or DNS-challenge certificate
automation.

Cloudflare DNS records for the second VPS:

```text
A      staging   178.104.199.11   Proxied
A      @         178.104.199.11   Proxied
CNAME  www       postmerce.pl     Proxied
```

Keep mail records DNS-only.
