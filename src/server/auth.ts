import crypto from 'node:crypto';
import { db, User } from './db.js';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  deviceId?: string;
  issuedAt: number;
  expiresAt: number;
}

// In-memory token store for signed session verification
const activeTokens = new Map<string, AuthTokenPayload>();

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function generateToken(user: User, deviceId?: string, durationMs = 86400000 * 7): string {
  const token = 'nst_' + crypto.randomBytes(32).toString('hex');
  const payload: AuthTokenPayload = {
    userId: user.id,
    email: user.email,
    deviceId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + durationMs,
  };
  activeTokens.set(token, payload);
  return token;
}

export function verifyToken(token: string | undefined): AuthTokenPayload | null {
  if (!token) return null;
  const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
  const payload = activeTokens.get(clean);
  if (!payload) return null;
  if (Date.now() > payload.expiresAt) {
    activeTokens.delete(clean);
    return null;
  }
  return payload;
}

export function revokeToken(token: string): boolean {
  const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
  return activeTokens.delete(clean);
}
