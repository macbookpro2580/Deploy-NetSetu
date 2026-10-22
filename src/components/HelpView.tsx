import React from 'react';
import {
  HelpCircle,
  Smartphone,
  Laptop,
  Radio,
  Download,
  AlertTriangle,
  Terminal,
  ShieldAlert,
  Server
} from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-800">
        <div className="flex items-center space-x-3 text-cyan-400 mb-2">
          <HelpCircle className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-white">Engineering Documentation & Troubleshooting</h1>
        </div>
        <p className="text-xs text-slate-300">
          Everything you need to know about operating NetSetu for secure remote internet sharing
        </p>
      </div>

      {/* Accordion / FAQ Cards */}
      <div className="space-y-4">
        {/* Guide 1: The Provider-to-Receiver Workflow */}
        <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-900">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>How do Provider and Receiver connect?</span>
          </h3>
          <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              1. <strong>Mobile Provider:</strong> Opens NetSetu on their smartphone or gateway, taps <em>Start Sharing Mobile Data</em>, and taps <em>Generate Pairing Code</em>.
            </p>
            <p>
              2. <strong>Remote Receiver:</strong> Opens NetSetu on their Android phone or PC, selects Receiver Mode, enters the 6-character code (e.g. <code>9X4K2P</code>), and taps <em>Connect</em>.
            </p>
            <p>
              3. <strong>Approval &amp; Handshake:</strong> The Provider receives an instant approval notification. Once approved, the reverse encrypted tunnel connects and routes traffic through the provider device.
            </p>
          </div>
        </div>

        {/* Guide 2: Carrier-Grade NAT (CGNAT) */}
        <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-900">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Why doesn&apos;t a standard WireGuard or direct listening port work on cellular?</span>
          </h3>
          <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Cellular carriers typically put mobile smartphones behind Carrier-Grade NAT (CGNAT, RFC 6598 <code>100.64.0.0/10</code>). Inbound ports are strictly firewalled by the carrier network.
            </p>
            <p>
              <strong>NetSetu&apos;s Solution:</strong> Both the provider phone and the receiver make <em>outbound</em> connections to the NetSetu relay coordinator. Outbound connections are 100% permitted by cellular firewalls, creating a stable reverse tunnel without port forwarding!
            </p>
          </div>
        </div>

        {/* Guide 3: Android Non-Root Forwarding Truth */}
        <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-900">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <span>How does NetSetu route packets on an unrooted Android provider phone?</span>
          </h3>
          <div className="mt-3 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Standard non-root Android does NOT allow apps to enable Linux kernel IP packet forwarding (<code>/proc/sys/net/ipv4/ip_forward</code>) or configure raw <code>iptables</code> MASQUERADE rules.
            </p>
            <p>
              NetSetu solves this by running an authenticated <strong>Egress Engine</strong> inside the Android provider foreground service. When a request arrives over the reverse tunnel, the provider phone creates a native outbound socket using Android&apos;s standard network stack. The target server sees the provider phone&apos;s cellular IP, and the response bytes are streamed back to the client!
            </p>
          </div>
        </div>

        {/* Guide 4: Desktop Client Commands */}
        <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-900">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>Windows &amp; Linux Desktop Client Commands</span>
          </h3>
          <div className="mt-3 text-xs text-slate-300 space-y-3 font-mono">
            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-slate-500 block mb-1"># Start desktop client with pairing code:</span>
              <span className="text-cyan-300">cd desktop-client && npm start 9X4K2P</span>
            </div>
            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-slate-500 block mb-1"># Windows system proxy setup:</span>
              <span className="text-cyan-300">netsh winhttp set proxy 127.0.0.1:8080</span>
            </div>
            <div className="p-3 bg-[#0a1128] rounded-xl border border-cyan-950">
              <span className="text-slate-500 block mb-1"># Linux terminal proxy environment:</span>
              <span className="text-cyan-300">export all_proxy=&quot;socks5://127.0.0.1:1080&quot;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
