// Vercel Serverless Function entrypoint
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const mod = await import('./src/app.js');
    const app = mod.default || mod;
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler] Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Vercel Serverless Function Initialization Error',
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    }));
  }
}
