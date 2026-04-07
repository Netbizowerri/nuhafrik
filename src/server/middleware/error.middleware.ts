import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const error = err.error || err.stack;

  // Log error with context
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status,
      message,
      stack: err.stack
    }));
  } else {
    console.error(`[Error] ${req.method} ${req.url} - ${status}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  return sendError(res, message, error, status);
};
