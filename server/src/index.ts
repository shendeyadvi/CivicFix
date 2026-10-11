import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 CivicFix Backend Server running on http://127.0.0.1:${PORT} and http://localhost:${PORT}`);
  console.log(`📡 API Health Check: http://127.0.0.1:${PORT}/api/health`);
});
