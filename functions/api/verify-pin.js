import { sha256Hex } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    if (!env.SITE_PIN) return unauthorized();
    const { pin } = await request.json();
    if (typeof pin !== 'string' || pin !== env.SITE_PIN) return unauthorized();
    const hash = await sha256Hex(pin);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Set-Cookie': `site_auth=${hash}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  } catch {
    return unauthorized();
  }
}

function unauthorized() {
  return new Response(JSON.stringify({ success: false, error: 'Invalid PIN' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
