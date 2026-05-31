/**
 * PostPipe Stateless RBAC — Application Entry
 *
 * Mounts the modular RBAC middleware pipeline.
 * PostPipe stores NO end-user data — all operations route
 * through the developer's connector to their own database.
 */

import express from 'express';
import cors from 'cors';
import rbacRoutes from './routes/rbacRoutes';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-project-id'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter as express.RequestHandler);

// ─── RBAC API Routes ────────────────────────────────────────────────────────

app.use('/api/v1/rbac', rbacRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get('/health', (_req, res) =>
  res.status(200).json({
    status: 'ok',
    service: 'PostPipe Stateless RBAC Gateway',
    version: '2.0.0',
    architecture: 'stateless',
    stores_user_data: false,
  })
);

// ─── 404 Handler ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'This route does not exist on the PostPipe RBAC gateway.',
    availableRoutes: [
      'POST /api/v1/rbac/login',
      'POST /api/v1/rbac/refresh',
      'POST /api/v1/rbac/logout',
      'GET  /api/v1/rbac/me',
      'GET  /api/v1/rbac/users',
      'POST /api/v1/rbac/users',
      'DELETE /api/v1/rbac/users/:id',
      'GET  /api/v1/rbac/roles',
      'POST /api/v1/rbac/roles',
      'DELETE /api/v1/rbac/roles/:id',
      'POST /api/v1/rbac/assign-role',
      'POST /api/v1/rbac/revoke-role',
      'GET  /api/v1/rbac/permissions',
      'POST /api/v1/rbac/permissions',
      'PUT  /api/v1/rbac/permissions/:id',
      'DELETE /api/v1/rbac/permissions/:id',
    ],
  });
});

export default app;
