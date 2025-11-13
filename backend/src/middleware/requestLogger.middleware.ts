/**
 * Request Logger Middleware
 * 
 * Logs incoming requests with relevant details for debugging and monitoring.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * 
 * Logs request method, path, and response time for all API requests.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
