import React, { useState, useEffect, useRef } from 'react';
import { ScreenTab, User, Device, ActiveSession, PairingInvitation, DiagnosticResult } from './types';
import { Header } from './components/Header';
import { WelcomeView } from './components/WelcomeView';
import { AuthView } from './components/AuthView';
import { ProviderView } from './components/ProviderView';
import { ClientView } from './components/ClientView';
import { PairingView } from './components/PairingView';
import { SessionDashboard } from './components/SessionDashboard';
import { DiagnosticsView } from './components/DiagnosticsView';
import { LiveTestEngine } from './components/LiveTestEngine';
import { ProviderLedgerView } from './components/ProviderLedgerView';
import { TrafficStatsView } from './components/TrafficStatsView';
import { DeviceManagerView } from './components/DeviceManagerView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | undefined>(undefined);
  const [pendingPairings, setPendingPairings] = useState<PairingInvitation[]>([]);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult | null>(null);
  const [diagRunning, setDiagRunning] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Demo users preset
  const demoUsers: User[] = [
    {
      id: 'usr_biratnagar_01',
      email: 'provider@netsetu.np',
      displayName: 'Aarav Sharma (Provider)',
      location: 'Mobile 5G Cellular Gateway',
    },
    {
      id: 'usr_saptari_02',
      email: 'receiver@netsetu.np',
      displayName: 'Rohan Yadav (Receiver)',
      location: 'Remote Client Device',
    },
  ];

  // Initialize with Provider by default
  useEffect(() => {
    setCurrentUser(demoUsers[0]);
    loadDevices();
    loadSessions();
  }, []);

  // Fetch registered devices
  const loadDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch {
      // Fallback
    }
  };

  // Fetch active sessions
  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        const list: ActiveSession[] = data.sessions || [];
        setSessions(list);
        const active = list.find((s) => s.status === 'active');
        setActiveSession(active);
      }
    } catch {
      // Fallback
    }
  };

  // Connect to live WebSocket relay signaling
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      // Register current client/provider device
      socket.send(JSON.stringify({
        type: 'auth',
        payload: {
          deviceId: currentUser?.id === 'usr_biratnagar_01' ? 'dev_biratnagar_pixel' : 'dev_saptari_samsung',
          role: currentUser?.id === 'usr_biratnagar_01' ? 'provider' : 'client',
          userId: currentUser?.id,
        },
        timestamp: Date.now(),
      }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'session_update' && msg.session) {
          setActiveSession(msg.session);
          loadSessions();
        } else if (msg.type === 'session_stopped' || msg.type === 'session_paused') {
          loadSessions();
        } else if (msg.type === 'pairing_result') {
          if (msg.approved && msg.session) {
            setActiveSession(msg.session);
            loadSessions();
          }
        } else if (msg.type === 'device_status_changed') {
          loadDevices();
        }
      } catch {
        // Ignored
      }
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [currentUser]);

  // Periodic heartbeat / ping for active session
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'latency_ping',
          sessionId: activeSession.id,
          timestamp: Date.now(),
        }));
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Provider: Start Sharing
  const handleStartSharing = async () => {
    const providerDev = devices.find((d) => d.id === 'dev_biratnagar_pixel') || devices[0];
    const clientDev = devices.find((d) => d.id === 'dev_saptari_samsung') || devices[1];

    if (!providerDev) return;

    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerDeviceId: providerDev.id,
          clientDeviceId: clientDev ? clientDev.id : 'dev_saptari_client',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.session);
        loadSessions();
        loadDevices();
      }
    } catch {
      // Ignored
    }
  };

  // Provider: Stop Sharing
  const handleStopSharing = async () => {
    if (activeSession) {
      await handleDisconnectSession(activeSession.id);
    }
    loadDevices();
  };

  // Create Pairing Invitation
  const handleCreateInvitation = async (ttlSeconds = 300): Promise<PairingInvitation> => {
    const providerDev = devices.find((d) => d.type === 'android_provider') || devices[0];
    const res = await fetch('/api/pairing/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerDeviceId: providerDev ? providerDev.id : 'dev_biratnagar_pixel',
        createdByUserId: currentUser?.id || 'usr_biratnagar_01',
        ttlSeconds,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create code');
    setPendingPairings((prev) => [...prev, data.invitation]);
    return data.invitation;
  };

  // Receiver: Accept / Connect with Pairing Code
  const handleAcceptPairing = async (code: string) => {
    const clientDev = devices.find((d) => d.id === 'dev_saptari_samsung') || devices[1];
    const res = await fetch('/api/pairing/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        clientDeviceId: clientDev ? clientDev.id : 'dev_saptari_samsung',
        clientUserId: currentUser?.id || 'usr_saptari_02',
        clientName: clientDev ? clientDev.name : 'Receiver Phone',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Pairing rejected');
    setActiveSession(data.session);
    loadSessions();
  };

  // Disconnect active session
  const handleDisconnectSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manually disconnected by user' }),
      });
      if (res.ok) {
        setActiveSession(undefined);
        loadSessions();
      }
    } catch {
      // Ignored
    }
  };

  // Revoke session and client device credentials
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setActiveSession(undefined);
        loadSessions();
        loadDevices();
      }
    } catch {
      // Ignored
    }
  };

  // Run Real Network Diagnostics & Egress Proof Check
  const handleRunDiagnostics = async () => {
    setDiagRunning(true);
    try {
      const res = await fetch('/api/diagnostics/egress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setDiagnosticData(data.diagnostics);
      }
    } catch {
      // Ignored
    } finally {
      setDiagRunning(false);
    }
  };

  // Register New Device
  const handleRegisterDevice = async (name: string, type: any, location: string) => {
    const res = await fetch('/api/devices/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id || 'usr_demo',
        name,
        type,
        location,
      }),
    });
    if (res.ok) {
      loadDevices();
    }
  };

  // Delete Device
  const handleDeleteDevice = async (id: string) => {
    const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadDevices();
    }
  };

  const providerDevice = devices.find((d) => d.id === 'dev_biratnagar_pixel') || devices[0];
  const clientDevice = devices.find((d) => d.id === 'dev_saptari_samsung') || devices[1];

  return (
    <div className="min-h-screen bg-[#0a1128] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          if (user.email.includes('provider')) setCurrentTab('provider');
          else if (user.email.includes('receiver')) setCurrentTab('client');
        }}
        demoUsers={demoUsers}
        wsConnected={wsConnected}
        activeSessionCount={activeSession ? 1 : 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'welcome' && <WelcomeView onSelectTab={setCurrentTab} />}
        {currentTab === 'auth' && (
          <AuthView
            currentUser={currentUser}
            onUserLoggedIn={(u, tok) => {
              setCurrentUser(u);
              setToken(tok);
              setCurrentTab(u.email.includes('provider') ? 'provider' : 'client');
            }}
            onSwitchUser={(u) => {
              setCurrentUser(u);
              setCurrentTab(u.email.includes('provider') ? 'provider' : 'client');
            }}
            demoUsers={demoUsers}
          />
        )}
        {currentTab === 'provider' && (
          <ProviderView
            providerDevice={providerDevice}
            activeSession={activeSession}
            pendingPairings={pendingPairings}
            onStartSharing={handleStartSharing}
            onStopSharing={handleStopSharing}
            onApprovePairing={async (pairingId) => {
              setPendingPairings((prev) => prev.filter((p) => p.id !== pairingId));
              await handleStartSharing();
            }}
            onRejectPairing={(pairingId) => {
              setPendingPairings((prev) => prev.filter((p) => p.id !== pairingId));
            }}
            onRevokeSession={handleRevokeSession}
            onSwitchToReceiver={() => {
              setCurrentTab('client');
              const receiverUser = demoUsers.find((u) => u.email.includes('receiver'));
              if (receiverUser) setCurrentUser(receiverUser);
            }}
            onOpenLedger={() => setCurrentTab('ledger')}
          />
        )}
        {currentTab === 'client' && (
          <ClientView
            clientDevice={clientDevice}
            activeSession={activeSession}
            onConnectWithCode={handleAcceptPairing}
            onDisconnectSession={handleDisconnectSession}
            onRunEgressDiagnostic={() => {
              setCurrentTab('diagnostics');
              handleRunDiagnostics();
            }}
            onLaunchLiveTest={() => setCurrentTab('livetest')}
            onSwitchToProvider={() => {
              setCurrentTab('provider');
              const providerUser = demoUsers.find((u) => u.email.includes('provider'));
              if (providerUser) setCurrentUser(providerUser);
            }}
            diagnosticRunning={diagRunning}
          />
        )}
        {currentTab === 'livetest' && <LiveTestEngine />}
        {currentTab === 'ledger' && <ProviderLedgerView />}
        {currentTab === 'pairing' && (
          <PairingView
            providerDevice={providerDevice}
            activeInvitations={pendingPairings}
            onCreateInvitation={handleCreateInvitation}
            onAcceptPairing={handleAcceptPairing}
          />
        )}
        {currentTab === 'dashboard' && (
          <SessionDashboard
            session={activeSession}
            providerDevice={providerDevice}
            clientDevice={clientDevice}
            onDisconnect={handleDisconnectSession}
            onRevoke={handleRevokeSession}
            onRefreshStats={loadSessions}
          />
        )}
        {currentTab === 'diagnostics' && (
          <DiagnosticsView
            session={activeSession}
            diagnosticData={diagnosticData}
            isRunning={diagRunning}
            onRunDiagnostics={handleRunDiagnostics}
          />
        )}
        {currentTab === 'traffic' && <TrafficStatsView session={activeSession} />}
        {currentTab === 'devices' && (
          <DeviceManagerView
            devices={devices}
            onRegisterDevice={handleRegisterDevice}
            onDeleteDevice={handleDeleteDevice}
          />
        )}
        {currentTab === 'settings' && <SettingsView />}
        {currentTab === 'help' && <HelpView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-950/80 bg-[#001845] py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetSetu &copy; 2026 • Encrypted Remote Internet Bridge • Global Peer-to-Peer Egress</span>
          <div className="flex space-x-4 text-cyan-400">
            <button onClick={() => setCurrentTab('livetest')} className="hover:underline font-bold text-yellow-300">
              ⚡ "Is It Working?" Test
            </button>
            <button onClick={() => setCurrentTab('ledger')} className="hover:underline">
              Data Donors Ledger
            </button>
            <button onClick={() => setCurrentTab('diagnostics')} className="hover:underline">
              Egress Verification
            </button>
            <button onClick={() => setCurrentTab('help')} className="hover:underline">
              Android VpnService Docs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
