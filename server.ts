import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './src/server/middleware/error.middleware';
import v1Routes from './src/server/routes/v1';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Utility Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development with Vite
  }));
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  app.use('/api/', limiter);

  // API Routes
  app.use('/api/v1', v1Routes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite Middleware for Development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error Handling Middleware (MUST be last)
  app.use(errorMiddleware);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[API] Version 1 available at http://localhost:${PORT}/api/v1`);
  });
}

startServer().catch(err => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
