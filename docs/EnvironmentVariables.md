# Environment Variables

Copy [`.env.example`](../.env.example) to `.env.local` for local development. Never commit `.env`, `.env.local`, or `.dev.vars`.

Next.js `NEXT_PUBLIC_*` variables are **inlined at `next build`**. On Cloudflare they must be set as Workers Builds **build** variables. Other values used only in server/request code are **runtime** Worker vars (dashboard). See [CLOUDFLARE_SETUP.md](../CLOUDFLARE_SETUP.md).

## Firebase (required)

Used by the client SDK and to verify ID tokens on the server (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`).

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Set these in `.env.local` and as Workers Builds build variables for `thorium-web` and `thorium-web-staging`.

## Manifest

By default, the `/read/manifest/[base64url-encoded-manifest]` route is disabled in production. `/read/[identifier]` books are listed in `src/config/publications.ts` and require a logged-in user.

### MANIFEST_ROUTE_FORCE_ENABLE

Set to `true` to enable the manifest route in production. This is read at **build** time (`next.config.mjs` redirects) and at **runtime** (`src/app/ManifestRouteEnabled.ts`). Set it in both Workers Builds and Worker runtime vars if you enable it.

```bash
MANIFEST_ROUTE_FORCE_ENABLE=true
```

### MANIFEST_ALLOWED_DOMAINS

Comma-separated list of allowed domains for manifest URLs. Runtime Worker var.

```bash
MANIFEST_ALLOWED_DOMAINS="publication-server.readium.org"
```

You can also use `*` to allow all domains.

## Assets

### ASSET_PREFIX

Set the base path for assets (CDN URL or subdirectory). Build-time only (`next.config.mjs`).

```bash
ASSET_PREFIX="https://cdn.example.com"
```

## Local development only

### ALLOWED_DEV_ORIGINS

Comma-separated origins allowed to load `/_next` assets from `next dev` (for example ngrok). Not used in production.

### NEXTJS_ENV

Put `NEXTJS_ENV=development` in `.dev.vars` (see [`.dev.vars.example`](../.dev.vars.example)) so `pnpm preview` loads Next.js development env files.
