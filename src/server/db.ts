import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  location: string;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: 'android_provider' | 'android_client' | 'desktop_windows' | 'desktop_linux' | 'web_companion';
  location: string;
  publicKey: string;
  ipAddress?: string;
  lastSeen: string;
  registeredAt: string;
  isAuthorized: boolean;
  status: 'online' | 'offline' | 'sharing';
}

export interface PairingInvitation {
  id: string;
  code: string; // 6-character easy code
  secretToken: string; // High-entropy crypto token
  providerId: string;
  providerDeviceId: string;
  createdByUserId: string;
  createdAt: number;
  expiresAt: number;
  maxUses: number;
  usedCount: number;
  allowedClientTypes: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  acceptedByDeviceId?: string;
  acceptedByUserId?: string;
}

export interface ActiveSession {
  id: string;
  pairingId: string;
  providerDeviceId: string;
  clientDeviceId: string;
  providerUserId: string;
  clientUserId: string;
  sessionToken: string;
  status: 'initiating' | 'active' | 'paused' | 'stopped' | 'revoked';
  startedAt: number;
  stoppedAt?: number;
  bytesUp: number;
  bytesDown: number;
  currentLatencyMs: number | null;
  lastHeartbeat: number;
  providerEgressIp?: string;
  clientObservedEgressIp?: string;
  dnsServer: string;
  protocol: 'socks5_reverse_tunnel' | 'http_connect_tunnel' | 'wireguard_relay';
  terminationReason?: string;
}

export interface ProviderContribution {
  id: string;
  providerUserId: string;
  providerName: string;
  deviceName: string;
  location: string;
  networkType: '5G' | '4G_LTE' | 'Broadband' | 'Wi-Fi_Direct_Mesh';
  carrierName: string;
  totalDataSharedBytes: number;
  lifetimeSessionsCount: number;
  activeRecipientsCount: number;
  firstSharedAt: string;
  lastSharedAt: string;
  status: 'active_sharing' | 'paused' | 'standby';
  notes?: string;
  ipAddress?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  deviceId?: string;
  sessionId?: string;
  action: string;
  severity: 'info' | 'warn' | 'security';
  details: string;
}

class Database {
  private users: Map<string, User> = new Map();
  private devices: Map<string, Device> = new Map();
  private pairingInvitations: Map<string, PairingInvitation> = new Map();
  private sessions: Map<string, ActiveSession> = new Map();
  private contributions: Map<string, ProviderContribution> = new Map();
  private auditEvents: AuditEvent[] = [];
  private dataDir = path.resolve(process.cwd(), '.data');
  private dbFile = path.resolve(this.dataDir, 'netsetu_store.json');

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.dbFile)) {
        const raw = fs.readFileSync(this.dbFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users) parsed.users.forEach((u: User) => this.users.set(u.id, u));
        if (parsed.devices) parsed.devices.forEach((d: Device) => this.devices.set(d.id, d));
        if (parsed.pairingInvitations) parsed.pairingInvitations.forEach((p: PairingInvitation) => this.pairingInvitations.set(p.id, p));
        if (parsed.sessions) parsed.sessions.forEach((s: ActiveSession) => this.sessions.set(s.id, s));
        if (parsed.contributions) parsed.contributions.forEach((c: ProviderContribution) => this.contributions.set(c.id, c));
        if (parsed.auditEvents) this.auditEvents = parsed.auditEvents;
      } else {
        this.seedDemoData();
      }

      // If contributions were missing in existing DB, seed them
      if (this.contributions.size === 0) {
        this.seedDefaultContributions();
        this.persist();
      }
    } catch {
      this.seedDemoData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const dump = {
        users: Array.from(this.users.values()),
        devices: Array.from(this.devices.values()),
        pairingInvitations: Array.from(this.pairingInvitations.values()),
        sessions: Array.from(this.sessions.values()),
        contributions: Array.from(this.contributions.values()),
        auditEvents: this.auditEvents.slice(-500),
      };
      fs.writeFileSync(this.dbFile, JSON.stringify(dump, null, 2), 'utf-8');
    } catch {
      // In-memory fallback
    }
  }

  private seedDemoData() {
    // Demo user 1 (Provider)
    const salt1 = crypto.randomBytes(16).toString('hex');
    const hash1 = crypto.scryptSync('ProviderPass123!', salt1, 64).toString('hex');
    const user1: User = {
      id: 'usr_biratnagar_01',
      email: 'provider@netsetu.np',
      displayName: 'Aarav Sharma (Provider)',
      passwordHash: hash1,
      salt: salt1,
      location: 'Mobile 5G Cellular Gateway',
      createdAt: new Date().toISOString(),
    };
    this.users.set(user1.id, user1);

    // Demo user 2 (Receiver)
    const salt2 = crypto.randomBytes(16).toString('hex');
    const hash2 = crypto.scryptSync('ReceiverPass123!', salt2, 64).toString('hex');
    const user2: User = {
      id: 'usr_saptari_02',
      email: 'receiver@netsetu.np',
      displayName: 'Rohan Yadav (Receiver)',
      passwordHash: hash2,
      salt: salt2,
      location: 'Remote Client Device',
      createdAt: new Date().toISOString(),
    };
    this.users.set(user2.id, user2);

    // Device 1: Android Provider Phone
    const dev1: Device = {
      id: 'dev_biratnagar_pixel',
      userId: user1.id,
      name: 'Pixel 8 (Mobile 5G Egress)',
      type: 'android_provider',
      location: 'Mobile Provider Node',
      publicKey: 'np_pub_prov_' + crypto.randomBytes(8).toString('hex'),
      ipAddress: '103.104.148.45', // Cellular CGNAT egress IP
      lastSeen: new Date().toISOString(),
      registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      isAuthorized: true,
      status: 'sharing',
    };
    this.devices.set(dev1.id, dev1);

    // Device 2: Android Receiver Phone
    const dev2: Device = {
      id: 'dev_saptari_samsung',
      userId: user2.id,
      name: 'Galaxy A54 (Receiver Phone)',
      type: 'android_client',
      location: 'Remote Client Location',
      publicKey: 'np_pub_recv_' + crypto.randomBytes(8).toString('hex'),
      ipAddress: '103.111.201.12',
      lastSeen: new Date().toISOString(),
      registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isAuthorized: true,
      status: 'online',
    };
    this.devices.set(dev2.id, dev2);

    // Device 3: Windows Laptop
    const dev3: Device = {
      id: 'dev_saptari_thinkpad',
      userId: user2.id,
      name: 'ThinkPad T14 (Windows 11 Client)',
      type: 'desktop_windows',
      location: 'Remote Workstation',
      publicKey: 'np_pub_win_' + crypto.randomBytes(8).toString('hex'),
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
      isAuthorized: true,
      status: 'offline',
    };
    this.devices.set(dev3.id, dev3);

    this.seedDefaultContributions();

    // Audit log
    this.auditEvents.push({
      id: 'aud_' + crypto.randomBytes(6).toString('hex'),
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_BOOTSTRAP',
      severity: 'info',
      details: 'NetSetu storage initialized with secure peer-to-peer endpoints and data donor ledger.',
    });

    this.persist();
  }

  private seedDefaultContributions() {
    const c1: ProviderContribution = {
      id: 'cnt_aarav_01',
      providerUserId: 'usr_biratnagar_01',
      providerName: 'Aarav Sharma',
      deviceName: 'Pixel 8 (Mobile 5G Egress)',
      location: 'Primary Mobile Gateway',
      networkType: '5G',
      carrierName: 'Ncell Ultra 5G / Nepal Telecom LTE',
      totalDataSharedBytes: 25769803776, // ~24 GB
      lifetimeSessionsCount: 48,
      activeRecipientsCount: 1,
      firstSharedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      lastSharedAt: new Date().toISOString(),
      status: 'active_sharing',
      notes: 'Active unlimited mobile 5G cellular uplink shared voluntarily for remote recipients.',
      ipAddress: '103.104.148.45',
    };
    this.contributions.set(c1.id, c1);

    const c2: ProviderContribution = {
      id: 'cnt_priya_02',
      providerUserId: 'usr_priya_03',
      providerName: 'Priya Karki',
      deviceName: 'OnePlus 11 5G (Host Node)',
      location: 'Regional Hub East',
      networkType: '5G',
      carrierName: 'Smart Telecom 5G Gateway',
      totalDataSharedBytes: 15461882265, // ~14.4 GB
      lifetimeSessionsCount: 29,
      activeRecipientsCount: 0,
      firstSharedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      lastSharedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'standby',
      notes: 'Shared during business hours for community study access.',
      ipAddress: '103.120.89.201',
    };
    this.contributions.set(c2.id, c2);

    const c3: ProviderContribution = {
      id: 'cnt_suman_03',
      providerUserId: 'usr_suman_04',
      providerName: 'Suman Baral',
      deviceName: 'Xiaomi 13 Pro (P2P Wi-Fi Direct)',
      location: 'Valley Community Center',
      networkType: 'Wi-Fi_Direct_Mesh',
      carrierName: 'Subisu Fiber + Wi-Fi Direct Mesh',
      totalDataSharedBytes: 42949672960, // ~40 GB
      lifetimeSessionsCount: 74,
      activeRecipientsCount: 2,
      firstSharedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      lastSharedAt: new Date(Date.now() - 600000).toISOString(),
      status: 'active_sharing',
      notes: 'Local mesh Wi-Fi Direct gateway providing zero-router access to devices with no balance.',
      ipAddress: '103.245.160.77',
    };
    this.contributions.set(c3.id, c3);
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    this.persist();
    return user;
  }

  // Devices
  getDevicesByUserId(userId: string): Device[] {
    return Array.from(this.devices.values()).filter((d) => d.userId === userId);
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  getDeviceById(id: string): Device | undefined {
    return this.devices.get(id);
  }

  upsertDevice(device: Device): Device {
    this.devices.set(device.id, device);
    this.persist();
    return device;
  }

  deleteDevice(id: string): boolean {
    const deleted = this.devices.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  // Pairings
  createPairing(invitation: PairingInvitation): PairingInvitation {
    this.pairingInvitations.set(invitation.id, invitation);
    this.persist();
    return invitation;
  }

  getPairingById(id: string): PairingInvitation | undefined {
    return this.pairingInvitations.get(id);
  }

  getPairingByCode(code: string): PairingInvitation | undefined {
    const clean = code.toUpperCase().replace(/\s+/g, '');
    for (const inv of this.pairingInvitations.values()) {
      if (inv.code === clean) return inv;
    }
    return undefined;
  }

  getActivePairingsForProvider(providerDeviceId: string): PairingInvitation[] {
    const now = Date.now();
    return Array.from(this.pairingInvitations.values()).filter(
      (inv) => inv.providerDeviceId === providerDeviceId && inv.expiresAt > now && inv.status === 'pending'
    );
  }

  updatePairing(invitation: PairingInvitation): void {
    this.pairingInvitations.set(invitation.id, invitation);
    this.persist();
  }

  // Sessions
  createSession(session: ActiveSession): ActiveSession {
    this.sessions.set(session.id, session);
    this.persist();
    return session;
  }

  getSessionById(id: string): ActiveSession | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): ActiveSession[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessionForDevice(deviceId: string): ActiveSession | undefined {
    for (const s of this.sessions.values()) {
      if (s.status === 'active' && (s.providerDeviceId === deviceId || s.clientDeviceId === deviceId)) {
        return s;
      }
    }
    return undefined;
  }

  updateSession(session: ActiveSession): void {
    this.sessions.set(session.id, session);
    this.persist();
  }

  // Contributions & Data Donor Ledger ("store data from who is sharing")
  getAllContributions(): ProviderContribution[] {
    return Array.from(this.contributions.values());
  }

  getContributionById(id: string): ProviderContribution | undefined {
    return this.contributions.get(id);
  }

  getContributionByUserId(userId: string): ProviderContribution | undefined {
    for (const c of this.contributions.values()) {
      if (c.providerUserId === userId) return c;
    }
    return undefined;
  }

  recordContribution(contribution: ProviderContribution): ProviderContribution {
    this.contributions.set(contribution.id, contribution);
    this.persist();
    return contribution;
  }

  logDataSharing(idOrUserId: string, bytesIncrement: number): void {
    for (const c of this.contributions.values()) {
      if (c.id === idOrUserId || c.providerUserId === idOrUserId) {
        c.totalDataSharedBytes += Number(bytesIncrement);
        c.lastSharedAt = new Date().toISOString();
        this.persist();
        break;
      }
    }
  }

  // Audit
  logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    this.auditEvents.push({
      id: 'aud_' + crypto.randomBytes(6).toString('hex'),
      timestamp: new Date().toISOString(),
      ...event,
    });
    if (this.auditEvents.length > 1000) {
      this.auditEvents = this.auditEvents.slice(-500);
    }
    this.persist();
  }

  getAuditEvents(limit = 50): AuditEvent[] {
    return [...this.auditEvents].reverse().slice(0, limit);
  }
}

export const db = new Database();
