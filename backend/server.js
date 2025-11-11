const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS || 15 * 60 * 1000);

// Middlewares
// CORS avec liste d'origines autorisées (séparées par des virgules)
const allowedOrigins = (CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans header Origin (curl, serveurs, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Routes
const paymentRoutes = require('./routes/payments');
const clientRoutes = require('./routes/clients');
const webhookRoutes = require('./routes/webhooks');
const integrationsRoutes = require('./routes/integrations');

app.use('/api/payments', paymentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/integrations', integrationsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'PaymentFlow×Sage backend', time: new Date().toISOString() });
});

// Auto-sync scheduler
const { syncFromSage } = require('./services/syncService');

async function initialSync() {
  try {
    await syncFromSage();
    // eslint-disable-next-line no-console
    console.log('✅ Initial Sage sync done.');
  } catch (e) {
    console.error('Initial sync error:', e.message);
  }
}

let syncTimer = null;
function scheduleSync() {
  if (syncTimer) clearInterval(syncTimer);
  if (Number.isFinite(SYNC_INTERVAL_MS) && SYNC_INTERVAL_MS > 0) {
    syncTimer = setInterval(async () => {
      try {
        await syncFromSage();
        // eslint-disable-next-line no-console
        console.log('🔁 Periodic Sage sync done.');
      } catch (e) {
        console.error('Periodic sync error:', e.message);
      }
    }, SYNC_INTERVAL_MS);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Backend Sage/PaymentFlow running on port ${PORT}`);
  await initialSync();
  scheduleSync();
});
