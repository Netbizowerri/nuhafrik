import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    role: string;
    email?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 'Unauthorized', 'No access token provided', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Unauthorized', 'Invalid or expired access token', 401);
  }
};

export const authorize = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, 'Forbidden', 'Insufficient permissions', 403);
  }
  next();
};
