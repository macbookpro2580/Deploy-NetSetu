import React, { useState } from 'react';
import { Device } from '../types';
import {
  Smartphone,
  Laptop,
  Trash2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MapPin,
  Check,
  X
} from 'lucide-react';

interface DeviceManagerViewProps {
  devices: Device[];
  onRegisterDevice: (name: string, type: any, location: string) => Promise<void>;
  onDeleteDevice: (id: string) => Promise<void>;
}

export const DeviceManagerView: React.FC<DeviceManagerViewProps> = ({
  devices,
  onRegisterDevice,
  onDeleteDevice,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Device['type']>('android_client');
  const [location, setLocation] = useState('Remote Client Node');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      await onRegisterDevice(name, type, location);
      setName('');
      setShowAdd(false);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (devType: Device['type']) => {
    switch (devType) {
      case 'desktop_windows':
      case 'desktop_linux':
        return <Laptop className="w-5 h-5 text-cyan-400" />;
      default:
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#001f54] border border-cyan-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 text-cyan-400">
            <Smartphone className="w-6 h-6" />
            <h1 className="text-2xl font-bold text-white">Registered Device Fleet</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Authorize or revoke registered Android and Desktop endpoints
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Device</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-[#001f54] border border-cyan-700 space-y-4">
          <h3 className="text-base font-bold text-white">Register Endpoint Identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Device Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saptari ThinkPad X1"
                className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Device Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-xs"
              >
                <option value="android_client">Android Client Phone</option>
                <option value="android_provider">Android Provider Phone</option>
                <option value="desktop_windows">Windows 10/11 Computer</option>
                <option value="desktop_linux">Linux Computer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rajbiraj, Saptari, Nepal"
                className="w-full px-3 py-2 bg-[#0a1128] border border-cyan-900 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs"
            >
              {loading ? 'Saving...' : 'Register Device'}
            </button>
          </div>
        </form>
      )}

      {/* Device List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="p-5 rounded-2xl bg-[#001f54] border border-cyan-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a1128] border border-cyan-800 flex items-center justify-center">
                    {getDeviceIcon(dev.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{dev.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{dev.location}</span>
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  dev.status === 'sharing'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : dev.status === 'online'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {dev.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-950/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Public Key:</span>
                  <span className="font-mono text-[11px] text-cyan-300 truncate max-w-[200px]">
                    {dev.publicKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="font-mono text-slate-300">{dev.ipAddress || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorization:</span>
                  <span className={dev.isAuthorized ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                    {dev.isAuthorized ? 'Authorized' : 'Revoked'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-cyan-950 flex justify-end">
              <button
                onClick={() => onDeleteDevice(dev.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center space-x-1"
                title="Permanently remove device and revoke credentials"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke & Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
