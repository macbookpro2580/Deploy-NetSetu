import crypto from 'node:crypto';
import { db, PairingInvitation } from './db.js';

// Base32 Crockford-style human-friendly characters (avoiding ambiguous I, L, O, 0, 1)
const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

interface RateLimitTracker {
  attempts: number;
  lockedUntil: number;
}

const rateLimits = new Map<string, RateLimitTracker>();

export function generatePairingCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
}

export function checkRateLimit(ipOrKey: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const tracker = rateLimits.get(ipOrKey);
  if (!tracker) {
    rateLimits.set(ipOrKey, { attempts: 1, lockedUntil: 0 });
    return { allowed: true };
  }

  if (tracker.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((tracker.lockedUntil - now) / 1000),
    };
  }

  if (tracker.lockedUntil <= now && tracker.lockedUntil > 0) {
    // Lockout expired, reset
    tracker.attempts = 1;
    tracker.lockedUntil = 0;
    return { allowed: true };
  }

  tracker.attempts += 1;
  if (tracker.attempts > 5) {
    tracker.lockedUntil = now + 15 * 60 * 1000; // 15 minute lockout after 5 failures
    return {
      allowed: false,
      retryAfterSec: 15 * 60,
    };
  }

  return { allowed: true };
}

export function resetRateLimit(ipOrKey: string): void {
  rateLimits.delete(ipOrKey);
}

export function createInvitation(params: {
  providerId: string;
  providerDeviceId: string;
  createdByUserId: string;
  ttlSeconds?: number;
  allowedClientTypes?: string[];
}): PairingInvitation {
  const code = generatePairingCode();
  const secretToken = 'nst_pair_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const ttl = (params.ttlSeconds || 300) * 1000; // 5 minutes default

  const invitation: PairingInvitation = {
    id: 'pair_' + crypto.randomBytes(8).toString('hex'),
    code,
    secretToken,
    providerId: params.providerId,
    providerDeviceId: params.providerDeviceId,
    createdByUserId: params.createdByUserId,
    createdAt: now,
    expiresAt: now + ttl,
    maxUses: 1,
    usedCount: 0,
    allowedClientTypes: params.allowedClientTypes || ['android_client', 'desktop_windows', 'desktop_linux'],
    status: 'pending',
  };

  db.createPairing(invitation);
  db.logAudit({
    userId: params.createdByUserId,
    deviceId: params.providerDeviceId,
    action: 'PAIRING_CREATED',
    severity: 'info',
    details: `Pairing code generated (${code}) expiring in ${Math.round(ttl / 1000)}s`,
  });

  return invitation;
}

export function validatePairingRequest(code: string, ip: string): {
  success: boolean;
  error?: string;
  invitation?: PairingInvitation;
} {
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return {
      success: false,
      error: `Too many failed attempts. Device locked for ${rate.retryAfterSec}s.`,
    };
  }

  const clean = code.toUpperCase().replace(/[\s-]/g, '');
  const invitation = db.getPairingByCode(clean);

  if (!invitation) {
    return {
      success: false,
      error: 'Invalid pairing code. Please check with the provider.',
    };
  }

  if (Date.now() > invitation.expiresAt) {
    invitation.status = 'expired';
    db.updatePairing(invitation);
    return {
      success: false,
      error: 'Pairing code has expired. Ask the provider to generate a fresh code.',
    };
  }

  if (invitation.status !== 'pending') {
    return {
      success: false,
      error: `Pairing code is already ${invitation.status}.`,
    };
  }

  if (invitation.usedCount >= invitation.maxUses) {
    return {
      success: false,
      error: 'Pairing code has already reached maximum uses.',
    };
  }

  resetRateLimit(ip);
  return { success: true, invitation };
}
