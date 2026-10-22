import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, generateToken, verifyToken, revokeToken } from './auth.js';
import { generatePairingCode, checkRateLimit, resetRateLimit, createInvitation, validatePairingRequest } from './pairing.js';
import { db, User, ProviderContribution } from './db.js';

test('auth: password hashing and verification with scrypt', () => {
  const password = 'ProviderSecret#2026';
  const { hash, salt } = hashPassword(password);

  assert.ok(hash.length > 32, 'Hash should be a long hex string');
  assert.ok(salt.length === 32, 'Salt should be 16 bytes (32 hex characters)');

  // Correct verification
  const isValid = verifyPassword(password, hash, salt);
  assert.equal(isValid, true, 'Original password should verify');

  // Incorrect verification
  const isInvalid = verifyPassword('WrongPassword123', hash, salt);
  assert.equal(isInvalid, false, 'Wrong password should fail verification');
});

test('auth: token issuance, verification, and revocation', () => {
  const dummyUser: User = {
    id: 'usr_test_99',
    email: 'test@netsetu.np',
    passwordHash: 'dummy',
    salt: 'dummy',
    displayName: 'Test User',
    location: 'Nepal',
    createdAt: new Date().toISOString(),
  };

  const token = generateToken(dummyUser, 'dev_test_phone');
  assert.ok(token.startsWith('nst_'), 'Token should start with nst_ prefix');

  const verified = verifyToken(token);
  assert.ok(verified !== null, 'Token should verify successfully');
  assert.equal(verified?.userId, dummyUser.id);
  assert.equal(verified?.deviceId, 'dev_test_phone');

  // Test revocation
  const revoked = revokeToken(token);
  assert.equal(revoked, true, 'Revocation should succeed');

  const verifyAfterRevoke = verifyToken(token);
  assert.equal(verifyAfterRevoke, null, 'Revoked token should no longer verify');
});

test('pairing: code generation uses Crockford-safe characters', () => {
  const code = generatePairingCode();
  assert.equal(code.length, 6, 'Pairing code should be 6 characters');
  // Should not contain ambiguous characters 0, O, 1, I, L
  assert.equal(/[01OIL]/.test(code), false, 'Should avoid ambiguous characters');
});

test('pairing: rate limiting locks out after multiple failures', () => {
  const testIp = '103.104.148.99';
  resetRateLimit(testIp);

  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testIp);
    assert.equal(res.allowed, true, `Attempt ${i + 1} should be permitted`);
  }

  // 6th attempt should be blocked
  const blocked = checkRateLimit(testIp);
  assert.equal(blocked.allowed, false, '6th attempt must trigger rate limit lockout');
  assert.ok(blocked.retryAfterSec && blocked.retryAfterSec > 0, 'Retry after seconds should be provided');

  resetRateLimit(testIp);
  assert.equal(checkRateLimit(testIp).allowed, true, 'Reset rate limit restores access');
});

test('pairing: single-use code expiration and validation', () => {
  const invitation = createInvitation({
    providerId: 'prv_gateway',
    providerDeviceId: 'dev_biratnagar_pixel',
    createdByUserId: 'usr_biratnagar_01',
    ttlSeconds: 300,
  });

  assert.ok(invitation.id.startsWith('pair_'));
  assert.equal(invitation.status, 'pending');
  assert.equal(invitation.maxUses, 1);

  // Validate with correct code
  const valResult = validatePairingRequest(invitation.code, '103.111.201.12');
  assert.equal(valResult.success, true, 'Valid pairing code should validate');
  assert.equal(valResult.invitation?.id, invitation.id);

  // Validate with bogus code
  const bogusResult = validatePairingRequest('ZZZZZZ', '103.111.201.12');
  assert.equal(bogusResult.success, false, 'Bogus code should fail');
});

test('db: session creation, byte accounting, and revocation', () => {
  const sessionId = 'ses_unit_test_' + Date.now();
  const session = db.createSession({
    id: sessionId,
    pairingId: 'pair_test',
    providerDeviceId: 'dev_biratnagar_pixel',
    clientDeviceId: 'dev_saptari_samsung',
    providerUserId: 'usr_biratnagar_01',
    clientUserId: 'usr_saptari_02',
    sessionToken: 'nst_ses_unit_token',
    status: 'active',
    startedAt: Date.now(),
    bytesUp: 500,
    bytesDown: 1500,
    currentLatencyMs: 35,
    lastHeartbeat: Date.now(),
    providerEgressIp: '103.104.148.45',
    clientObservedEgressIp: '103.104.148.45',
    dnsServer: '1.1.1.1',
    protocol: 'socks5_reverse_tunnel',
  });

  const retrieved = db.getSessionById(sessionId);
  assert.ok(retrieved !== undefined);
  assert.equal(retrieved?.bytesUp, 500);

  // Update bytes
  retrieved!.bytesUp += 250;
  retrieved!.bytesDown += 1000;
  db.updateSession(retrieved!);

  const updated = db.getSessionById(sessionId);
  assert.equal(updated?.bytesUp, 750);
  assert.equal(updated?.bytesDown, 2500);

  // Revoke session
  updated!.status = 'revoked';
  updated!.terminationReason = 'Remote admin revocation';
  db.updateSession(updated!);

  const revokedSession = db.getSessionById(sessionId);
  assert.equal(revokedSession?.status, 'revoked');
  assert.equal(revokedSession?.terminationReason, 'Remote admin revocation');
});

test('contributions: store and retrieve data from who is sharing', () => {
  const uniqueSuffix = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6);
  const newDonor: ProviderContribution = {
    id: 'cnt_test_donor_' + uniqueSuffix,
    providerUserId: 'usr_test_donor_' + uniqueSuffix,
    providerName: 'Anil Shrestha (Provider)',
    deviceName: 'OnePlus 12 5G (Host Node)',
    location: 'Kathmandu Gateway',
    networkType: '5G',
    carrierName: 'Ncell 5G Ultra',
    totalDataSharedBytes: 10737418240, // 10 GB
    lifetimeSessionsCount: 15,
    activeRecipientsCount: 2,
    firstSharedAt: new Date().toISOString(),
    lastSharedAt: new Date().toISOString(),
    status: 'active_sharing',
    notes: 'Voluntarily sharing high speed 5G data.',
  };

  db.recordContribution(newDonor);

  const found = db.getContributionById(newDonor.id);
  assert.ok(found !== undefined, 'Recorded donor should be retrieved');
  assert.equal(found?.providerName, 'Anil Shrestha (Provider)');
  assert.equal(found?.networkType, '5G');
  assert.equal(found?.totalDataSharedBytes, 10737418240);

  // Increment data sharing using direct contribution id
  db.logDataSharing(newDonor.id, 1048576); // +1 MB
  const afterIncrement = db.getContributionById(newDonor.id);
  assert.equal(afterIncrement?.totalDataSharedBytes, 10737418240 + 1048576);

  const allContributions = db.getAllContributions();
  assert.ok(allContributions.length >= 1, 'Should contain at least one contribution in ledger');
});
