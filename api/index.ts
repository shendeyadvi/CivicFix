// Vercel Serverless Function handler — entry point for all /api/* routes
// Server source is co-located in api/src/ to ensure Vercel bundles it correctly.

import type { IncomingMessage, ServerResponse } from 'http';

let _app: any = null;
let _initError: Error | null = null;

async function getApp() {
  if (_app) return _app;
  if (_initError) throw _initError;

  try {
    // Import from co-located src/ directory (copied from server/src/ during build)
    const mod = await import('./src/app');
    _app = mod.default;
    return _app;
  } catch (err: any) {
    _initError = err;
    throw err;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler] Critical startup error:', {
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
    });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Server initialization failed',
      message: err?.message || 'Unknown error during server startup',
      code: err?.code || 'INIT_ERROR',
    }));
  }
}
