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

## Password-protecting a page

Protection is enforced **server-side** at Cloudflare's edge by `functions/_middleware.js`,
not in client JS — the protected HTML is never sent to the browser until the password
is validated. Each page has its own password.

1. Add an entry to the `PROTECTED` map in `functions/_middleware.js`:
   ```js
   const PROTECTED = {
     '/private-sample/': 'PW_PRIVATE_SAMPLE',
     '/client-pitch/':   'PW_CLIENT_PITCH',   // its own, separate password
   };
   ```
2. Set the secret (the value never lives in any file):
   ```bash
   printf '%s' 'your-password' | \
     CLOUDFLARE_ACCOUNT_ID=7601a93e6b0ec91b80b29174824d8e43 \
     npx wrangler@latest pages secret put PW_CLIENT_PITCH --project-name demos
   ```
3. Redeploy. Visiting the page now triggers a browser password prompt; wrong/absent
   password returns `401` and no content. Pages not in the map stay public.

To change a password, just re-run the `pages secret put` for that var. To list/remove:
`wrangler pages secret list --project-name demos` / `... secret delete PW_NAME`.

## Current demos

- **reel/** — vertical swipe-through of real podcast4 segments. Concept exploring whether the moment catalog could be a TikTok-style feed.
- **refractions/iran/** — one news event (Iran), refracted through five podcast lenses.
- **private-sample/** — template for a password-protected page (Basic Auth via edge middleware).
