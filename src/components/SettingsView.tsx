import React, { useState } from 'react';
import { Sliders, Save, Check, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [relayUrl, setRelayUrl] = useState('wss://netsetu.np/ws');
  const [dnsServer, setDnsServer] = useState('1.1.1.1');
  const [mtu, setMtu] = useState('1420');
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [protocol, setProtocol] = useState('socks5_reverse_tunnel');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-800">
        <div className="flex items-center space-x-3 text-cyan-400 mb-2">
          <Sliders className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-white">Network & Protocol Settings</h1>
        </div>
        <p className="text-xs text-slate-300">
          Configure relay signaling endpoints, DNS leak protection, MTU, and reverse tunnel mechanics
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#001f54] border border-cyan-900 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Relay & Signaling Coordinator URL
          </label>
          <input
            type="text"
            value={relayUrl}
            onChange={(e) => setRelayUrl(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            WebSocket signaling host (Kathmandu Regional Node or self-hosted instance).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Encrypted DNS Resolver
            </label>
            <select
              value={dnsServer}
              onChange={(e) => setDnsServer(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-800 rounded-lg text-white text-xs"
            >
              <option value="1.1.1.1">Cloudflare (1.1.1.1) — Recommended</option>
              <option value="8.8.8.8">Google Public DNS (8.8.8.8)</option>
              <option value="provider_cellular">Provider Mobile Carrier DNS (Ncell)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tunnel MTU (Maximum Transmission Unit)
            </label>
            <select
              value={mtu}
              onChange={(e) => setMtu(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-800 rounded-lg text-white text-xs"
            >
              <option value="1420">1420 bytes (Optimized for Mobile Cellular NAT)</option>
              <option value="1280">1280 bytes (IPv6 Minimum Strict)</option>
              <option value="1500">1500 bytes (Standard Ethernet)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Reverse Tunnel Data Engine
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-800 rounded-lg text-white text-xs"
          >
            <option value="socks5_reverse_tunnel">
              Authenticated Reverse SOCKS5 Egress Engine (Android Native Non-Root)
            </option>
            <option value="http_connect_tunnel">HTTP/HTTPS CONNECT Reverse Proxy</option>
            <option value="wireguard_relay">WireGuard Relay Protocol (Requires Kernel TUN)</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-cyan-950">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
              className="w-4 h-4 text-cyan-500 rounded bg-[#0a1128] border-cyan-800"
            />
            <span>Automatic Reconnect on Network Drop (Keepalive)</span>
          </label>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow"
          >
            {saved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
