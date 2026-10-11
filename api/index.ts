// Vercel Serverless Function entrypoint
// Statically imports app from ./src/app so Vercel's bundler traces and includes all dependencies.
import type { IncomingMessage, ServerResponse } from 'http';
import app from './src/app';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler] Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err?.message || 'Server error',
    }));
  }
}
