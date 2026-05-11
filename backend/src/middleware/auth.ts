import type { Request, Response, NextFunction } from 'express';
import { verifySession, type SessionPayload } from '../services/auth.js';

declare global {
  namespace Express {
    interface Request {
      session?: SessionPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  const session = await verifySession(auth.slice('Bearer '.length));
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.session = session;
  next();
}

export function requireRole(...roles: SessionPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) return res.status(401).json({ error: 'No session' });
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
