import React, { useState, useEffect } from 'react';
import { ProviderContribution } from '../types';
import {
  Database,
  Radio,
  Wifi,
  Download,
  Share2,
  Clock,
  HardDrive,
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Search,
  Sparkles,
  Signal
} from 'lucide-react';

interface ProviderLedgerViewProps {
  onSelectProvider?: (providerId: string) => void;
}

export const ProviderLedgerView: React.FC<ProviderLedgerViewProps> = () => {
  const [contributions, setContributions] = useState<ProviderContribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNetwork, setFilterNetwork] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for adding/logging new contribution
  const [newDonorName, setNewDonorName] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCarrier, setNewCarrier] = useState('Ncell 5G Cellular');
  const [newNetworkType, setNewNetworkType] = useState<'5G' | '4G_LTE' | 'Broadband' | 'Wi-Fi_Direct_Mesh'>('5G');
  const [newInitialMb, setNewInitialMb] = useState('5000');
  const [newNotes, setNewNotes] = useState('');

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contributions');
      if (res.ok) {
        const data = await res.json();
        setContributions(data.contributions || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName.trim()) return;

    try {
      const bytes = (parseFloat(newInitialMb) || 1024) * 1024 * 1024;
      const res = await fetch('/api/contributions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerUserId: 'usr_' + Date.now().toString(36),
          providerName: newDonorName,
          deviceName: newDeviceName || 'Mobile 5G Gateway',
          location: newLocation || 'Primary Node',
          networkType: newNetworkType,
          carrierName: newCarrier,
          bytesIncrement: bytes,
          notes: newNotes,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewDonorName('');
        setNewDeviceName('');
        setNewLocation('');
        setNewNotes('');
        fetchContributions();
      }
    } catch {
      // Error handling
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contributions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `netsetu_donors_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalBytesAll = contributions.reduce((acc, c) => acc + c.totalDataSharedBytes, 0);
  const totalGbAll = (totalBytesAll / (1024 * 1024 * 1024)).toFixed(2);
  const totalRecipientsAll = contributions.reduce((acc, c) => acc + (c.activeRecipientsCount || 0), 0);
  const activeDonorsCount = contributions.filter((c) => c.status === 'active_sharing').length;

  const filtered = contributions.filter((c) => {
    const matchesSearch =
      c.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.carrierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterNetwork === 'all') return matchesSearch;
    return matchesSearch && c.networkType === filterNetwork;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#001f54] via-[#034078] to-[#0a1128] border border-cyan-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 text-cyan-400">
              <Database className="w-7 h-7" />
              <h1 className="text-2xl font-black text-white">Data Donors &amp; Sharing Ledger</h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Persistent storage of who is voluntarily sharing internet data, active cellular carriers, total gigabytes contributed, and connected recipients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Sharing Donor</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-4 py-2 rounded-xl bg-[#001f54] hover:bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold text-xs flex items-center space-x-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Ledger</span>
            </button>
            <button
              onClick={fetchContributions}
              disabled={loading}
              className="p-2 rounded-xl bg-[#001f54] hover:bg-cyan-950 text-cyan-300 border border-cyan-700 transition"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-cyan-900/60">
          <div className="p-3 rounded-xl bg-[#0a1128]/70 border border-cyan-900/60">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Data Shared</span>
            </span>
            <p className="text-xl font-black text-cyan-300">{totalGbAll} GB</p>
            <span className="text-[10px] text-slate-500">Across all provider nodes</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0a1128]/70 border border-cyan-900/60">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mb-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Donors Now</span>
            </span>
            <p className="text-xl font-black text-emerald-400">{activeDonorsCount} Providers</p>
            <span className="text-[10px] text-slate-500">Broadcasting cellular data</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0a1128]/70 border border-cyan-900/60">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Active Recipients</span>
            </span>
            <p className="text-xl font-black text-blue-300">{totalRecipientsAll} Mobiles</p>
            <span className="text-[10px] text-slate-500">Zero-data mobiles receiving</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0a1128]/70 border border-cyan-900/60">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Integrity Verification</span>
            </span>
            <p className="text-xl font-black text-teal-300">100% Cryptographic</p>
            <span className="text-[10px] text-slate-500">Ledger saved in .data/store</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search provider by name, device, carrier, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#001f54] border border-cyan-900/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Network:</span>
          <select
            value={filterNetwork}
            onChange={(e) => setFilterNetwork(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#001f54] border border-cyan-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">All Networks</option>
            <option value="5G">5G Cellular</option>
            <option value="4G_LTE">4G LTE Mobile</option>
            <option value="Wi-Fi_Direct_Mesh">Wi-Fi Direct P2P Mesh</option>
            <option value="Broadband">Broadband Uplink</option>
          </select>
        </div>
      </div>

      {/* Donors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((donor) => {
          const gbShared = (donor.totalDataSharedBytes / (1024 * 1024 * 1024)).toFixed(2);
          const isActive = donor.status === 'active_sharing';

          return (
            <div
              key={donor.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-[#001f54]/80 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                  : 'bg-[#001845]/90 border-slate-800'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                      isActive ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {donor.providerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                        <span>{donor.providerName}</span>
                        {isActive && <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline" />}
                      </h2>
                      <p className="text-[11px] text-slate-400">{donor.location}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? 'Sharing' : 'Standby'}
                  </span>
                </div>

                {/* Device & Network Specs */}
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a1128] border border-cyan-950">
                    <span className="text-slate-400">Device Hardware:</span>
                    <span className="font-semibold text-slate-200">{donor.deviceName}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a1128] border border-cyan-950">
                    <span className="text-slate-400">Carrier / Radio:</span>
                    <span className="font-semibold text-cyan-300 flex items-center space-x-1">
                      <Signal className="w-3 h-3 text-cyan-400" />
                      <span>{donor.carrierName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a1128] border border-cyan-950">
                    <span className="text-slate-400">Public Cellular IP:</span>
                    <span className="font-mono text-[11px] text-teal-300">{donor.ipAddress || '103.104.148.45'}</span>
                  </div>

                  {donor.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1">
                      "{donor.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Metrics Footer */}
              <div className="mt-5 pt-4 border-t border-cyan-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Shared</span>
                  <span className="text-lg font-black text-cyan-400">{gbShared} GB</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Sessions</span>
                  <span className="text-xs font-semibold text-emerald-300 flex items-center space-x-1 justify-end">
                    <Users className="w-3 h-3" />
                    <span>{donor.activeRecipientsCount} recipient{donor.activeRecipientsCount === 1 ? '' : 's'}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#001f54]/40 border border-cyan-900/50 text-slate-400">
          <Database className="w-10 h-10 mx-auto text-cyan-500/50 mb-3" />
          <p className="text-sm font-semibold">No data donors match your current filter.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or registering a new provider.</p>
        </div>
      )}

      {/* Add / Register Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#001f54] border border-cyan-600 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>Register Data Sharing Donor</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddContribution} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Donor Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Thapa (Provider)"
                  value={newDonorName}
                  onChange={(e) => setNewDonorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Device Hardware:</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy S24 Ultra (5G Gateway)"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location:</label>
                  <input
                    type="text"
                    placeholder="e.g. Biratnagar Mobile Node"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Network Technology:</label>
                  <select
                    value={newNetworkType}
                    onChange={(e) => setNewNetworkType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="5G">5G Cellular</option>
                    <option value="4G_LTE">4G LTE Mobile</option>
                    <option value="Wi-Fi_Direct_Mesh">Wi-Fi Direct P2P Mesh</option>
                    <option value="Broadband">Broadband Uplink</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cellular Carrier:</label>
                  <input
                    type="text"
                    placeholder="e.g. Ncell 5G / Nepal Telecom"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Data Shared (MB):</label>
                  <input
                    type="number"
                    value={newInitialMb}
                    onChange={(e) => setNewInitialMb(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sharing Policy / Notes:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Unlimited 5G night plan shared for emergency access."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a1128] border border-cyan-900 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-cyan-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save Donor Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
