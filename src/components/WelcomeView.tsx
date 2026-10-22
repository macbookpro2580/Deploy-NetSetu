import React from 'react';
import { ScreenTab } from '../types';
import {
  Shield,
  Radio,
  Download,
  ArrowRight,
  Server,
  Lock,
  Zap,
  Globe2,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Laptop,
  ArrowLeftRight
} from 'lucide-react';

interface WelcomeViewProps {
  onSelectTab: (tab: ScreenTab) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectTab }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f54] via-[#034078] to-[#0a1128] border border-cyan-800/60 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="flex items-center space-x-1">
              <span>Encrypted Remote Cellular &amp; Broadband Tunnel</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Voluntary Internet Sharing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
              Provider to Remote Peer
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            NetSetu enables any smartphone or computer with an active internet connection to securely share its connection with an authorized receiver. The provider device is the <strong>genuine public internet exit</strong>, routing traffic across carrier-grade NAT through an authenticated reverse tunnel.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onSelectTab('provider')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Radio className="w-5 h-5 text-slate-950" />
              <span>Provider Mode</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onSelectTab('client')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#001845] hover:bg-[#002855] text-cyan-300 font-bold border border-cyan-700/80 transition-all shadow-md"
            >
              <Download className="w-5 h-5 text-cyan-400" />
              <span>Receiver Mode</span>
            </button>

            <button
              onClick={() => onSelectTab('diagnostics')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium border border-slate-700 text-sm"
            >
              <span>Verify Egress IP Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network Topology Visualization */}
      <div className="rounded-2xl bg-[#001f54]/90 border border-cyan-800/50 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Globe2 className="w-5 h-5 text-cyan-400" />
              <span>Verified Data Path &amp; Egress Architecture</span>
            </h2>
            <p className="text-sm text-slate-400">
              End-to-end data route across cellular carrier NAT and regional backbones
            </p>
          </div>
          <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-700/50">
            Exit Verified: Provider Mobile Egress
          </span>
        </div>

        {/* 4-Step Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-xl bg-[#0a1128] border border-cyan-900/70 hover:border-cyan-500/50 transition">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 1: Receiver</span>
            </div>
            <h3 className="font-bold text-white text-base">Authorized Receiver</h3>
            <p className="text-xs text-slate-400 mt-1">
              Remote phone or computer. Intercepts local device packets using Android <code>VpnService</code> or desktop SOCKS5/HTTP proxy.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-300 bg-[#001f54] px-2 py-1 rounded">
              IP: 103.111.201.12 (Local)
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl bg-[#0a1128] border border-cyan-900/70 hover:border-cyan-500/50 transition">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <Server className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 2: Relay</span>
            </div>
            <h3 className="font-bold text-white text-base">NetSetu Coordinator</h3>
            <p className="text-xs text-slate-400 mt-1">
              Signaling Relay / Cloud Gateway. Multiplexes encrypted WSS control &amp; reverse tunnel streams without acting as the exit.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-300 bg-[#001f54] px-2 py-1 rounded">
              TLS 1.3 / Port 3000 WSS
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl bg-[#0a1128] border border-cyan-900/70 hover:border-cyan-500/50 transition">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <Radio className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 3: Provider</span>
            </div>
            <h3 className="font-bold text-white text-base">Provider Phone</h3>
            <p className="text-xs text-slate-400 mt-1">
              Smartphone with cellular data or broadband. Receives reverse socket requests and executes outbound socket on cellular stack.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-300 bg-[#001f54] px-2 py-1 rounded">
              CGNAT: 100.64.12.88
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-xl bg-[#0a1128] border border-cyan-900/70 hover:border-cyan-500/50 transition">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 4: Exit</span>
            </div>
            <h3 className="font-bold text-white text-base">Public Internet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Public web servers receive requests bearing the Provider cellular public IP. Egress routing verified!
            </p>
            <div className="mt-3 text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
              Egress: 103.104.148.45
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Pillars & Truthful Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-[#001f54]/70 border border-cyan-900/40 p-6">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Guaranteed Provider Egress</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Unlike commercial VPNs that substitute a foreign cloud datacenter IP, NetSetu strictly executes outbound fetches on the Provider phone's physical cellular radio.
          </p>
        </div>

        <div className="rounded-xl bg-[#001f54]/70 border border-cyan-900/40 p-6">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Strict Provider Sovereignty</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Sharing never happens silently. The provider explicitly approves pairing codes, sees real-time bandwidth consumption, and possesses an instantaneous remote killswitch.
          </p>
        </div>

        <div className="rounded-xl bg-[#001f54]/70 border border-cyan-900/40 p-6">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4">
            <Laptop className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Cross-Platform Support</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Full native Android project with Jetpack Compose & <code>VpnService</code>, plus Windows/Linux desktop client with RFC 1928 SOCKS5 & HTTP CONNECT proxy support.
          </p>
        </div>
      </div>
    </div>
  );
};
