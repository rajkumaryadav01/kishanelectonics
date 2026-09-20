import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getDatabase, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'kishan-electronics-super-secure-jwt-key-2026';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

export function extractAuth(req: Request): AuthPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractAuth(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please login to continue.' });
    return;
  }
  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractAuth(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required for administrative access.' });
    return;
  }
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Administrative privileges required.' });
    return;
  }
  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractAuth(req);
  if (user) {
    req.user = user;
  }
  next();
}
