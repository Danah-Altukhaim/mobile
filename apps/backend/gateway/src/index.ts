import dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

app.use(helmet());
app.use(cors());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
  });
});

// Service route mappings
const serviceRoutes: Array<{ path: string; target: string; name: string }> = [
  { path: '/api/v1/auth', target: `http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`, name: 'auth' },
  { path: '/api/v1/students', target: `http://localhost:${process.env.ACADEMIC_SERVICE_PORT || 3002}`, name: 'academic' },
  { path: '/api/v1/payments', target: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 3003}`, name: 'payment' },
  { path: '/api/v1/ai', target: `http://localhost:${process.env.AI_SERVICE_PORT || 3004}`, name: 'ai' },
  { path: '/api/v1/events', target: `http://localhost:${process.env.CAMPUS_SERVICE_PORT || 3005}`, name: 'campus' },
  { path: '/api/v1/clubs', target: `http://localhost:${process.env.CAMPUS_SERVICE_PORT || 3005}`, name: 'campus' },
  { path: '/api/v1/campus', target: `http://localhost:${process.env.CAMPUS_SERVICE_PORT || 3005}`, name: 'campus' },
  { path: '/api/v1/feed', target: `http://localhost:${process.env.SOCIAL_SERVICE_PORT || 3006}`, name: 'social' },
  { path: '/api/v1/messages', target: `http://localhost:${process.env.SOCIAL_SERVICE_PORT || 3006}`, name: 'social' },
  { path: '/api/v1/notifications', target: `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 3007}`, name: 'notification' },
  { path: '/api/v1/admin', target: `http://localhost:${process.env.ADMIN_SERVICE_PORT || 3008}`, name: 'admin' },
  { path: '/api/v1/integrations', target: `http://localhost:${process.env.INTEGRATION_SERVICE_PORT || 3009}`, name: 'integration' },
  { path: '/api/v1/files', target: `http://localhost:${process.env.FILE_SERVICE_PORT || 3010}`, name: 'file' },
];

// Register proxy routes — use router() to preserve full path when proxying
for (const route of serviceRoutes) {
  app.use(route.path, createProxyMiddleware({
    target: route.target,
    changeOrigin: true,
    pathRewrite: {},  // empty = don't rewrite, keep full path
    on: {
      proxyReq: (_proxyReq, req) => {
        // Reconstruct full path since express strips the mount point
        const fullPath = route.path + (req.url === '/' ? '' : req.url);
        _proxyReq.path = fullPath;
        console.log(`[Gateway] ${req.method} ${fullPath} -> ${route.name}`);
      },
      error: (err, _req, res) => {
        console.error(`[Gateway] Proxy error for ${route.name}:`, err.message);
        if ('writeHead' in res && typeof res.writeHead === 'function') {
          (res as any).writeHead(502, { 'Content-Type': 'application/json' });
          (res as any).end(JSON.stringify({
            success: false,
            errors: [{ code: 'SERVICE_UNAVAILABLE', message_ar: `خدمة ${route.name} غير متاحة`, message_en: `${route.name} service unavailable` }],
          }));
        }
      },
    },
  }));
}

// Catch-all for unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    errors: [
      {
        code: 'ROUTE_NOT_FOUND',
        message_ar: 'المسار المطلوب غير موجود',
        message_en: 'The requested route was not found',
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`[Gateway] running on port ${PORT}`);
  console.log(`[Gateway] Proxying to ${serviceRoutes.length} service routes`);
});
