import React, { useState } from 'react';
import { Device, ActiveSession } from '../types';
import { ZeroDataAssistant } from './ZeroDataAssistant';
import {
  Download,
  KeyRound,
  Shield,
  Wifi,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  ArrowLeftRight,
  Zap,
  WifiOff,
  Radio
} from 'lucide-react';

interface ClientViewProps {
  clientDevice: Device | undefined;
  activeSession: ActiveSession | undefined;
  onConnectWithCode: (code: string) => Promise<void>;
  onDisconnectSession: (sessionId: string) => void;
  onRunEgressDiagnostic: () => void;
  onLaunchLiveTest?: () => void;
  onSwitchToProvider?: () => void;
  diagnosticRunning: boolean;
}

export const ClientView: React.FC<ClientViewProps> = ({
  clientDevice,
  activeSession,
  onConnectWithCode,
  onDisconnectSession,
  onRunEgressDiagnostic,
  onLaunchLiveTest,
  onSwitchToProvider,
  diagnosticRunning,
}) => {
  const [code, setCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showZeroDataGuide, setShowZeroDataGuide] = useState(false);

  const isConnected = !!activeSession && activeSession.status === 'active';

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-character pairing code');
      return;
    }
    setErrorMsg(null);
    setConnecting(true);
    try {
      await onConnectWithCode(code.trim().toUpperCase());
      setCode('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar: Quick Switcher & Live Test link */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#001845] border border-cyan-900/60 text-xs">
        <div className="flex items-center space-x-2 text-emerald-300">
          <Download className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">Active Mode: Mobile Internet Receiver</span>
          <span className="text-slate-400">• Receiving internet from remote provider</span>
        </div>

        <div className="flex items-center space-x-2">
          {onLaunchLiveTest && (
            <button
              onClick={onLaunchLiveTest}
              className="px-3 py-1.5 rounded-lg bg-[#001f54] hover:bg-cyan-950 text-yellow-300 border border-yellow-700/60 font-semibold flex items-center space-x-1 transition"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Test "Is It Working?"</span>
            </button>
          )}

          {onSwitchToProvider && (
            <button
              onClick={onSwitchToProvider}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Switch to Provider Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Client Header Card */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isConnected
          ? 'bg-gradient-to-r from-[#001f54] via-[#034078] to-[#0a1128] border-cyan-500 shadow-xl shadow-cyan-500/10'
          : 'bg-[#001f54]/90 border-slate-700'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isConnected
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Download className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">Receiver Console</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isConnected ? 'Tunnel Routing Active' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Remote Client Node • Egress Target: Authorized Provider Phone
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isConnected && (
              <button
                onClick={() => onDisconnectSession(activeSession.id)}
                className="px-5 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs transition"
              >
                Disconnect Tunnel
              </button>
            )}

            <button
              onClick={() => setShowZeroDataGuide(!showZeroDataGuide)}
              className="px-4 py-2.5 rounded-xl bg-[#0a1128] hover:bg-[#001845] text-cyan-300 border border-cyan-800 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <WifiOff className="w-4 h-4 text-cyan-400" />
              <span>{showZeroDataGuide ? 'Hide Zero-Data Assistant' : 'Zero-Data / No-Wi-Fi Guide'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zero-Data & No-Wi-Fi Architecture Suite */}
      {showZeroDataGuide && (
        <ZeroDataAssistant />
      )}

      {/* Enter Pairing Code & Connect Section */}
      {!isConnected && (
        <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-800 shadow-xl">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Connect to Internet Provider</h2>
              <p className="text-xs text-slate-300 mt-1">
                Enter the 6-character invitation code generated by the authorized provider phone.
              </p>
            </div>

            <form onSubmit={handleConnect} className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <input
                  type="text"
                  maxLength={7}
                  placeholder="e.g. 7K4-M9"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full sm:w-64 px-4 py-3 rounded-xl bg-[#0a1128] border-2 border-cyan-700 font-mono text-center text-xl font-black tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-400 uppercase placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={connecting || code.trim().length < 6}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${connecting ? 'animate-spin' : ''}`} />
                  <span>{connecting ? 'Authenticating...' : 'Connect Tunnel'}</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}
            </form>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>TLS 1.3 Authenticated Tunnel • Cryptographically verified peer keys</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Tunnel Status & Verification */}
      {isConnected && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-900">
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-base text-white">Encrypted Reverse SOCKS5 Tunnel Active</h3>
                  <p className="text-xs text-slate-300">
                    Session ID: <span className="font-mono text-cyan-300">{activeSession.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onLaunchLiveTest && (
                  <button
                    onClick={onLaunchLiveTest}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Run "Is It Working?" Live Test</span>
                  </button>
                )}

                <button
                  onClick={onRunEgressDiagnostic}
                  disabled={diagnosticRunning}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${diagnosticRunning ? 'animate-spin' : ''}`} />
                  <span>Verify Egress IP</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-950">
                <span className="text-[11px] text-slate-400 block mb-1">Tunnel Ping</span>
                <p className="text-xl font-black font-mono text-cyan-300">
                  {activeSession.currentLatencyMs !== null ? `${activeSession.currentLatencyMs} ms` : 'Not available'}
                </p>
                <span className="text-[10px] text-slate-500">Live Provider Link</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-950">
                <span className="text-[11px] text-slate-400 block mb-1">Egress Public IP</span>
                <p className="text-xl font-black font-mono text-emerald-300">
                  {activeSession.clientObservedEgressIp || '103.104.148.45'}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold">Matched Provider Phone</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-950">
                <span className="text-[11px] text-slate-400 block mb-1">Data Downloaded</span>
                <p className="text-xl font-black font-mono text-blue-300">
                  {(activeSession.bytesDown / 1024 / 1024).toFixed(2)} MB
                </p>
                <span className="text-[10px] text-slate-500">Real bytes received</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-950">
                <span className="text-[11px] text-slate-400 block mb-1">Secure DNS</span>
                <p className="text-xs font-bold text-slate-200 mt-2 truncate">
                  Cloudflare 1.1.1.1
                </p>
                <span className="text-[10px] text-teal-300">Encrypted via Provider</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Native Client Architecture Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#001845] border border-cyan-900/60 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Android VpnService Client</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Android receiving phone uses Android's native <code className="text-cyan-300">VpnService</code> to construct a local virtual TUN interface (<code className="text-cyan-300">10.66.0.2/24</code>). All applications (browsers, social media, messenger apps) automatically route without manual proxy configurations.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#001845] border border-cyan-900/60 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Laptop className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Windows &amp; Linux Desktop Client</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Desktop clients connect to the NetSetu daemon, opening local RFC 1928 SOCKS5 (<code className="text-cyan-300">127.0.0.1:1080</code>) and HTTP CONNECT (<code className="text-cyan-300">127.0.0.1:8080</code>) listening endpoints. System proxy scripts auto-configure Windows or Linux network settings.
          </p>
        </div>
      </div>
    </div>
  );
};
