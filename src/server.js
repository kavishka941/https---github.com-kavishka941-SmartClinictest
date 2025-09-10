// src/server.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import dns from 'node:dns';

import { connectDB } from './config/db.js';
import { agenda } from './config/agenda.js';
import './jobs/reminders.js';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

dns.setDefaultResultOrder('ipv4first');

const app = express();

// If you’ll ever use secure cookies behind a proxy/CDN:
app.set('trust proxy', 1);

// ---------- Security / logging ----------
app.use(helmet());
app.use(morgan('dev'));

// ---------- CORS (allow-list) ----------
/**
 * CORS_ORIGIN can be a comma-separated list, e.g.:
 * http://localhost:5173,https://smartclinic.app
 */
const rawOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

// Default dev origin if none provided
const ALLOWLIST = rawOrigins.length ? rawOrigins : ['http://localhost:5173'];

// Avoid "*" with credentials:true. Validate each origin.
const corsOptions = {
  origin(origin, callback) {
    // allow REST tools / server-to-server / same-origin (no Origin header)
    if (!origin) return callback(null, true);
    if (ALLOWLIST.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};
app.use(cors(corsOptions));
// Preflight for all routes
app.options('*', cors(corsOptions));

// ---------- Parsers / cookies / rate limit ----------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ---------- Healthcheck (no auth) ----------
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ---------- Basic root route ----------
app.get('/', (_req, res) => {
  res.json({ message: 'Smart Clinic API', hint: 'Prefix all routes with /api' });
});

// ---------- Debug ping ----------
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// TEMP sanity test
app.post('/api/_echo', (req, res) => {
  res.json({ ok: true, path: req.path, method: req.method, body: req.body || null });
});

// ---------- Mount feature routes under /api ----------
app.use('/api', router);

// ---------- Serve React build in prod (optional) ----------
/**
 * Set SERVE_CLIENT=true and CLIENT_BUILD_DIR to your frontend build directory,
 * e.g., CLIENT_BUILD_DIR=../smart-clinic-fe/dist
 */
if (process.env.SERVE_CLIENT === 'true') {
  const clientDir = path.resolve(process.env.CLIENT_BUILD_DIR || 'dist');
  app.use(express.static(clientDir));
  // Let React Router handle the rest
  app.get('*', (_req, res, next) => {
    if (_req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// ---------- 404 + errors ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Boot ----------
const port = process.env.PORT || 4000;

const logRoutes = (appInstance) => {
  const extract = (stack, base = '') =>
    stack.flatMap((l) => {
      if (l.route?.path) {
        const methods = Object.entries(l.route.methods)
          .filter(([, v]) => v)
          .map(([m]) => m.toUpperCase());
        return [{ path: base + l.route.path, methods }];
      } else if (l.name === 'router' && l.handle?.stack) {
        return extract(l.handle.stack, base);
      } else if (l.handle?.stack) {
        return extract(l.handle.stack, base);
      }
      return [];
    });

  const endpoints = extract(appInstance._router.stack);
  console.log('Mounted endpoints:');
  endpoints.forEach((e) => console.log(`${e.methods.join(',').padEnd(12)} ${e.path}`));
};

connectDB().then(async () => {
  await agenda.start();
  app.listen(port, () => {
    console.log(`API running on :${port}`);
    console.log('CORS allowlist:', ALLOWLIST);
    logRoutes(app);
  });
});
