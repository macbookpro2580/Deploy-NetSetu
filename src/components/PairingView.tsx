import React, { useState, useEffect } from 'react';
import { Device, PairingInvitation } from '../types';
import {
  KeyRound,
  QrCode,
  Clock,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Send,
  Lock,
  Smartphone
} from 'lucide-react';

interface PairingViewProps {
  providerDevice: Device | undefined;
  activeInvitations: PairingInvitation[];
  onCreateInvitation: (ttlSeconds?: number) => Promise<PairingInvitation>;
  onAcceptPairing: (code: string) => Promise<void>;
}

export const PairingView: React.FC<PairingViewProps> = ({
  providerDevice,
  activeInvitations,
  onCreateInvitation,
  onAcceptPairing,
}) => {
  const [createdInv, setCreatedInv] = useState<PairingInvitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  // Active code countdown timer
  useEffect(() => {
    if (!createdInv) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((createdInv.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [createdInv]);

  const handleGenerate = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const inv = await onCreateInvitation(300);
      setCreatedInv(inv);
      setTimeLeft(300);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to generate code' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdInv) {
      navigator.clipboard.writeText(createdInv.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode || inputCode.length < 6) return;
    setStatusMsg(null);
    setLoading(true);
    try {
      await onAcceptPairing(inputCode);
      setStatusMsg({ type: 'success', text: 'Pairing approved! Tunnel is now ready.' });
      setInputCode('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Pairing failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-800">
        <div className="flex items-center space-x-3 text-cyan-400 mb-2">
          <KeyRound className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-white">Cryptographic Device Pairing</h1>
        </div>
        <p className="text-xs text-slate-300">
          Pairing links the provider phone with the authorized remote client. Codes are single-use, rate-limited against brute-force attacks, and expire in 5 minutes.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          statusMsg.type === 'error'
            ? 'bg-rose-950/80 border-rose-800 text-rose-300'
            : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROVIDER: Generate Code */}
        <div className="rounded-2xl bg-[#001f54] border border-cyan-800/80 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Provider Action
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Single-Use Token
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Generate Invitation Code</h3>
            <p className="text-xs text-slate-300 mt-1 mb-6">
              Create a fresh 6-character Crockford Base32 token to share with the authorized remote peer.
            </p>

            {createdInv ? (
              <div className="p-6 rounded-xl bg-[#0a1128] border border-cyan-500/60 text-center space-y-3">
                <span className="text-xs text-slate-400 font-medium">PAIRING CODE</span>
                <div className="text-4xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                  {createdInv.code}
                </div>

                {/* Expiration Timer */}
                <div className="flex items-center justify-center space-x-2 text-xs font-mono text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>

                <div className="pt-2 flex justify-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-[#001f54] hover:bg-[#002f74] border border-cyan-700 text-cyan-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-3 py-1.5 rounded-lg bg-[#001f54] hover:bg-[#002f74] border border-cyan-700 text-slate-300 text-xs font-semibold"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#0a1128]/50 border border-dashed border-cyan-900/60 text-center">
                <QrCode className="w-12 h-12 text-cyan-700 mx-auto mb-3" />
                <p className="text-xs text-slate-400">No active invitation code generated</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate New Pairing Code'}
            </button>
          </div>
        </div>

        {/* CLIENT: Enter Code */}
        <div className="rounded-2xl bg-[#001f54] border border-cyan-800/80 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Receiver Action
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Rate-Limited (5 tries)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Enter Provider Code</h3>
            <p className="text-xs text-slate-300 mt-1 mb-6">
              Enter the code supplied by the mobile provider phone to authorize connection.
            </p>

            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pairing Code
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 9X4K2P"
                  className="w-full px-4 py-3 bg-[#0a1128] border border-cyan-800 rounded-xl text-cyan-300 font-mono text-2xl tracking-widest text-center focus:outline-none focus:border-cyan-400 uppercase font-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading || inputCode.length < 6}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Pair & Authenticate'}
              </button>
            </form>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-[#0a1128] border border-cyan-950 text-xs text-slate-400 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Replay attacks are rejected. Tokens cannot be reused once a session is established or expired.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
