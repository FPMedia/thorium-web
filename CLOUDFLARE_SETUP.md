# Cloudflare Workers Setup

This app is a Next.js 15 App Router project deployed to **Cloudflare Workers** via OpenNext (`@opennextjs/cloudflare`). It is not Cloudflare Pages.

| Worker | Git branch | R2 cache | Role |
|--------|------------|----------|------|
| `thorium-web` | `main` | `thorium-web-cache` | Production |
| `thorium-web-staging` | `staging` | `thorium-web-cache-staging` | Staging + PR previews |

Books are gated by **Firebase Auth** (`/read/*` requires a session cookie). There is no payment or purchase check.

## Environment variables

`NEXT_PUBLIC_*` values are **inlined at `next build`**. They must exist as Workers Builds **Build variables and secrets**, not only as Worker runtime vars.

Runtime vars/secrets are set per Worker in **Settings → Variables and Secrets**. Deploy with `--keep-vars` so Wrangler does not wipe dashboard values.

### Build-time (Workers Builds)

Set on both production and staging build configs:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `MANIFEST_ROUTE_FORCE_ENABLE` (only if you enable `/read/manifest/*` in production)
- `ASSET_PREFIX` (optional CDN / subdirectory)

### Runtime (Worker settings)

- `MANIFEST_ALLOWED_DOMAINS` — comma-separated hosts, or `*`
- `MANIFEST_ROUTE_FORCE_ENABLE` — also needed at runtime if the manifest route is enabled

There are no Worker secrets required after the paywall was removed. Do not put credentials in [`wrangler.jsonc`](wrangler.jsonc).

### Local

1. Copy [`.env.example`](.env.example) to `.env.local` and fill in Firebase client values.
2. Copy [`.dev.vars.example`](.dev.vars.example) to `.dev.vars` (`NEXTJS_ENV=development`) for `pnpm preview`.

See [docs/EnvironmentVariables.md](docs/EnvironmentVariables.md).

## Workers Builds (recommended CD)

Reconnect git on Worker `thorium-web` (it was used previously on `develop`, then stopped). Use **`main` as the production branch**.

Package manager: **pnpm**. Node: **22** ([`.nvmrc`](.nvmrc)). Root: repository root.

### Production Worker `thorium-web`

| Setting | Value |
|---------|--------|
| Production branch | `main` |
| Non-production branch builds | Off |
| Build command | `npx @opennextjs/cloudflare build` |
| Deploy command | `npx @opennextjs/cloudflare deploy -- --keep-vars` |

### Staging Worker `thorium-web-staging`

Create the Worker if it does not exist, then connect the same repository.

| Setting | Value |
|---------|--------|
| Production branch | `staging` |
| Non-production branch builds | On (PR preview URLs) |
| Build command | `npx @opennextjs/cloudflare build` |
| Deploy command | `npx @opennextjs/cloudflare deploy -- --env staging --keep-vars` |
| Non-prod / preview command | `npx @opennextjs/cloudflare upload -- --env staging --keep-vars` |

Duplicate the Firebase **build** variables on the staging build config.

## GitHub Actions (CI)

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `pnpm lint` and `pnpm typecheck` on pull requests and pushes to `main`. Protect `main` so it cannot merge with a red CI check. Workers Builds does not wait for GitHub Actions.

## Manual / emergency CLI

```bash
pnpm deploy            # production Worker, keep dashboard vars
pnpm deploy:staging    # staging Worker
pnpm logs              # wrangler tail
```

## Viewing logs

```bash
pnpm logs
# or
wrangler tail --format pretty
```
