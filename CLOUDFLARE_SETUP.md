# Cloudflare Workers Setup Guide

## Required Environment Variables

### Public Variables (in `wrangler.jsonc`)

These can be set in `wrangler.jsonc` under the `vars` section:

- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_MODE` (sandbox or production)

### Public Firebase Variables (build-time)

These are embedded at build time via Next.js environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Secrets (via Cloudflare Dashboard or Wrangler CLI)

These should **NOT** be in `wrangler.jsonc` for security reasons. Set them as secrets:

#### `FIREBASE_SERVICE_ACCOUNT_KEY`

This is required for server-side Firestore operations (like the ITN endpoint).

**To set via Wrangler CLI:**

```bash
# Get your Firebase service account JSON file first
# Then set it as a secret (the entire JSON as a string)
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
```

When prompted, paste the entire JSON content from your Firebase service account key file.

**To set via Cloudflare Dashboard:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Workers & Pages → Your Worker (`thorium-web`)
3. Go to Settings → Variables and Secrets
4. Under "Secrets", click "Add secret"
5. Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
6. Value: Paste the entire JSON content from your Firebase service account key

**Getting the Firebase Service Account Key:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy the entire JSON content and use it as the secret value

## Troubleshooting ITN 500 Errors

If the ITN endpoint (`/api/payment/itn`) is returning 500 errors, check:

1. **Is `FIREBASE_SERVICE_ACCOUNT_KEY` set?**
   ```bash
   # View your secrets (names only, not values)
   wrangler secret list
   ```

2. **Check logs for the specific error:**
   ```bash
   pnpm logs
   # Or
   wrangler tail --format pretty
   ```

3. **Common errors:**
   - `FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set` → Secret is missing
   - `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY` → JSON is malformed (check for encoding issues)
   - `Failed to authenticate with Google` → Service account key is invalid or expired
   - `Failed to create purchase` → Firestore permissions or network issue

## Viewing Logs

### Real-time logs:
```bash
pnpm logs
# Or
wrangler tail --format pretty
```

### Filter for ITN errors:
```bash
wrangler tail --format pretty | grep -i "ITN\|payment/itn\|Error processing ITN"
```

### JSON format (for parsing):
```bash
pnpm logs:json
```

## Deploying Changes

After setting secrets, you may need to redeploy:

```bash
pnpm deploy
```

Or if using the upload command:

```bash
pnpm upload
```
