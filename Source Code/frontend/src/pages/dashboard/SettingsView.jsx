import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Settings, User, Shield, Key, LogOut,
  CheckCircle2, AlertCircle, Sparkles, Terminal, Copy, Check,
} from 'lucide-react';

export default function SettingsView() {
  const { user, signOut, isDevMode } = useAuth();
  const { showToast } = useOutletContext();
  const navigate = useNavigate();

  const [copiedKey, setCopiedKey] = useState(false);
  const [autoSave, setAutoSave] = useState('2');

  const envVars = [
    { key: 'VITE_FIREBASE_API_KEY', status: import.meta.env.VITE_FIREBASE_API_KEY ? 'Configured' : 'Missing / Using Dev Mock' },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', status: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Configured' : 'Missing / Using Dev Mock' },
    { key: 'VITE_FIREBASE_PROJECT_ID', status: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Configured' : 'Missing / Using Dev Mock' },
    { key: 'VITE_FIREBASE_STORAGE_BUCKET', status: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'Configured' : 'Missing / Using Dev Mock' },
    { key: 'VITE_API_URL', status: import.meta.env.VITE_API_URL || 'http://localhost:8000 (Default)' },
  ];

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      showToast('User UID copied to clipboard.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-sora text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Account & Environment Settings
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Manage your FlowML user profile, authentication configuration, workspace preferences, and API keys.
        </p>
      </div>

      {/* User Profile Card */}
      <div
        className="rounded-3xl p-6 border shadow-sm"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h3 className="font-sora font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <User className="w-4 h-4 text-primary" />
          Active Profile
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
              {user?.displayName || 'FlowML Engineer'}
            </h4>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {user?.email || 'dev@flowml.studio'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                UID: {user?.uid || 'dev-user-demo'}
              </span>
              <button
                onClick={handleCopyUid}
                className="p-1 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                title="Copy UID"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              signOut();
              navigate('/signin');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1.5 transition-colors self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Auth Provider & Firebase Integration Status */}
      <div
        className="rounded-3xl p-6 border shadow-sm"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sora font-bold text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Shield className="w-4 h-4 text-primary" />
            Authentication Infrastructure Status
          </h3>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold"
            style={{
              background: isDevMode ? 'rgba(99, 102, 241, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: isDevMode ? '#818cf8' : '#22c55e',
              border: `1px solid ${isDevMode ? 'rgba(99, 102, 241, 0.25)' : 'rgba(34, 197, 94, 0.25)'}`,
            }}
          >
            {isDevMode ? 'DEV_AUTH Mock Active' : 'Live Firebase Auth'}
          </span>
        </div>

        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {isDevMode
            ? 'The frontend is currently utilizing the DEV_AUTH fallback provider with localStorage session persistence and simulated JWT tokens. All backend API requests automatically pass your local UID through the HTTP Bearer header.'
            : 'Connected directly to Google Firebase Authentication service.'}
        </p>

        {/* Environment Variable Check Table */}
        <div className="rounded-2xl border overflow-hidden text-xs" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
          <div className="p-3 border-b text-[10px] uppercase font-bold tracking-wider" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            Teammate Firebase SDK Environment Keys
          </div>
          <div className="divide-y text-[11px] font-mono" style={{ borderColor: 'var(--color-border)' }}>
            {envVars.map((e) => (
              <div key={e.key} className="p-3 flex items-center justify-between">
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{e.key}</span>
                <span className={e.status.includes('Configured') ? 'text-emerald-600' : 'text-slate-400'}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Preferences */}
      <div
        className="rounded-3xl p-6 border shadow-sm"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h3 className="font-sora font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Settings className="w-4 h-4 text-primary" />
          Workspace Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                Interface Theme
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                FlowML uses a clean light theme optimised for focus
              </div>
            </div>

            <span
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Light Mode
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                Studio Autosave Interval
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Frequency of debounced canvas state synchronization
              </div>
            </div>

            <select
              value={autoSave}
              onChange={(e) => {
                setAutoSave(e.target.value);
                showToast(`Autosave interval set to ${e.target.value}s`, 'success');
              }}
              className="px-3 py-1.5 rounded-xl text-xs border focus:outline-none"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="1">1 second (Instant)</option>
              <option value="2">2 seconds (Balanced)</option>
              <option value="5">5 seconds (Conservative)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
