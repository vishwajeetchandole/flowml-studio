import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkHealth } from '../../services/api';
import Toast from '../../components/common/Toast';
import Logo from '../../components/common/Logo';
import {
  FolderKanban, Database, Layers, PlayCircle, LayoutTemplate,
  Settings, LogOut, Cpu, Plus, Sparkles, ExternalLink,
  ChevronRight, Activity, Bell, Search, Terminal, Code,
  ShieldCheck, HardDrive, Play, CheckCircle2, HelpCircle,
  FileCode, Sliders, ChevronDown, RefreshCw, PanelLeftClose,
  PanelLeft, Share2, BookOpen, User,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, signOut, isDevMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [backendOnline, setBackendOnline] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // 'file' | 'edit' | 'view' | 'runtime' | 'tools' | 'help' | null
  const menuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
    { to: '/app/projects', label: 'Projects & Pipelines', shortLabel: 'Projects', icon: FolderKanban, colabDesc: 'Pipelines & DAG Graphs' },
    { to: '/app/datasets', label: 'Dataset Store', shortLabel: 'Datasets', icon: Database, colabDesc: 'CSV, Excel & Previews' },
    { to: '/app/models', label: 'Models & Tournaments', shortLabel: 'Models', icon: Layers, colabDesc: 'Trained Models & SHAP' },
    { to: '/app/runs', label: 'Execution Runs', shortLabel: 'Runs', icon: PlayCircle, colabDesc: 'Live DAG Execution Logs' },
    { to: '/app/templates', label: 'Blueprints', shortLabel: 'Templates', icon: LayoutTemplate, colabDesc: 'Starter Architectures' },
    { to: '/app/settings', label: 'Workspace Settings', shortLabel: 'Settings', icon: Settings, colabDesc: 'API Keys & Secrets' },
  ];

  const currentNavItem = navItems.find((n) => location.pathname.startsWith(n.to)) || {
    label: 'Dashboard',
    shortLabel: 'Notebook',
    colabDesc: 'FlowML Studio Workspace',
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9FA] font-sans select-none" style={{ color: 'var(--color-text)' }}>
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}

      {/* ─── Google Colab Top Header ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#DADCE0] px-3 py-1.5 shrink-0 z-40 flex items-center justify-between text-xs">
        {/* Left: Colab Brand, Title & Menu Bar */}
        <div className="flex items-center gap-3">
          {/* FlowML Logo (clicking renders to home page) */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
            title="Go to Home"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xs group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-extrabold text-base tracking-tight text-slate-800">
              Flow<span className="text-violet-600">ML</span>
            </span>
          </div>

          <div className="h-5 w-[1px] bg-slate-200" />

          {/* Notebook Document Title & Colab Menubar */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-[13px] tracking-tight">
                flowml_{currentNavItem.shortLabel.toLowerCase()}_workspace.ipynb
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                [In Drive]
              </span>
            </div>

            {/* Interactive Colab Menus: File, Edit, View, Runtime, Tools, Help */}
            <div ref={menuRef} className="flex items-center gap-1 -ml-1 mt-0.5 relative">
              {[
                {
                  id: 'file',
                  label: 'File',
                  items: [
                    { label: 'New Visual Pipeline', icon: Plus, action: () => navigate('/studio') },
                    { label: 'Open Dataset Store', icon: Database, action: () => navigate('/app/datasets') },
                    { label: 'Browse Projects', icon: FolderKanban, action: () => navigate('/app/projects') },
                    { label: 'Starter Blueprints', icon: LayoutTemplate, action: () => navigate('/app/templates') },
                    { divider: true },
                    { label: 'Return to Home', icon: Cpu, action: () => navigate('/') },
                  ],
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  items: [
                    { label: 'Clear Workspace Cache', icon: RefreshCw, action: () => showToast('Cache cleared successfully') },
                    { label: 'Reset Layout', icon: Sliders, action: () => showToast('Layout reset to default') },
                  ],
                },
                {
                  id: 'view',
                  label: 'View',
                  items: [
                    {
                      label: sidebarExpanded ? 'Collapse Navigation Rail' : 'Expand Navigation Rail',
                      icon: sidebarExpanded ? PanelLeftClose : PanelLeft,
                      action: () => setSidebarExpanded(!sidebarExpanded),
                    },
                    { label: 'Full Screen Canvas', icon: LayoutTemplate, action: () => navigate('/studio') },
                  ],
                },
                {
                  id: 'runtime',
                  label: 'Runtime',
                  items: [
                    { label: 'Open Canvas Studio', icon: Play, action: () => navigate('/studio') },
                    { label: 'View Run History', icon: PlayCircle, action: () => navigate('/app/runs') },
                    {
                      label: backendOnline ? 'Restart Kernel (FastAPI)' : 'Connect Kernel',
                      icon: RefreshCw,
                      action: () => {
                        checkHealth()
                          .then(() => {
                            setBackendOnline(true);
                            showToast('Kernel connected to FastAPI backend');
                          })
                          .catch(() => {
                            setBackendOnline(false);
                            showToast('Kernel offline - check backend server', 'error');
                          });
                      },
                    },
                  ],
                },
                {
                  id: 'tools',
                  label: 'Tools',
                  items: [
                    { label: 'Workspace Settings', icon: Settings, action: () => navigate('/app/settings') },
                    { label: 'Model Tournaments', icon: Layers, action: () => navigate('/app/models') },
                  ],
                },
                {
                  id: 'help',
                  label: 'Help',
                  items: [
                    { label: 'System Documentation', icon: BookOpen, action: () => navigate('/docs') },
                    { label: 'Interactive Tutorials', icon: FileCode, action: () => navigate('/tutorials') },
                    { label: 'About Team & Mission', icon: User, action: () => navigate('/about') },
                  ],
                },
              ].map((menu) => (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeMenu === menu.id
                        ? 'bg-slate-200 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {menu.label}
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === menu.id && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {menu.items.map((item, idx) =>
                        item.divider ? (
                          <div key={idx} className="my-1 border-t border-slate-100" />
                        ) : (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveMenu(null);
                              item.action();
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                          >
                            {item.icon && <item.icon className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{item.label}</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Colab RAM / Disk Resource Bars & Status */}
        <div className="flex items-center gap-3">
          {/* RAM & Disk Resource Meters (Signature Colab Style) */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono">
            {/* RAM Meter */}
            <div className="flex items-center gap-1.5" title="Sandbox RAM Allocation: 2.4GB / 12.0GB Used">
              <span className="text-slate-500 font-semibold text-[10px]">RAM</span>
              <div className="w-14 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[28%] rounded-full" />
              </div>
            </div>

            <span className="text-slate-300">|</span>

            {/* Disk Meter */}
            <div className="flex items-center gap-1.5" title="Sandbox Storage: 14.8GB / 100.0GB Used">
              <span className="text-slate-500 font-semibold text-[10px]">Disk</span>
              <div className="w-14 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[16%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Colab Kernel Status Pill */}
          <div
            onClick={() => {
              checkHealth()
                .then(() => {
                  setBackendOnline(true);
                  showToast('Kernel status: Connected & Healthy');
                })
                .catch(() => {
                  setBackendOnline(false);
                  showToast('Kernel offline', 'error');
                });
            }}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
              backendOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="Python 3.11 Kernel (Click to refresh)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold">
              {backendOnline ? 'Connected (Python 3.11)' : 'Kernel Offline'}
            </span>
          </div>

          {/* Dev Mode Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono font-medium border"
            style={{
              background: isDevMode ? 'rgba(124,58,237,0.06)' : 'rgba(34,197,94,0.06)',
              color: isDevMode ? '#7C3AED' : '#16a34a',
              borderColor: isDevMode ? 'rgba(124,58,237,0.2)' : 'rgba(34,197,94,0.2)',
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isDevMode ? 'Dev Mock' : 'Firebase SDK'}</span>
          </div>

          {/* Open Studio Canvas Action Button */}
          <button
            onClick={() => navigate('/studio')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-xs active:scale-[0.98]"
            title="Open Pipeline Canvas"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Canvas</span>
          </button>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div
              className="w-7 h-7 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs"
              title={user?.email || 'FlowML Engineer'}
            >
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => {
                signOut();
                navigate('/signin');
              }}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Colab Notebook Toolbar (Action Ribbon) ─────────────────────────── */}
      <div className="bg-white border-b border-[#DADCE0] px-4 py-1.5 shrink-0 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={sidebarExpanded ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            {sidebarExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <span className="text-slate-300">|</span>

          {/* Quick Action: + Pipeline / + Code button */}
          <button
            onClick={() => navigate('/studio')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-violet-600" />
            <span>+ Pipeline Node</span>
          </button>

          {/* Quick Action: + Dataset button */}
          <button
            onClick={() => navigate('/app/datasets')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Dataset</span>
          </button>

          {/* Quick Action: Run Models */}
          <button
            onClick={() => navigate('/app/models')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Model Leaderboard</span>
          </button>
        </div>

        {/* Current Path Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>FlowML Workspace</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-800">{currentNavItem.label}</span>
        </div>
      </div>

      {/* ─── Body Area: Colab Activity Bar & Main Content ───────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Colab Activity Bar (Slim Icon Rail) */}
        <aside
          className={`bg-white border-r border-[#DADCE0] flex flex-col shrink-0 transition-all duration-200 ${
            sidebarExpanded ? 'w-56' : 'w-14'
          }`}
        >
          {/* Section Navigation Items */}
          <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={!sidebarExpanded ? item.label : undefined}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    active
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {/* Colab-style active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-violet-600 rounded-r" />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {sidebarExpanded && (
                    <div className="min-w-0 flex-1 truncate">
                      <div className="truncate text-xs">{item.shortLabel}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.colabDesc}</div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Colab Utility Links */}
          <div className="p-2 border-t border-[#DADCE0] space-y-1">
            <button
              onClick={() => navigate('/docs')}
              title="Documentation"
              className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
              {sidebarExpanded && <span className="truncate">Docs & Manual</span>}
            </button>
            <button
              onClick={() => navigate('/tutorials')}
              title="Tutorials"
              className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <FileCode className="w-4 h-4 shrink-0 text-slate-400" />
              {sidebarExpanded && <span className="truncate">Tutorials</span>}
            </button>
          </div>
        </aside>

        {/* Main Routed Workspace Container */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-6 min-w-0">
          <Outlet context={{ showToast }} />
        </main>
      </div>
    </div>
  );
}
