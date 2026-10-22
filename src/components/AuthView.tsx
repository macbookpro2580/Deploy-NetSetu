import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Key, Mail, UserPlus, LogIn, Check, MapPin, Sparkles } from 'lucide-react';

interface AuthViewProps {
  currentUser: User | null;
  onUserLoggedIn: (user: User, token: string) => void;
  onSwitchUser: (user: User) => void;
  demoUsers: User[];
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentUser,
  onUserLoggedIn,
  onSwitchUser,
  demoUsers,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('Biratnagar, Nepal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { email, password, displayName, location }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onUserLoggedIn(data.user, data.token);
      setSuccess(isRegister ? 'Account created successfully!' : 'Signed in successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Active Profile Status */}
      {currentUser && (
        <div className="p-4 rounded-xl bg-[#001f54] border border-cyan-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold">
              {currentUser.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{currentUser.displayName}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Active User
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{currentUser.location}</span> • <span>{currentUser.email}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
            Authenticated
          </span>
        </div>
      )}

      {/* Quick Profile Selection */}
      <div className="rounded-xl bg-[#001f54]/80 border border-cyan-900/60 p-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Quick Preset Accounts (Provider &amp; Receiver)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Switch roles instantly to test both Provider and Receiver workflows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {demoUsers.map((u) => {
            const isSelected = currentUser?.id === u.id;
            const isBiratnagar = u.email.includes('biratnagar');
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 ring-1 ring-cyan-400'
                    : 'bg-[#0a1128] border-cyan-900/70 hover:border-cyan-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {isBiratnagar ? 'Provider Node' : 'Receiver Node'}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <h4 className="font-bold text-white text-base mt-1">{u.displayName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{u.location}</p>
                <p className="text-xs font-mono text-slate-500 mt-2">{u.email}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Auth Form */}
      <div className="rounded-2xl bg-[#001f54] border border-cyan-800/80 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-cyan-900/50 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <span>{isRegister ? 'Register New Device Operator' : 'Sign In to NetSetu'}</span>
          </h2>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setSuccess(null);
            }}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
          >
            {isRegister ? 'Already registered? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / Device Operator
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Geographic Location (Nepal)
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Biratnagar, Morang or Rajbiraj, Saptari"
                  className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@netsetu.np"
              className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
