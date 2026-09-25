import { sha256Hex, getCookie } from './_utils.js';

// Paths served without the site PIN. vip-offers keeps its own VIP-code gate.
const PUBLIC_PATHS = new Set([
  '/pin.html', '/pin',
  '/api/verify-pin',
  '/vip-offers.html', '/vip-offers',
]);

// Static assets stay public so the PIN page renders styled; none contain secrets.
const ASSET_RE = /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|txt|xml|json)$/i;

export async function onRequest(context) {
  const { request, env, next } = context;
  const path = new URL(request.url).pathname;

  if (PUBLIC_PATHS.has(path) || ASSET_RE.test(path)) return next();

  // Everything else (/, *.html, pretty URLs) is gated. Missing secret => locked.
  const expected = env.SITE_PIN ? await sha256Hex(env.SITE_PIN) : null;
  const cookie = getCookie(request.headers.get('Cookie'), 'site_auth');

  if (expected && cookie === expected) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('Cache-Control', 'private, no-store');
    return out;
  }

  // Serve the PIN page in place with 401 — no redirect, no site HTML leaves the server.
  const pinPage = await env.ASSETS.fetch(new URL('/pin.html', request.url));
  return new Response(pinPage.body, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
