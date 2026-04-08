import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from './src/lib/supabase.js';

import authRoutes from './src/routes/auth.js';
import tournamentRoutes from './src/routes/tournaments.js';
import teamRoutes from './src/routes/teams.js';
import gamerRoutes from './src/routes/gamers.js';
import organizerRoutes from './src/routes/organizers.js';
import marketplaceRoutes from './src/routes/marketplace.js';
import orderRoutes from './src/routes/orders.js';
import tournamentOrderRoutes from './src/routes/tournament-orders.js';
import radarRoutes from './src/routes/radar.js';
import gigRoutes from './src/routes/gigs.js';
import billRoutes from './src/routes/bills.js';
import approvalRoutes from './src/routes/approvals.js';
import staffRoutes from './src/routes/staff.js';
import settingsRoutes from './src/routes/settings.js';
import paymentRoutes from './src/routes/payments.js';
import uploadRoutes from './src/routes/upload.js';
import tournamentReportRoutes from './src/routes/tournament-reports.js';
import achievementRoutes from './src/routes/achievements.js';
import deliverableRoutes from './src/routes/deliverables.js';
import organizerPageRoutes from './src/routes/organizer-pages.js';
import matchRecordRoutes from './src/routes/match-records.js';
import auditRoutes from './src/routes/audit.js';
import promoRoutes from './src/routes/promos.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Nginx reverse proxy (required for express-rate-limit behind Nginx)
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Strict rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/staff/login', authLimiter);

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ---------------------------------------------------------------------------
// Route mounts
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/gamers', gamerRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tournament-orders', tournamentOrderRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tournament-reports', tournamentReportRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/organizer-pages', organizerPageRoutes);
app.use('/api/match-records', matchRecordRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/promos', promoRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message || err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ error: message });
});

// ---------------------------------------------------------------------------
// Start server with Supabase connection check
// ---------------------------------------------------------------------------

(async () => {
  // Verify Supabase connection on startup
  const { error: pingError } = await supabaseAdmin
    .from('app_settings')
    .select('setting_key')
    .limit(1);

  if (pingError) {
    console.error('[startup] ⚠️  Supabase connection failed:', pingError.message);
    console.error('[startup] Make sure SUPABASE_SERVICE_ROLE_KEY is set in backend/.env');
  } else {
    console.log('[startup] ✅ Supabase connection verified');
  }

  app.listen(PORT, () => {
    console.log(`[HERU.gg] Backend running on port ${PORT}`);
    console.log(`[HERU.gg] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

export default app;
