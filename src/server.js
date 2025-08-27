import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { agenda } from './config/agenda.js';
import './jobs/reminders.js';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Basic root route to indicate API is running and remind callers to use the /api prefix
app.get('/', (req, res) => {
  res.json({ message: 'Smart Clinic API', hint: 'Prefix all routes with /api' });
});

// 🔎 Debug route to prove the /api prefix is mounted
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// TEMP: sanity test
app.post('/api/_echo', (req, res) => {
  res.json({ ok: true, path: req.path, method: req.method, body: req.body || null });
});


// Mount all feature routes here
app.use('/api', router);

// 404 + error handlers last
app.use(notFound);
app.use(errorHandler);

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
        const b = (l.regexp?.fast_slash ? '' : (l.regexp?.source.match(/^\^\\\/\?\(\?=\\\/\|\$\)/) ? '' : '')) || '';
        return extract(l.handle.stack, base + (l.regexp?.fast_star ? '' : ''));
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
    logRoutes(app);
  });
});
