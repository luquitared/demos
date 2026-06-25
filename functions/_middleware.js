// Edge middleware — runs on EVERY request to the demos site, before any
// static asset is served. This is where password protection happens.
//
// Why this is secure (and a client-side JS gate is not): the protected
// HTML is a static asset that Cloudflare only serves when this function
// calls next(). If the password is missing/wrong we return 401 and the
// asset is never fetched — nothing protected ever reaches the browser.
// The password itself lives in an encrypted Pages secret (env), never in
// any file shipped to the client.
//
// ── To protect a page ──────────────────────────────────────────────
//   1. Add an entry below:  "/your-slug/": "PW_YOUR_SLUG"
//   2. Set the secret:
//        printf '%s' 'the-password' | \
//          npx wrangler@latest pages secret put PW_YOUR_SLUG --project-name demos
//   3. Redeploy.
// Each page can have its own password. Pages not listed here are public.

const PROTECTED = {
  '/private-sample/': 'PW_PRIVATE_SAMPLE',
  '/chris-signalfire-opportunity/': 'PW_CHRIS_SIGNALFIRE',
  '/kalshi-bot-market/': 'PW_KALSHI_BOT_MARKET',
  '/kalmari-gtm/': 'PW_KALMARI_GTM',
  '/odapt-build-report/': 'PW_ODAPT_BUILD_REPORT',
};

export const onRequest = async (context) => {
  const { request, env, next } = context;
  const { pathname } = new URL(request.url);

  const prefix = Object.keys(PROTECTED).find((p) => pathname.startsWith(p));
  if (!prefix) return next(); // public path — serve normally

  const expected = env[PROTECTED[prefix]];
  if (!expected) {
    // Fail closed: a page marked protected with no secret set must not leak.
    return new Response(
      'This page is protected, but no password is configured on the server.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const header = request.headers.get('Authorization') || '';
  if (header.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(header.slice(6)); } catch { decoded = ''; }
    const sep = decoded.indexOf(':');
    if (sep !== -1) {
      const supplied = decoded.slice(sep + 1); // username ignored; shared password
      if (timingSafeEqual(supplied, expected)) {
        return next(); // correct → serve the protected asset
      }
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Protected demo", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
};

// Constant-time comparison so response timing can't be used to guess the
// password character by character.
function timingSafeEqual(a, b) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}
