import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkHealth } from '../../services/api';
import Toast from '../../components/common/Toast';
import {
  FolderKanban, Database, Layers, PlayCircle, LayoutTemplate,
  Settings, LogOut, Cpu, Plus, Sparkles, ExternalLink,
  ChevronRight, Activity, Bell, Search, ShieldCheck, Terminal, Code,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, signOut, isDevMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [backendOnline, setBackendOnline] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const showToast = (msg, type = 'success', title = '') => {
    setToast({ msg, type, title });
    setTimeout(() => setToast(null), 4000);
  };

  const navItems = [
    { to: '/app/projects', label: 'Projects', icon: FolderKanban },
    { to: '/app/datasets', label: 'Datasets', icon: Database },
    { to: '/app/models', label: 'Models', icon: Layers },
    { to: '/app/runs', label: 'Run History', icon: PlayCircle },
    { to: '/app/code', label: 'Python Studio', icon: Code },
    { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
    { to: '/app/admin', label: 'Admin Ops', icon: ShieldCheck },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex text-slate-800 font-sans bg-slate-50">
      {/* Toast notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Sidebar */}
      <aside
        className="w-64 border-r flex flex-col shrink-0 select-none z-20"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Brand */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/app/projects')}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
            >
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-sora font-extrabold text-base tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
                FlowML
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-400">
                Studio Workspace
              </div>
            </div>
          </div>

          {/* Backend Status indicator */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
            style={{
              background: backendOnline ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: backendOnline ? '#22c55e' : '#ef4444',
              border: `1px solid ${backendOnline ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}
            title={backendOnline ? 'Backend API connected' : 'Backend offline'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
            />
            {backendOnline ? 'API OK' : 'API DISCONNECTED'}
          </div>
        </div>

        {/* Studio Launch Quick Action */}
        <div className="p-4">
          <button
            onClick={() => navigate('/studio')}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] group"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            Open Canvas Studio
            <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-3 rounded-2xl flex items-center gap-3 bg-slate-100/70 border border-slate-200/60">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate leading-tight text-slate-900">
                {user?.displayName || 'FlowML Engineer'}
              </div>
              <div className="text-[10px] truncate text-slate-500">
                {user?.email || 'dev@flowml.studio'}
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate('/signin');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="h-16 border-b px-8 flex items-center justify-between shrink-0 z-10"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-4">
            <h2 className="font-sora text-base font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              {navItems.find((n) => location.pathname.startsWith(n.to))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Dev Mode Badge */}
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5"
              style={{
                background: isDevMode ? 'rgba(99,102,241,0.12)' : 'rgba(34,197,94,0.12)',
                color: isDevMode ? '#818cf8' : '#22c55e',
                border: `1px solid ${isDevMode ? 'rgba(99,102,241,0.25)' : 'rgba(34,197,94,0.25)'}`,
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isDevMode ? 'DEV_AUTH Mock' : 'Firebase SDK'}
            </div>
          </div>
        </header>

        {/* Routed Sub-view */}
        <main className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--color-bg)' }}>
          <Outlet context={{ showToast }} />
        </main>
      </div>
    </div>
  );
}
