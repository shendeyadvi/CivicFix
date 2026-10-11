import app from './app';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[CivicFix API Handler] Uncaught request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err?.message || 'Server error',
      }));
    }
  }
}
