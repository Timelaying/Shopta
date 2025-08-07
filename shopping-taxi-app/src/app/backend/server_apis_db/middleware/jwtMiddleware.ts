// src/middleware/jwtMiddleware.ts

import { RequestHandler } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';

// Make `user` optional so `Request` already fits (no overlap error).
// `user` will contain the id and username from the access token.
export interface AuthenticatedRequest extends Express.Request {
  user?: AccessTokenPayload;
}

export const jwtMiddleware: RequestHandler = (req, res, next): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token) as AccessTokenPayload;
    // Now req already has an optional `user`, so this cast is safe
    // and contains the user's id and username
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
