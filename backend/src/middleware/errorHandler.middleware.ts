/**
 * Error Handler Middleware
 * 
 * Provides consistent error handling across all API endpoints.
 * Formats errors in a standard structure and logs them appropriately.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * Global error handler middleware
 * 
 * Catches all errors thrown in the application and formats them
 * into a consistent response structure.
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle generic errors
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred'
    : err.message;

  res.status(statusCode).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};

/**
 * Async handler wrapper
 * 
 * Wraps async route handlers to catch errors and pass them to error middleware.
 * Eliminates the need for try-catch blocks in every route handler.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
