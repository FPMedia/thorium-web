# Local Development with Readium CLI

This guide explains how to use Thorium Web with a local Readium CLI server for development and testing.

## Prerequisites

- Readium CLI installed and running (see [Readium CLI documentation](https://github.com/readium/go-toolkit/tree/main/cmd/readium))
- Thorium Web development environment set up

## Configuration

### Environment Variables

The `.env.local` file has been configured with:

```bash
MANIFEST_ALLOWED_DOMAINS=localhost
MANIFEST_ROUTE_FORCE_ENABLE=true
```

This configuration:
- Allows manifest URLs from localhost
- Enables the `/read/manifest/[base64url]` route for direct manifest URL testing

## Adding Publications to Readium CLI

### Step 1: Add EPUB Files

Place your EPUB files in the directory where Readium CLI is monitoring, or use the Readium CLI command to serve a specific EPUB:

```bash
readium manifest /path/to/your/book.epub
```

### Step 2: Get the Manifest URL

When Readium CLI processes an EPUB, it outputs metadata including the manifest URL. For example:

```bash
readium manifest ./books/hanis_assassin.epub | jq
```

This will show you the full manifest with the `conformsTo` field containing the manifest URL pattern.

You can also construct the URL directly:
```bash
# Get the base64url-encoded filename
FN=$(printf "%s" "hanis_assassin.epub" | base64 | tr '+/' '-_' | tr -d '=')

# The manifest URL will be:
echo "http://localhost:15080/$ID/manifest.json"
```

To get the manifest URL from the Readium CLI server:

```bash
# First, check what publications are available
curl http://localhost:15080/$ID/manifest.json
```

### Step 3: Add to Publications Configuration

Edit `src/config/publications.ts` and add your publication:

```typescript
export const PUBLICATION_MANIFESTS = {
  // Your local publication
  "your-book-id": "http://localhost:15080/[encoded-id]/manifest.json",
  
  // Existing publications...
  "hanis-assassin": "http://localhost:15080/a6FuaXNfYXNzYXNzaW4uZXB1Yg/manifest.json",
} as const;
```

The identifier (e.g., "your-book-id") can be any valid string you want to use in the URL.

### Step 4: Access Your Publication

Navigate to:
```
http://localhost:3000/read/your-book-id
```

## Alternative: Using the Manifest Route

For quick testing without modifying `publications.ts`, you can use the direct manifest route:

### Step 1: Get Your Manifest URL

From Readium CLI, identify your manifest URL:
```
http://localhost:15080/[encoded-id]/manifest.json
```

### Step 2: Encode the URL

Base64url-encode the manifest URL:

```bash
# Using Node.js
node -e "console.log(Buffer.from('http://localhost:15080/a6FuaXNfYXNzYXNzaW4uZXB1Yg/manifest.json').toString('base64url'))"

# Or using Python
python3 -c "import base64; print(base64.urlsafe_b64encode(b'http://localhost:15080/a6FuaXNfYXNzYXNzaW4uZXB1Yg/manifest.json').decode().rstrip('='))"
```

### Step 3: Open in Thorium Web

Navigate to:
```
http://localhost:3000/read/manifest/[base64url-encoded-manifest-url]
```

For example:
```
http://localhost:3000/read/manifest/aHR0cDovL2xvY2FsaG9zdDoxNTA4MC9hNkZ1YVhOZllYTnpZWE56YVc0dVpYQjFZZy9tYW5pZmVzdC5qc29u
```

## Verifying Your Setup

### Check Readium CLI is Running

```bash
# Test the manifest endpoint
curl http://localhost:15080/a6FuaXNfYXNzYXNzaW4uZXB1Yg/manifest.json

# Should return a JSON manifest with publication metadata
```

### Check Thorium Web Configuration

1. Ensure `.env.local` exists in the `thorium-web/` directory
2. Restart your Next.js development server if it's already running:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   pnpm dev
   ```

### Test the Connection

1. Open your browser's developer console
2. Navigate to `http://localhost:3000/read/hanis-assassin`
3. Check the Network tab - you should see requests to `localhost:15080`
4. Verify no CORS or domain restriction errors

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure Readium CLI is configured to allow requests from your Thorium Web origin:

```bash
readium -cors-allow-origin="http://localhost:3000"
```

### Domain Not Allowed Errors

If you see "Domain not allowed" errors:
1. Check that `.env.local` exists and contains `MANIFEST_ALLOWED_DOMAINS=localhost`
2. Restart your Next.js development server
3. Clear your browser cache

### Manifest Not Found

If the manifest URL returns 404:
1. Verify Readium CLI is running: check the terminal where you started it
2. Check the encoded ID matches your EPUB filename
3. Test the manifest URL directly in your browser or with curl

## Port Configuration

The default Readium CLI port is 15080. If you're using a different port:

1. Update the URLs in `src/config/publications.ts`
2. Optionally update `.env.local` if you want to restrict allowed ports:
   ```bash
   MANIFEST_ALLOWED_DOMAINS=localhost:15080,localhost:8080
   ```

## Adding Multiple Books

You can add multiple books from your local Readium CLI server:

```typescript
export const PUBLICATION_MANIFESTS = {
  // Local publications
  "hanis-assassin": "http://localhost:15080/a6FuaXNfYXNzYXNzaW4uZXB1Yg/manifest.json",
  "another-book": "http://localhost:15080/[another-encoded-id]/manifest.json",
  "test-book": "http://localhost:15080/[test-book-id]/manifest.json",
  
  // Remote publications for reference/fallback
  "moby-dick": "https://publication-server.readium.org/webpub/...",
} as const;
```

## Development Workflow

A typical workflow for testing with local EPUBs:

1. Start Readium CLI server:
   ```bash
   cd ~/code/readium
   readium manifest ./books/my_book.epub
   ```

2. Note the manifest URL from the output

3. Add to `publications.ts` or use the manifest route directly

4. Start Thorium Web:
   ```bash
   cd ~/code/nicolebarlow_books_v2/thorium-web
   pnpm dev
   ```

5. Open browser to test:
   ```
   http://localhost:3000/read/[your-book-id]
   ```

6. Make changes to your EPUB, restart Readium CLI, and refresh the browser

## Next Steps

- See [Implementers' Guide](./ImplementersGuide.md) for more details on Thorium Web architecture
- See [Environment Variables](./EnvironmentVariables.md) for all available configuration options
- Check [Readium CLI documentation](https://github.com/readium/go-toolkit) for advanced server options

