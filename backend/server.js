/**
 * CareSync Backend — server.js
 * Production-ready Express + MongoDB healthcare API
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ─── Import Routes ────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const labRoutes         = require('./routes/lab');
const recordRoutes      = require('./routes/records');
const bedRoutes         = require('./routes/beds');
const sosRoutes         = require('./routes/sos');
const aiRoutes          = require('./routes/ai');
const adminRoutes       = require('./routes/admin');

// ─── Initialise App ───────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────
connectDB();

// ─── Ensure upload directories exist ─────────────────────────────────────
const uploadDirs = ['uploads', 'uploads/records', 'uploads/reports', 'uploads/avatars'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// ─── Security Middleware ──────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded files
  })
);

// CORS — allow configured origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Global Rate Limiter ──────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/', authLimiter);

// ─── Request Parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Static File Serving (uploaded files) ────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    service: 'CareSync API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏥 CareSync Healthcare API',
    version: '1.0.0',
    docs: '/health',
    endpoints: {
      auth:         '/api/auth',
      users:        '/api/users',
      appointments: '/api/appointments',
      lab:          '/api/lab',
      records:      '/api/records',
      beds:         '/api/beds',
      sos:          '/api/sos',
      ai:           '/api/ai',
      admin:        '/api/admin',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab',          labRoutes);
app.use('/api/records',      recordRoutes);
app.use('/api/beds',         bedRoutes);
app.use('/api/sos',          sosRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/admin',        adminRoutes);

// ─── 404 + Global Error Handler ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🏥 CareSync API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`   → http://localhost:${PORT}\n`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
