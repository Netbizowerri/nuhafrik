import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return sendError(res, 'Validation Error', message, 400);
    }
    next(error);
  }
};
