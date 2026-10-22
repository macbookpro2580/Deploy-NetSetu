import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './src/server/routes.js';
import { tunnelCoordinator } from './src/server/tunnel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for security audit
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      // Do not log sensitive headers or passwords
      const safeBody = req.body ? { ...req.body } : {};
      if (safeBody.password) safeBody.password = '[REDACTED]';
      if (safeBody.secretToken) safeBody.secretToken = '[REDACTED]';
    }
    next();
  });

  // REST API Routes
  app.use('/api', apiRouter);

  // Initialize WebSocket reverse tunnel coordinator
  tunnelCoordinator.init(server);

  // Vite integration
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[NetSetu] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[NetSetu] WebSocket Signaling & Tunnel endpoint ready at ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer().catch((err) => {
  console.error('[NetSetu] Fatal startup error:', err);
  process.exit(1);
});
