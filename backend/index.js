import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { supabaseAdmin } from './src/lib/supabase.js';

import authRoutes from './src/routes/auth.js';
import tournamentRoutes from './src/routes/tournaments.js';
import teamRoutes from './src/routes/teams.js';
import gamerRoutes from './src/routes/gamers.js';
import organizerRoutes from './src/routes/organizers.js';
import orderRoutes from './src/routes/orders.js';
import tournamentOrderRoutes from './src/routes/tournament-orders.js';
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
import gameRoutes from './src/routes/games.js';
import connectRoutes from './src/routes/connect.js';
import botRoutes from './src/routes/bot.js';
import riotTournamentRoutes from './src/routes/riot-tournament.js';
import badgeRoutes from './src/routes/badges.js';
// New platform pivot routes
import providerRoutes from './src/routes/providers.js';
import serviceRoutes from './src/routes/services.js';
import serviceBookingRoutes from './src/routes/service-bookings.js';
import sponsorRoutes from './src/routes/sponsors.js';
import sponsorshipPackageRoutes from './src/routes/sponsorship-packages.js';
import sponsorshipRoutes from './src/routes/sponsorships.js';
import subscriptionRoutes from './src/routes/subscriptions.js';
import reviewRoutes from './src/routes/reviews.js';
import organizerVerificationRoutes from './src/routes/organizer-verifications.js';
import cmsRoutes from './src/routes/cms.js';
import revenueRoutes from './src/routes/revenue.js';
import managedServicesRoutes from './src/routes/managed-services.js';
import coachingRoutes from './src/routes/coaching.js';
import friendsRoutes from './src/routes/friends.js';
import directMessagesRoutes from './src/routes/direct-messages.js';
import leaderboardsRoutes from './src/routes/leaderboards.js';
import reportsRoutes from './src/routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, _res, next) => {
  req.requestId = crypto.randomBytes(8).toString('hex');
  next();
});

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
      connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  } : false,
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
}));

app.use(morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  process.env.NODE_ENV === 'production' ? {
    skip: (req) => req.path.startsWith('/api/auth'),
  } : {}
));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/staff/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/gamers', gamerRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tournament-orders', tournamentOrderRoutes);
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
app.use('/api/games', gameRoutes);
app.use('/api/connect', connectRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/riot-tournament', riotTournamentRoutes);
app.use('/api/badges', badgeRoutes);

// Platform pivot routes
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-bookings', serviceBookingRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/sponsorship-packages', sponsorshipPackageRoutes);
app.use('/api/sponsorships', sponsorshipRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/organizer-verifications', organizerVerificationRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/managed-services', managedServicesRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/direct-messages', directMessagesRoutes);
app.use('/api/leaderboards', leaderboardsRoutes);
app.use('/api/reports', reportsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message || err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

(async () => {
  const { error: pingError } = await supabaseAdmin
    .from('app_settings')
    .select('setting_key')
    .limit(1);
  if (pingError) {
    console.error('[startup] ⚠️  Supabase connection failed:', pingError.message);
  } else {
    console.log('[startup] ✅ Supabase connection verified');
  }
  app.listen(PORT, () => {
    console.log(`[HERU.gg] Backend running on port ${PORT}`);
    console.log(`[HERU.gg] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

export default app;
