import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';

import authRoutes from './routes/auth';
import reportsRoutes from './routes/reports';
import aiRoutes from './routes/ai';

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Safe uploads directory initialization (handles both local dev and serverless read-only disk)
try {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const uploadsDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  app.use('/api/uploads', express.static(uploadsDir));
} catch (err) {
  console.warn('Upload directory initialization skipped in serverless environment:', err);
}

// Health check endpoint (accessible at both /api/health and /health)
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CivicFix API',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-local',
  });
});

// API Routes (mounted on both /api/* and /* for full compatibility with Vercel rewrites and local Express)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/reports', reportsRoutes);
app.use('/reports', reportsRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

export default app;
