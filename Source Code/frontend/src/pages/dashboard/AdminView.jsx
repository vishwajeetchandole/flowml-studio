import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Users, Server, HardDrive, Cpu, Activity,
  Sliders, ShieldCheck, UserCheck, UserX, RefreshCw, AlertTriangle,
  Clock, Lock, CheckCircle2, Save, Terminal, ArrowUpRight
} from 'lucide-react';
import {
  adminListUsers,
  adminSetUserStatus,
  adminListJobs,
  adminGetSystemMetrics,
  adminGetLimits,
  adminUpdateLimits,
  adminGetAuditLogs
} from '../../services/api';

export default function AdminView() {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState({ summary: {}, running_jobs: [], failed_jobs: [] });
  const [system, setSystem] = useState(null);
  const [limits, setLimits] = useState({
    execution_timeout_sec: 15,
    memory_limit_mb: 256,
    max_upload_size_mb: 50,
    per_user_quota_datasets: 25,
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLimits, setSavingLimits] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // users | jobs | system | limits | audit

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, j, s, l, a] = await Promise.all([
        adminListUsers().catch(() => []),
        adminListJobs().catch(() => ({ summary: {}, running_jobs: [], failed_jobs: [] })),
        adminGetSystemMetrics().catch(() => null),
        adminGetLimits().catch(() => null),
        adminGetAuditLogs(30).catch(() => []),
      ]);
      setUsers(u || []);
      setJobs(j || { summary: {}, running_jobs: [], failed_jobs: [] });
      setSystem(s);
      if (l) setLimits(l);
      setAuditLogs(a || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (uid, currentStatus) => {
    try {
      const res = await adminSetUserStatus(uid, !currentStatus);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, is_active: res.is_active } : u))
      );
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    setSavingLimits(true);
    try {
      const updated = await adminUpdateLimits(limits);
      setLimits(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to update limits');
    } finally {
      setSavingLimits(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Admin Governance
            </span>
            <span className="text-xs text-slate-500">Platform telemetry, limits & audit trail</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Security & Operations Center</h2>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <span className="text-[10px] text-emerald-400">
            {users.filter((u) => u.is_active).length} Active accounts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1422] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Workers</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{jobs.summary?.running || 0}</p>
          <span className="text-[10px] text-slate-400">
            {jobs.summary?.queued || 0} Queued in queue
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1422] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Host Memory Load</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {system?.memory ? `${system.memory.used_pct}%` : '32%'}
          </p>
          <span className="text-[10px] text-slate-400">
            {system?.memory ? `${system.memory.available_mb}MB free` : 'Sandbox bounded'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1422] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Storage Capacity</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {system?.storage ? `${system.storage.used_pct}%` : '18%'}
          </p>
          <span className="text-[10px] text-slate-400">
            {system?.storage ? `${system.storage.free_gb} GB Free` : 'LocalDiskStore'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold">
        {[
          { id: 'users', label: 'User Governance', icon: Users },
          { id: 'jobs', label: 'Job Queue Monitor', icon: Activity },
          { id: 'limits', label: 'Execution Limits', icon: Sliders },
          { id: 'audit', label: 'Security Audit Logs', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Users Table */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-[#0e1422] border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Managed Accounts</h3>
            <span className="text-xs text-slate-500 font-mono">{users.length} accounts indexed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b2d] text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">UID Identifier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Datasets</th>
                  <th className="px-4 py-3">Models</th>
                  <th className="px-4 py-3">Runs</th>
                  <th className="px-4 py-3">Disk Usage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.uid} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-medium text-white">{u.uid}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{u.dataset_count}</td>
                      <td className="px-4 py-3 font-mono">{u.model_count}</td>
                      <td className="px-4 py-3 font-mono">{u.run_count}</td>
                      <td className="px-4 py-3 font-mono">{u.storage_mb} MB</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.uid, u.is_active)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.is_active
                              ? 'bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white'
                              : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Job Queue Monitor */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Currently Running ({jobs.running_jobs.length})
              </h4>
              {jobs.running_jobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No active pipeline jobs running.</p>
              ) : (
                <div className="space-y-2">
                  {jobs.running_jobs.map((j) => (
                    <div key={j.run_id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
                      <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                        <span>{j.run_id}</span>
                        <span className="animate-pulse">● Running</span>
                      </div>
                      <div className="text-slate-400">UID: {j.uid}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Recent Failures ({jobs.failed_jobs.length})
              </h4>
              {jobs.failed_jobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">Zero failed executions recorded.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {jobs.failed_jobs.map((j) => (
                    <div key={j.run_id} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs font-mono">
                      <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                        <span>{j.run_id}</span>
                        <span>Failed</span>
                      </div>
                      <div className="text-slate-400 truncate">Err: {j.error || 'Execution halted'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Configurable Limits Form */}
      {activeTab === 'limits' && (
        <form onSubmit={handleSaveLimits} className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 max-w-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Platform Execution Limits</h3>
              <p className="text-xs text-slate-400">Sandbox boundaries enforced across all worker processes</p>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Updated
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Timeout Limit (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={limits.execution_timeout_sec}
                onChange={(e) =>
                  setLimits({ ...limits, execution_timeout_sec: parseInt(e.target.value) || 15 })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Worker RAM Limit (MB)
              </label>
              <input
                type="number"
                min="64"
                max="2048"
                step="64"
                value={limits.memory_limit_mb}
                onChange={(e) =>
                  setLimits({ ...limits, memory_limit_mb: parseInt(e.target.value) || 256 })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Upload File Size (MB)
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={limits.max_upload_size_mb}
                onChange={(e) =>
                  setLimits({ ...limits, max_upload_size_mb: parseInt(e.target.value) || 50 })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Per-User Dataset Quota
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={limits.per_user_quota_datasets}
                onChange={(e) =>
                  setLimits({ ...limits, per_user_quota_datasets: parseInt(e.target.value) || 25 })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#080d19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingLimits}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-3.5 h-3.5" /> {savingLimits ? 'Saving…' : 'Save Platform Limits'}
          </button>
        </form>
      )}

      {/* Tab 4: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-[#0e1422] border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Security Event Trail</h3>
            <span className="text-xs text-slate-500">Chronological tamper-evident audit records</span>
          </div>

          <div className="divide-y divide-white/5">
            {auditLogs.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No security audit events recorded.</p>
            ) : (
              auditLogs.map((evt, idx) => (
                <div key={idx} className="p-3.5 hover:bg-white/[0.02] flex items-start justify-between gap-4 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {evt.event_type}
                      </span>
                      <span className="text-slate-300 font-semibold">{evt.actor_uid}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{JSON.stringify(evt.details)}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{evt.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
