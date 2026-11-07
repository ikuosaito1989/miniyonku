interface Env {
  ASSETS: {fetch(request: Request): Promise<Response>};
  MINIYONKU_SERVICE_EMAIL?: string;
  MINIYONKU_SERVICE_PASSWORD?: string;
}

const backend = 'https://neglegere.com';
let cached: {email: string; password: string; token: string; expires: number} | undefined;
let loginPending: Promise<string> | undefined;

async function accessToken(env: Env): Promise<string> {
  const email = env.MINIYONKU_SERVICE_EMAIL;
  const password = env.MINIYONKU_SERVICE_PASSWORD;
  if (!email || !password) throw new Error('Service unavailable');
  if (cached && cached.email === email && cached.password === password && cached.expires > Date.now()) return cached.token;
  if (loginPending) return loginPending;
  loginPending = (async () => {
    const response = await fetch(`${backend}/api/auth/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}), redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Service unavailable');
    const payload = await response.json() as {token?: unknown; user?: {role?: unknown}};
    if (typeof payload.token !== 'string' || payload.user?.role !== 'miniyonku') throw new Error('Service unavailable');
    cached = {email, password, token: payload.token, expires: Date.now() + 14 * 60 * 1000};
    return payload.token;
  })().finally(() => { loginPending = undefined; });
  return loginPending;
}

function error(status: number, message: string) {
  return Response.json({error: message}, {status, headers: {'Cache-Control': 'no-store'}});
}

async function records(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'POST') return error(405, '許可されていない操作です');
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return error(403, 'この接続元は許可されていません');
  const headers = new Headers();
  let body: Uint8Array<ArrayBuffer> | undefined;
  if (request.method === 'POST') {
    const token = request.headers.get('X-Miniyonku-Player-Token');
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return error(401, 'プレイヤー識別子が必要です');
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return error(415, 'JSON形式で送信してください');
    const reader = request.body?.getReader();
    if (!reader) return error(400, '送信データが必要です');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return error(413, '送信データが大きすぎます'); }
      chunks.push(value);
    }
    body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
    headers.set('X-Miniyonku-Player-Id', Array.from(digest, b => b.toString(16).padStart(2, '0')).join(''));
    headers.set('Content-Type', 'application/json');
  }
  const url = new URL('/api/miniyonku/records', backend);
  url.search = new URL(request.url).search;
  const send = async () => {
    headers.set('Authorization', `Bearer ${await accessToken(env)}`);
    return fetch(url, {method: request.method, headers, body, redirect: 'error', signal: AbortSignal.timeout(10000)});
  };
  let response = await send();
  if (response.status === 401) {
    await response.body?.cancel();
    cached = undefined;
    response = await send();
  }
  // Login responses, cookies and upstream error details never reach the browser.
  if (!response.ok) {
    await response.body?.cancel();
    return error(response.status >= 500 || response.status === 401 || response.status === 403 ? 503 : response.status, 'オンライン記録を処理できません。時間をおいて再試行してください');
  }
  return new Response(response.body, {status: response.status, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/api/miniyonku/records') {
      try { return await records(request, env); }
      catch { return error(503, 'オンライン記録は接続準備中です'); }
    }
    if (path.startsWith('/api/')) return error(404, '見つかりません');
    return env.ASSETS.fetch(request);
  },
};
