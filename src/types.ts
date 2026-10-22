export type ScreenTab =
  | 'welcome'
  | 'auth'
  | 'provider'
  | 'client'
  | 'pairing'
  | 'dashboard'
  | 'diagnostics'
  | 'livetest'
  | 'ledger'
  | 'traffic'
  | 'devices'
  | 'settings'
  | 'help';

export interface User {
  id: string;
  email: string;
  displayName: string;
  location: string;
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
  code: string;
  secretToken: string;
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

export interface LiveTestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  metric?: string;
  detail?: string;
}

export interface LiveTestResult {
  overallSuccess: boolean;
  timestamp: string;
  totalDurationMs: number;
  steps: LiveTestStep[];
  egressIp: string;
  measuredLatencyMs: number;
  throughputKbps: number;
  verdict: string;
}

export interface DiagnosticResult {
  backendReachability: string;
  peerRelayStatus: string;
  dnsResolution: {
    testDomain: string;
    resolvedIps: string[];
    latencyMs: number;
    status: string;
  };
  providerEgress: {
    cellularCarrier: string;
    cgNatType: string;
    externalPublicIp: string;
    geographicLocation: string;
    status: string;
  };
  clientReceiver: {
    location: string;
    observedEgressIp: string;
    matchVerdict: string;
    routingPath: string;
  };
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
