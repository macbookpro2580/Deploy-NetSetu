import React, { useState } from 'react';
import { Device, ActiveSession, PairingInvitation } from '../types';
import {
  Radio,
  Power,
  Wifi,
  Signal,
  ShieldCheck,
  Users,
  AlertOctagon,
  Check,
  X,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Info,
  BatteryCharging,
  ArrowLeftRight,
  Database,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProviderViewProps {
  providerDevice: Device | undefined;
  activeSession: ActiveSession | undefined;
  pendingPairings: PairingInvitation[];
  onStartSharing: () => void;
  onStopSharing: () => void;
  onApprovePairing: (pairingId: string, clientDeviceId: string) => void;
  onRejectPairing: (pairingId: string) => void;
  onRevokeSession: (sessionId: string) => void;
  onSwitchToReceiver?: () => void;
  onOpenLedger?: () => void;
}

export const ProviderView: React.FC<ProviderViewProps> = ({
  providerDevice,
  activeSession,
  pendingPairings,
  onStartSharing,
  onStopSharing,
  onApprovePairing,
  onRejectPairing,
  onRevokeSession,
  onSwitchToReceiver,
  onOpenLedger,
}) => {
  const isSharing = providerDevice?.status === 'sharing';
  const [killConfirm, setKillConfirm] = useState(false);
  const [backgroundWakeLock, setBackgroundWakeLock] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar: Quick Switcher & Sharing Ledger link */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#001845] border border-cyan-900/60 text-xs">
        <div className="flex items-center space-x-2 text-cyan-300">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">Active Mode: Mobile Internet Provider</span>
          <span className="text-slate-400">• Sharing data with remote devices</span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenLedger && (
            <button
              onClick={onOpenLedger}
              className="px-3 py-1.5 rounded-lg bg-[#001f54] hover:bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold flex items-center space-x-1 transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Donors Ledger</span>
            </button>
          )}

          {onSwitchToReceiver && (
            <button
              onClick={onSwitchToReceiver}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Switch to Receiver Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Banner: Sharing Status & Quick Killswitch */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isSharing
          ? 'bg-gradient-to-r from-[#001f54] to-cyan-950 border-cyan-500 shadow-xl shadow-cyan-500/10'
          : 'bg-[#001f54]/90 border-slate-700'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isSharing
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Radio className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">Provider Console</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  isSharing
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isSharing ? 'Sharing Active' : 'Standby / Stopped'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Node: Active Gateway • Mobile 4G/5G Radio • Remote Egress Bridge
              </p>
            </div>
          </div>

          {/* Start / Stop Toggle */}
          <div className="flex items-center space-x-3">
            {isSharing ? (
              <button
                onClick={() => {
                  if (activeSession && !killConfirm) {
                    setKillConfirm(true);
                  } else {
                    onStopSharing();
                    setKillConfirm(false);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm flex items-center space-x-2 transition shadow-lg ${
                  killConfirm
                    ? 'bg-rose-600 text-white animate-bounce'
                    : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{killConfirm ? 'Confirm Emergency Disconnect?' : 'Stop Mobile Sharing'}</span>
              </button>
            ) : (
              <button
                onClick={onStartSharing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/30 transition transform hover:-translate-y-0.5"
              >
                <Power className="w-4 h-4 text-slate-950" />
                <span>Start Sharing Mobile Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upstream Network & Carrier Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cellular Telemetry */}
        <div className="p-5 rounded-xl bg-[#001f54] border border-cyan-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-cyan-400">Mobile Network</span>
            <Signal className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white">Cellular Mobile Data</p>
          <p className="text-xs text-slate-300 mt-0.5">Primary Physical Egress</p>
          <div className="mt-3 pt-3 border-t border-cyan-950 text-xs flex justify-between text-slate-400">
            <span>RSRP Signal:</span>
            <span className="text-emerald-300 font-mono">-74 dBm (Excellent)</span>
          </div>
        </div>

        {/* CGNAT & Public Egress IP */}
        <div className="p-5 rounded-xl bg-[#001f54] border border-cyan-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-cyan-400">Provider Egress IP</span>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold font-mono text-cyan-300">103.104.148.45</p>
          <p className="text-xs text-slate-300 mt-0.5">Physical Cellular Exit Node</p>
          <div className="mt-3 pt-3 border-t border-cyan-950 text-xs flex justify-between text-slate-400">
            <span>Internal CGNAT IP:</span>
            <span className="text-slate-300 font-mono">100.64.12.88</span>
          </div>
        </div>

        {/* Security & Sovereignty Status */}
        <div className="p-5 rounded-xl bg-[#001f54] border border-cyan-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-cyan-400">Provider Control</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-white">Explicit Consent</p>
          <p className="text-xs text-slate-300 mt-0.5">No silent connections allowed</p>
          <div className="mt-3 pt-3 border-t border-cyan-950 text-xs flex justify-between text-slate-400">
            <span>Zero-Payload Logging:</span>
            <span className="text-emerald-300 font-mono">Enforced</span>
          </div>
        </div>
      </div>

      {/* Mobile Background Daemon Execution Status Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#001845] to-[#001f54] border border-cyan-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-300 border border-teal-700 flex items-center justify-center">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Android Mobile Background Service Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {backgroundWakeLock ? 'RUNNING IN BACKGROUND' : 'PAUSED'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Guarantees continuous sharing even when user locks phone screen or switches apps.
              </p>
            </div>
          </div>

          <button
            onClick={() => setBackgroundWakeLock(!backgroundWakeLock)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              backgroundWakeLock
                ? 'bg-[#0a1128] text-teal-300 border-teal-800 hover:bg-teal-950'
                : 'bg-cyan-500 text-slate-950 border-cyan-400'
            }`}
          >
            {backgroundWakeLock ? 'WakeLock Active (Tap to Pause)' : 'Re-engage WakeLock'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3 pt-3 border-t border-cyan-900/50">
          <div className="p-2.5 rounded-lg bg-[#0a1128] border border-cyan-950">
            <span className="text-slate-400 block mb-0.5">Android Service Type:</span>
            <span className="font-mono text-cyan-300 font-semibold">Foreground Service (Sticky)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0a1128] border border-cyan-950">
            <span className="text-slate-400 block mb-0.5">CPU WakeLock:</span>
            <span className="font-mono text-emerald-300 font-semibold">PARTIAL_WAKE_LOCK (Acquired)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0a1128] border border-cyan-950">
            <span className="text-slate-400 block mb-0.5">Doze Mode Override:</span>
            <span className="font-mono text-teal-300 font-semibold">Battery Whitelist (Exempt)</span>
          </div>
        </div>
      </div>

      {/* Pending Pairing Approvals Queue */}
      {pendingPairings.length > 0 && (
        <div className="rounded-xl bg-amber-950/40 border border-amber-600/70 p-5 shadow-lg">
          <div className="flex items-center space-x-2 text-amber-300 mb-3">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-base">Incoming Authorization Requests ({pendingPairings.length})</h3>
          </div>
          <p className="text-xs text-amber-200/80 mb-4">
            A client is attempting to pair using an active invitation code. Review and explicitly approve or deny access.
          </p>

          <div className="space-y-3">
            {pendingPairings.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-lg bg-[#001f54] border border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded">
                      Code: {inv.code}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      Target: Remote Client Device
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Expires in {Math.max(0, Math.round((inv.expiresAt - Date.now()) / 1000))} seconds
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onApprovePairing(inv.id, 'dev_saptari_samsung')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Client</span>
                  </button>
                  <button
                    onClick={() => onRejectPairing(inv.id)}
                    className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Client Connection & Live Metering */}
      {activeSession ? (
        <div className="rounded-2xl bg-[#001f54] border border-cyan-700/80 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-white">Active Tunnel: Remote Client</h3>
                <p className="text-xs text-slate-400">Session ID: {activeSession.id}</p>
              </div>
            </div>

            <button
              onClick={() => onRevokeSession(activeSession.id)}
              className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-bold"
            >
              Revoke Client Access
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-xs text-slate-400">Roundtrip Latency</span>
              <p className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {activeSession.currentLatencyMs !== null ? `${activeSession.currentLatencyMs} ms` : 'Not available'}
              </p>
              <span className="text-[10px] text-slate-500">Live Peer Ping</span>
            </div>

            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-xs text-slate-400">Downloaded by Peer</span>
              <p className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {(activeSession.bytesDown / 1024 / 1024).toFixed(2)} MB
              </p>
              <span className="text-[10px] text-slate-500">Forwarded Out</span>
            </div>

            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-xs text-slate-400">Uploaded by Peer</span>
              <p className="text-xl font-bold font-mono text-blue-300 mt-1">
                {(activeSession.bytesUp / 1024 / 1024).toFixed(2)} MB
              </p>
              <span className="text-[10px] text-slate-500">Upstream egress</span>
            </div>

            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-xs text-slate-400">Session Protocol</span>
              <p className="text-xs font-bold text-slate-200 mt-2 truncate">
                Reverse SOCKS5 Egress
              </p>
              <span className="text-[10px] text-cyan-400">Mobile Native Sockets</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[#001f54]/60 border border-dashed border-cyan-900/60 text-center">
          <Smartphone className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-200">No Authorized Client Currently Connected</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Generate a short-lived pairing code in the Pairing tab to authorize a remote phone or computer to route through your internet connection.
          </p>
        </div>
      )}
    </div>
  );
};
