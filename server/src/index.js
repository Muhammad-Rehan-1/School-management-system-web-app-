import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import studentsRouter from './routes/students.js';
import staffRouter from './routes/staff.js';
import uploadsRouter from './routes/uploads.js';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';

dotenv.config();

// Initialize database URL - default to local SQLite for development
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
  console.log('No DATABASE_URL set, defaulting to local sqlite dev.db');
}

const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const prisma = new PrismaClient();
const app = express();

// CORS configuration
// Allow frontend URL from environment, or fallback to localhost for development
const allowedOrigins = [
  'http://localhost:3000',      // Vite dev default
  'http://localhost:5173',       // Vite dev alternative
  'http://localhost:5174',       // Another Vite port
  process.env.FRONTEND_URL,      // Set on Render for Vercel production
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// Routes
app.use('/api/students', studentsRouter(prisma));
app.use('/api/staff', staffRouter(prisma));
app.use('/api/uploads', uploadsRouter(prisma));
app.use('/api/payments', paymentsRouter(prisma));
app.use('/auth', authRouter(prisma));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
