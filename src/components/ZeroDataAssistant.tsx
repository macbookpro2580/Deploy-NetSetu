import React, { useState } from 'react';
import {
  WifiOff,
  Radio,
  Wifi,
  Smartphone,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BatteryCharging,
  Layers,
  Sparkles,
  Signal,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface ZeroDataAssistantProps {
  onConnectDirect?: () => void;
}

export const ZeroDataAssistant: React.FC<ZeroDataAssistantProps> = ({ onConnectDirect }) => {
  const [selectedMode, setSelectedMode] = useState<'p2p_mesh' | 'carrier_zero_balance'>('p2p_mesh');
  const [p2pActive, setP2pActive] = useState(false);
  const [backgroundDaemonActive, setBackgroundDaemonActive] = useState(true);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-[#001f54] via-[#034078] to-[#0a1128] border border-cyan-500 shadow-xl space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white">Zero-Data &amp; No-Wi-Fi Connection Suite</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
                Specialized Recipient Tech
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              How mobiles with zero mobile balance and no local Wi-Fi router receive internet from NetSetu
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-[#0a1128] p-1 rounded-xl border border-cyan-900">
          <button
            onClick={() => setSelectedMode('p2p_mesh')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedMode === 'p2p_mesh'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Local Wi-Fi Direct Mesh</span>
          </button>
          <button
            onClick={() => setSelectedMode('carrier_zero_balance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedMode === 'carrier_zero_balance'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Remote Zero-Balance Tunnel</span>
          </button>
        </div>
      </div>

      {/* Visual Architectural Diagram */}
      <div className="p-4 rounded-xl bg-[#0a1128]/90 border border-cyan-900/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-3">
          {selectedMode === 'p2p_mesh'
            ? 'Architecture 1: Direct Radio Mesh (0 Router & 0 Client SIM Needed)'
            : 'Architecture 2: Long-Distance Carrier Reverse Tunnel (0 SIM Balance)'}
        </span>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          {/* Receiver Phone */}
          <div className="flex-1 p-3.5 rounded-xl bg-[#001f54] border border-cyan-800 w-full">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1 justify-center md:justify-start">
              <Smartphone className="w-4 h-4" />
              <span className="font-bold text-xs text-white">Recipient Mobile Phone</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {selectedMode === 'p2p_mesh'
                ? 'No SIM data & No Wi-Fi router. Connects via Android Wi-Fi Direct radio.'
                : 'Has SIM card with 0 balance. Establishes reverse UDP signaling to relay.'}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
              0 MB SIM Data • 0 Router
            </span>
          </div>

          {/* Connection Link */}
          <div className="flex flex-col items-center justify-center px-2 py-1 text-cyan-400">
            <span className="text-[10px] font-bold font-mono text-cyan-300">
              {selectedMode === 'p2p_mesh' ? 'P2P Direct Radio (5 GHz)' : 'Reverse Relay Socket'}
            </span>
            <div className="flex items-center space-x-1 my-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <ArrowRight className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] text-slate-400">Encrypted Tunnel</span>
          </div>

          {/* Provider Gateway Phone */}
          <div className="flex-1 p-3.5 rounded-xl bg-[#001f54] border border-cyan-800 w-full">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1 justify-center md:justify-start">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-white">Provider Mobile Gateway</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Has active 4G/5G mobile internet. Runs NetSetu socket forwarder in background.
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              Active Mobile 5G Egress
            </span>
          </div>

          {/* Internet */}
          <div className="flex flex-col items-center justify-center px-2 py-1 text-cyan-400">
            <span className="text-[10px] font-bold font-mono text-teal-300">Egress</span>
            <ArrowRight className="w-5 h-5 text-teal-400 my-1" />
            <span className="text-[10px] text-slate-400">Global Web</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#001f54] border border-cyan-800 text-center shrink-0">
            <Signal className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-white block">Internet</span>
            <span className="text-[10px] text-emerald-400">All Apps Work</span>
          </div>
        </div>
      </div>

      {/* Mode Details & Step-by-Step Instructions */}
      {selectedMode === 'p2p_mesh' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-900">
              <span className="font-bold text-cyan-300 block mb-1">Step 1: Open NetSetu on Both Phones</span>
              <p className="text-slate-400 text-[11px]">
                Both the sharing phone (Provider) and the offline phone (Recipient) launch NetSetu. No internet is required on the recipient phone to open the app.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-900">
              <span className="font-bold text-cyan-300 block mb-1">Step 2: Initialize P2P Wi-Fi Direct Radio</span>
              <p className="text-slate-400 text-[11px]">
                Recipient taps "Connect via P2P Mesh". Phones discover each other over device-to-device Wi-Fi Direct radio (range up to 100 meters).
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-900">
              <span className="font-bold text-cyan-300 block mb-1">Step 3: Android VpnService Routes Web</span>
              <p className="text-slate-400 text-[11px]">
                NetSetu creates a local virtual VPN on recipient phone, funneling WhatsApp, YouTube, and browser packets through the provider's 5G.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-700">
            <div className="flex items-center space-x-3">
              <Radio className={`w-5 h-5 ${p2pActive ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
              <div>
                <span className="text-xs font-bold text-white block">
                  Wi-Fi Direct Peer Radio Bridge: {p2pActive ? 'BROADCASTING (192.168.49.1)' : 'STANDBY'}
                </span>
                <span className="text-[11px] text-slate-300">
                  Allows recipient phone with no SIM and no router to use provider internet immediately.
                </span>
              </div>
            </div>

            <button
              onClick={() => setP2pActive(!p2pActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                p2pActive
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {p2pActive ? 'Stop P2P Radio Bridge' : 'Enable Local P2P Radio Bridge'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-900">
              <span className="font-bold text-cyan-300 block mb-1">1. Long-Distance Reverse Handshake</span>
              <p className="text-slate-400 text-[11px]">
                For recipients in different cities: uses carrier zero-rated DNS or signaling endpoints to negotiate pairing with 0 mobile balance.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-900">
              <span className="font-bold text-cyan-300 block mb-1">2. Provider Cellular Inversion</span>
              <p className="text-slate-400 text-[11px]">
                Provider phone opens an outbound TLS tunnel to the NetSetu relay. When recipient requests a webpage, provider's phone fetches it.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a1128] border border-cyan-900">
              <span className="font-bold text-cyan-300 block mb-1">3. Mobile Background Egress</span>
              <p className="text-slate-400 text-[11px]">
                Provider phone continues forwarding in the background with WakeLock, keeping recipient online 24/7 without provider interaction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Background Execution Guarantee Banner */}
      <div className="p-4 rounded-xl bg-[#0a1128] border border-cyan-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-950 text-teal-300 border border-teal-700 flex items-center justify-center shrink-0">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Mobile Background Service Engine</span>
              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                ACTIVE IN BACKGROUND
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Android Foreground Service (`FOREGROUND_SERVICE_CONNECTED_DEVICE`) + Partial WakeLock ensures sharing continues when screen is off.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <span className="text-[11px] font-mono text-cyan-300">WakeLock: HELD</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
