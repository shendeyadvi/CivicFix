import app from '../server/src/app';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Unhandled Vercel serverless function exception:', err);
    return res.status(500).json({
      error: 'Serverless execution error',
      message: err?.message || String(err),
      stack: err?.stack,
    });
  }
}

