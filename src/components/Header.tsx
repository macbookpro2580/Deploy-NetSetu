import React from 'react';
import { ScreenTab, User } from '../types';
import {
  Shield,
  Radio,
  Download,
  KeyRound,
  Activity,
  BarChart3,
  Smartphone,
  Sliders,
  HelpCircle,
  Stethoscope,
  Globe,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeftRight,
  Database,
  Zap,
  BatteryCharging
} from 'lucide-react';

interface HeaderProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  currentUser: User | null;
  onSwitchUser: (user: User) => void;
  demoUsers: User[];
  wsConnected: boolean;
  activeSessionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onSwitchUser,
  demoUsers,
  wsConnected,
  activeSessionCount,
}) => {
  const isProviderActive = currentTab === 'provider' || (currentUser?.id === 'usr_biratnagar_01' && currentTab !== 'client');

  const tabs: { id: ScreenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'welcome', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'provider', label: 'Provider Mode', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'client', label: 'Receiver Mode', icon: <Download className="w-4 h-4 text-emerald-400" /> },
    { id: 'livetest', label: '⚡ "Is It Working?" Test', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
    { id: 'ledger', label: 'Data Donors Ledger', icon: <Database className="w-4 h-4 text-teal-300" /> },
    { id: 'pairing', label: 'Pairing', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Active Session', icon: <Activity className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'traffic', label: 'Traffic Stats', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'devices', label: 'Devices', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> },
    { id: 'help', label: 'Help & Docs', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const handleToggleMode = () => {
    if (currentTab === 'provider') {
      onTabChange('client');
      const receiverUser = demoUsers.find((u) => u.email.includes('receiver')) || demoUsers[1];
      if (receiverUser) onSwitchUser(receiverUser);
    } else {
      onTabChange('provider');
      const providerUser = demoUsers.find((u) => u.email.includes('provider')) || demoUsers[0];
      if (providerUser) onSwitchUser(providerUser);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a1128]/95 backdrop-blur border-b border-cyan-900/40 text-slate-100 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('welcome')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-[#001f54]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                  NETSETU
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-300 rounded border border-cyan-800 hidden sm:flex items-center space-x-1">
                  <span>Provider</span>
                  <ArrowLeftRight className="w-2.5 h-2.5 text-cyan-400 inline" />
                  <span>Receiver</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Global Long-Distance Mobile Internet Sharing Platform
              </p>
            </div>
          </div>

          {/* Quick Mode Switcher & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* High-Visibility 1-Click Mode Switcher */}
            <button
              onClick={handleToggleMode}
              className={`px-3 py-1.5 rounded-xl border font-black text-xs flex items-center space-x-2 transition-all shadow-md transform hover:scale-[1.02] ${
                currentTab === 'provider'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-cyan-500/20'
                  : currentTab === 'client'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-emerald-500/20'
                  : 'bg-[#001f54] text-cyan-300 border-cyan-700 hover:bg-cyan-950'
              }`}
              title="Click to instantly toggle between Provider Mode (Share) and Receiver Mode (Connect)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>
                {currentTab === 'provider'
                  ? 'Active: PROVIDER ⇄ Switch to RECEIVER'
                  : currentTab === 'client'
                  ? 'Active: RECEIVER ⇄ Switch to PROVIDER'
                  : 'Switch Mode (Provider / Receiver)'}
              </span>
            </button>

            {/* Mobile Background Daemon Status */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#001845] border border-cyan-900/60 text-[11px] text-teal-300">
              <BatteryCharging className="w-3.5 h-3.5 text-teal-400" />
              <span>BG Service Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Live WS Coordinator Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#001f54] border border-cyan-900/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden md:inline text-slate-300">
                {wsConnected ? 'Relay Synced' : 'Offline'}
              </span>
              {activeSessionCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-cyan-500 text-[#001f54] text-[10px] font-bold rounded-full">
                  {activeSessionCount} active
                </span>
              )}
            </div>

            {/* Quick Profile Switcher */}
            <div className="relative hidden sm:flex items-center bg-[#001f54] border border-cyan-800/60 rounded-lg p-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400 ml-1 mr-1.5" />
              <select
                aria-label="Active Profile"
                value={currentUser?.id || ''}
                onChange={(e) => {
                  const found = demoUsers.find((u) => u.id === e.target.value);
                  if (found) onSwitchUser(found);
                }}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                {demoUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#001f54] text-white">
                    {u.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Tab Button */}
            <button
              onClick={() => onTabChange('auth')}
              className={`p-2 rounded-lg text-xs font-semibold transition border ${
                currentTab === 'auth'
                  ? 'bg-cyan-500 text-[#001f54] border-cyan-400'
                  : 'bg-[#001f54] text-cyan-300 hover:bg-cyan-950 border-cyan-800/60'
              }`}
              title="Sign in or manage accounts"
            >
              Account
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav className="bg-[#001845] border-t border-cyan-900/30 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-1.5 py-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-cyan-950/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
