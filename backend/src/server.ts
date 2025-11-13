import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '../', envFile) });

// Load application configuration
import { config } from './config';

// Initialize Express app
const app: Application = express();

// Security middleware - Helmet.js
app.use(helmet());

// CORS middleware with environment-based configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window default
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.environment,
    features: config.featureFlags
  });
});

// Request logging middleware
import { requestLogger } from './middleware/requestLogger.middleware';
if (config.environment === 'development') {
  app.use(requestLogger);
}

// Import routes
import calculationRoutes from './routes/calculation.routes';

// API routes
app.use('/api/calculate', calculationRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    }
  });
});

// Global error handler
import { errorHandler } from './middleware/errorHandler.middleware';
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.environment} mode`);
  console.log(`CORS enabled for origin: ${config.corsOrigin}`);
});

export default app;
