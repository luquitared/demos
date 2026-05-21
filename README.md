# demos

Landing pad for one-off concept pages. Lives at **https://demos.pages.dev** (Cloudflare Pages).

Everything here is static HTML — no build step. Drop a folder in, link it from `index.html`, push.

## Add a demo

1. `mkdir <slug>/` and put an `index.html` in it.
2. Add a `<li>` card in the root `index.html` linking to `./<slug>/`.
3. Commit + push. GitHub Actions deploys to Cloudflare Pages in ~30s.

## Local preview

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

## Deploy (manual, from local)

```bash
CLOUDFLARE_ACCOUNT_ID=7601a93e6b0ec91b80b29174824d8e43 \
  npx wrangler@latest pages deploy . \
  --project-name demos \
  --branch main \
  --commit-dirty=true
```

## Deploy (CI, on push to main)

`.github/workflows/deploy.yml` runs on push. Requires repo secrets:

- `CLOUDFLARE_API_TOKEN` — token with `Pages — Edit` permission
- `CLOUDFLARE_ACCOUNT_ID` — `7601a93e6b0ec91b80b29174824d8e43`

## Current demos

- **reel/** — vertical swipe-through of real podcast4 segments. Concept exploring whether the moment catalog could be a TikTok-style feed.
