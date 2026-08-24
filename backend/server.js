import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import http from 'http';
import net from 'net';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { initSocket } from './services/socketService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import jobDriveRoutes from './routes/jobDriveRoutes.js';
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows files to be fetched from server on other origins
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
const isProduction = (process.env.NODE_ENV || 'development') === 'production';
const defaultDevOrigins = 'http://localhost:5173,http://localhost:3050,http://localhost:3051';
const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || (isProduction ? '' : defaultDevOrigins))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const wildcardToRegex = (pattern) => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\\\*/g, '.*')}$`);
};

const exactOrigins = new Set();
const wildcardOrigins = [];

configuredOrigins.forEach((configuredOrigin) => {
  const normalizedOrigin = normalizeOrigin(configuredOrigin);
  if (normalizedOrigin.includes('*')) {
    wildcardOrigins.push(wildcardToRegex(normalizedOrigin));
  } else {
    exactOrigins.add(normalizedOrigin);
  }
});

const isLocalDevOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (exactOrigins.has(normalizedOrigin)) return true;
  return wildcardOrigins.some((pattern) => pattern.test(normalizedOrigin));
};

app.use(cors({
  origin: (origin, callback) => {
    // Requests without an Origin header include local scripts and health checks.
    if (
      !origin
      || isAllowedOrigin(origin)
      || (!isProduction && isLocalDevOrigin(origin))
    ) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS origin: ${origin}`);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate Limiter - Relaxed to handle extreme high-concurrency scaling of 1,000,000+ users
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000000, // Scale up to 10,000,000 requests per window to avoid loading/trashing errors
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);

// Direct mounts for root API namespaces
app.use('/api', jobDriveRoutes);
app.use('/api', recruitmentRoutes);
app.use('/api', systemRoutes);
app.use('/api/chat', chatRoutes);

// Default status endpoint
app.get('/', (req, res) => {
  res.json({ message: 'PlaceTrack Server API is running' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const MAX_PORT_RETRIES = 10;

const isPortAvailable = (port) => new Promise((resolve) => {
  const tester = net.createServer();

  tester.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      resolve(false);
      return;
    }
    resolve(false);
  });

  tester.once('listening', () => {
    tester.close(() => resolve(true));
  });

  tester.listen(port, '::');
});

const findAvailablePort = async (startPort, retriesLeft = MAX_PORT_RETRIES) => {
  let candidatePort = Number(startPort);

  while (retriesLeft >= 0) {
    // Probe first so the HTTP server only calls listen once.
    // This avoids duplicate callbacks/events from repeated listen attempts.
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(candidatePort);
    if (available) return candidatePort;

    const nextPort = candidatePort + 1;
    console.warn(`Port ${candidatePort} is in use. Retrying on port ${nextPort}...`);
    candidatePort = nextPort;
    retriesLeft -= 1;
  }

  throw new Error(`No free port found after ${MAX_PORT_RETRIES + 1} attempts starting at ${startPort}`);
};

const startServer = async (port) => {
  try {
    const availablePort = await findAvailablePort(port);
    server.listen(availablePort, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${availablePort}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(PORT);
