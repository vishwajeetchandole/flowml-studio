/**
 * ResultsOverlay.jsx
 * Full-screen overlay that appears after "Run Pipeline".
 * Shows:
 *   – Live execution progress (while running)
 *   – Overview  (stat cards + dataset info)
 *   – Models    (leaderboard + metric bars)
 *   – Predictions (table with search / pagination / CSV download)
 *   – Charts    (visualisation images)
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RotateCcw, CheckCircle2, AlertCircle, Loader2, Clock,
  AlertTriangle, Trophy, BarChart3, Hash, Cpu, TrendingUp,
  Database, Zap, Download, Search, ChevronLeft, ChevronRight,
  Table, Image, Activity,
} from 'lucide-react';

/* ─── Step status config ─────────────────────────────────────────────────────── */
const STEP_CFG = {
  running: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  Icon: Loader2,       spin: true  },
  done:    { color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   Icon: CheckCircle2,  spin: false },
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   Icon: AlertCircle,   spin: false },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  Icon: AlertTriangle, spin: false },
  skipped: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', Icon: Clock,         spin: false },
};

const PAGE_SIZE = 30;

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const fmt = (n, decimals = 1) => (n == null ? '—' : Number(n).toFixed(decimals));
const pct = (n) => (n == null ? '—' : `${(n * 100).toFixed(1)}%`);

/* ─── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: 'spring', stiffness: 220, damping: 22 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color + '20' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold font-mono truncate" style={{ color: 'var(--color-text)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
      {/* glow */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: color }} />
    </motion.div>
  );
}

/* ─── Progress view (while running) ─────────────────────────────────────────── */
function ProgressView({ steps, pipelineState }) {
  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      {steps.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-lg font-semibold">Starting pipeline…</p>
        </div>
      )}
      {steps.map((step, i) => {
        const cfg = STEP_CFG[step.status] ?? STEP_CFG.running;
        return (
          <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.color + '20' }}>
              <cfg.Icon className={`w-5 h-5 ${cfg.spin ? 'animate-spin' : ''}`} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{step.label}</p>
                <span className="text-xs font-mono shrink-0" style={{ color: 'var(--color-text-muted)' }}>{step.ts}</span>
              </div>
              {step.detail && (
                <p className="text-sm mt-1 font-mono" style={{ color: 'var(--color-text-muted)' }}>{step.detail}</p>
              )}
            </div>
          </motion.div>
        );
      })}
      {pipelineState === 'running' && (
        <div className="flex items-center gap-3 px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex gap-1">
            {[0, 0.15, 0.3].map((d) => (
              <motion.div key={d} className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: d }} />
            ))}
          </div>
          <span className="text-sm">Pipeline running…</span>
        </div>
      )}
    </div>
  );
}

/* ─── Overview tab ───────────────────────────────────────────────────────────── */
function OverviewTab({ results }) {
  const { uploadResult, trainResult, predResult, targetColumn, taskType } = results;
  const best = trainResult?.models?.find((m) => m.model_name === trainResult?.best_model);
  const metricVal = taskType === 'classification'
    ? pct(best?.accuracy)
    : fmt(best?.r2, 3);
  const metricLabel = taskType === 'classification' ? 'Accuracy' : 'R²';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database}   label="Dataset"          value={uploadResult?.file_name?.split('_').pop() ?? '—'} sub={`${uploadResult?.rows?.toLocaleString() ?? '—'} rows`} color="#3b82f6" delay={0.05} />
        <StatCard icon={Cpu}        label="Best Model"       value={trainResult?.best_model ?? '—'}                    color="#6366f1" delay={0.10} />
        <StatCard icon={TrendingUp} label={metricLabel}      value={metricVal}                                          color="#22c55e" delay={0.15} />
        <StatCard icon={Hash}       label="Predictions"      value={predResult?.predictions?.length?.toLocaleString() ?? '—'} sub={`Task: ${taskType ?? '—'}`} color="#f59e0b" delay={0.20} />
      </div>

      {/* Pipeline info */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>Pipeline Summary</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Target Column',   value: targetColumn ?? '—',           color: '#6366f1' },
            { label: 'Task Type',       value: taskType ?? '—',               color: '#3b82f6' },
            { label: 'Models Trained',  value: trainResult?.models?.length ?? '—', color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="text-xl font-bold font-mono" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Models tab ─────────────────────────────────────────────────────────────── */
function ModelsTab({ results }) {
  const { trainResult } = results;
  const models   = trainResult?.models ?? [];
  const best     = trainResult?.best_model;
  const taskType = trainResult?.taskType ?? 'classification';

  if (!models.length) return <EmptyMsg text="No model data available." />;

  const metricKey = taskType === 'regression' ? 'r2' : 'accuracy';
  const sorted = [...models].sort((a, b) => (b[metricKey] ?? -999) - (a[metricKey] ?? -999));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amber-400" />
        <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Model Leaderboard</span>
        <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
          {taskType}
        </span>
      </div>
      {sorted.map((m, i) => {
        const isBest = m.model_name === best;
        const val    = m[metricKey];
        const barPct = val != null ? Math.min(100, Math.abs(val) * 100) : 0;
        return (
          <motion.div key={m.model_name}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="p-5 rounded-2xl transition-all"
            style={{
              background: isBest ? 'rgba(99,102,241,0.08)' : 'var(--color-surface)',
              border:     `1px solid ${isBest ? 'rgba(99,102,241,0.35)' : 'var(--color-border)'}`,
            }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: isBest ? 'rgba(99,102,241,0.2)' : 'var(--color-bg)', color: isBest ? '#6366f1' : 'var(--color-text-muted)' }}>
                  #{i + 1}
                </span>
                <span className="text-lg font-bold" style={{ color: isBest ? '#6366f1' : 'var(--color-text)' }}>{m.model_name}</span>
                {isBest && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>BEST</span>
                )}
              </div>
              <span className="text-2xl font-bold font-mono" style={{ color: isBest ? '#6366f1' : 'var(--color-text)' }}>
                {taskType === 'classification' ? pct(val) : fmt(val, 4)}
              </span>
            </div>
            {/* Bar */}
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--color-border)' }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${barPct}%` }} transition={{ delay: i * 0.06 + 0.2, duration: 0.6 }}
                style={{ background: isBest ? 'linear-gradient(90deg,#6366f1,#3b82f6)' : '#4b5563' }} />
            </div>
            {/* Extra metrics */}
            {m.error ? (
              <p className="text-sm text-danger">{m.error}</p>
            ) : taskType === 'classification' ? (
              <div className="flex gap-6">
                {[['F1', pct(m.f1)], ['Precision', pct(m.precision)], ['Recall', pct(m.recall)]].map(([l, v]) => v !== '—' && (
                  <div key={l} className="text-center">
                    <p className="text-base font-bold font-mono" style={{ color: 'var(--color-text)' }}>{v}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-6">
                {[['MSE', fmt(m.mse, 4)], ['MAE', fmt(m.mae, 4)]].map(([l, v]) => v !== '—' && (
                  <div key={l} className="text-center">
                    <p className="text-base font-bold font-mono" style={{ color: 'var(--color-text)' }}>{v}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Predictions tab ────────────────────────────────────────────────────────── */
function PredictionsTab({ results }) {
  const { predResult, trainResult } = results;
  const preds    = predResult?.predictions ?? [];
  const taskType = trainResult?.taskType ?? 'classification';
  const [q, setQ]       = useState('');
  const [page, setPage] = useState(0);

  const classIdx = useMemo(() => {
    const uniq = [...new Set(preds.map(String))];
    return Object.fromEntries(uniq.map((v, i) => [v, i]));
  }, [preds]);
  const COLORS = ['#6366f1','#22c55e','#f59e0b','#3b82f6','#ef4444','#ec4899','#14b8a6'];

  const filtered = useMemo(() => preds.filter((p) => String(p).toLowerCase().includes(q.toLowerCase())), [preds, q]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice      = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const startIdx   = page * PAGE_SIZE;

  const downloadCSV = () => {
    const csv  = ['index,prediction', ...preds.map((p, i) => `${i},${p}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'predictions.csv' }).click();
    URL.revokeObjectURL(url);
  };

  if (!preds.length) return <EmptyMsg text="No predictions available. Add a Prediction node." />;

  /* Class distribution */
  const dist = preds.reduce((acc, p) => { acc[p] = (acc[p] ?? 0) + 1; return acc; }, {});
  const distEntries = Object.entries(dist).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {filtered.length.toLocaleString()} Predictions
          </span>
          {taskType === 'classification' && (
            <span className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
              {Object.keys(dist).length} classes
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Filter predictions…"
              className="pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none w-48"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          </div>
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Class distribution pills */}
      {taskType === 'classification' && (
        <div className="flex flex-wrap gap-2">
          {distEntries.map(([cls, count]) => {
            const col = COLORS[classIdx[cls] % COLORS.length];
            const pctVal = ((count / preds.length) * 100).toFixed(1);
            return (
              <div key={cls} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: col + '18', border: `1px solid ${col}40`, color: col }}>
                {cls}
                <span className="opacity-70 font-normal">{count.toLocaleString()} ({pctVal}%)</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          <span className="col-span-2">Row</span>
          <span className="col-span-10">Prediction</span>
        </div>
        {/* Rows */}
        <div style={{ background: 'var(--color-bg)', maxHeight: 420, overflowY: 'auto' }}>
          {slice.map((p, ri) => {
            const idx = startIdx + ri;
            const col = COLORS[classIdx[String(p)] % COLORS.length];
            return (
              <div key={idx} className="grid grid-cols-12 px-5 py-3 items-center transition-colors"
                style={{ borderBottom: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <span className="col-span-2 text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {String(idx).padStart(5, '0')}
                </span>
                <span className="col-span-10">
                  {taskType === 'classification' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-white" style={{ background: col }}>
                      {String(p)}
                    </span>
                  ) : (
                    <span className="text-base font-mono font-semibold" style={{ color: '#6366f1' }}>{String(p)}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Page {page + 1} of {totalPages}  ·  {filtered.length.toLocaleString()} rows
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Charts tab ─────────────────────────────────────────────────────────────── */
function ChartsTab({ results }) {
  const charts = Object.entries(results?.vizResult ?? {});
  if (!charts.length) return <EmptyMsg text="No charts available. Add an Explainable AI node." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {charts.map(([key, src]) => (
        <motion.div key={key} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <Image className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm font-bold capitalize" style={{ color: 'var(--color-text)' }}>
              {key.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="p-4">
            <img src={src.startsWith('data:') ? src : `data:image/png;base64,${src}`}
              alt={key} className="w-full rounded-xl object-contain" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyMsg({ text }) {
  return (
    <div className="py-20 text-center" style={{ color: 'var(--color-text-muted)' }}>
      <Activity className="w-12 h-12 mx-auto mb-4 opacity-25" />
      <p className="text-lg">{text}</p>
    </div>
  );
}

/* ─── Tab button ─────────────────────────────────────────────────────────────── */
function Tab({ id, label, icon: Icon, active, onClick, badge }) {
  return (
    <button onClick={() => onClick(id)}
      className="flex items-center gap-2.5 px-5 py-3 text-base font-semibold transition-all relative"
      style={{
        color:         active ? '#6366f1' : 'var(--color-text-muted)',
        borderBottom:  active ? '2.5px solid #6366f1' : '2.5px solid transparent',
        background:    'transparent',
      }}>
      <Icon className="w-4.5 h-4.5" />
      {label}
      {badge != null && (
        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: active ? 'rgba(99,102,241,0.15)' : 'var(--color-border)', color: active ? '#6366f1' : 'var(--color-text-muted)' }}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─── ResultsOverlay ─────────────────────────────────────────────────────────── */
export default function ResultsOverlay({ pipelineState, steps, results, onClose, onReset }) {
  const [tab, setTab] = useState('progress');

  const isDone    = pipelineState === 'done';
  const isError   = pipelineState === 'error';
  const isRunning = pipelineState === 'running';

  // Auto-switch to overview when done
  React.useEffect(() => {
    if (isDone && tab === 'progress') setTab('overview');
  }, [isDone]); // eslint-disable-line

  const TABS = [
    { id: 'progress',     label: 'Progress',     icon: Activity,  badge: steps.length || null },
    { id: 'overview',     label: 'Overview',     icon: BarChart3, show: isDone || isError     },
    { id: 'models',       label: 'Models',       icon: Trophy,    show: isDone && results?.trainResult,  badge: results?.trainResult?.models?.length },
    { id: 'predictions',  label: 'Predictions',  icon: Table,     show: isDone && results?.predResult,   badge: results?.predResult?.predictions?.length?.toLocaleString() },
    { id: 'charts',       label: 'Charts',       icon: Image,     show: isDone && results?.vizResult,    badge: Object.keys(results?.vizResult ?? {}).length || null },
  ].filter((t) => t.show !== false);

  const barColor = isError ? '#ef4444' : isDone ? '#22c55e' : '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Animated top gradient bar */}
      <motion.div className="h-1 shrink-0"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}80)`, transformOrigin: 'left' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 shrink-0"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4">
          {isRunning && <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />}
          {isDone    && <CheckCircle2 className="w-6 h-6 text-success" />}
          {isError   && <AlertCircle  className="w-6 h-6 text-danger" />}
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {isRunning ? 'Running Pipeline…' : isDone ? 'Pipeline Results' : 'Pipeline Error'}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {isRunning ? `${steps.length} steps completed so far` : isDone ? `${steps.length} steps · All complete` : 'Check the progress tab for details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isRunning && (
            <button onClick={onReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
          <button onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
            <X className="w-4 h-4" /> Back to Canvas
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-end px-6 shrink-0"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        {TABS.map((t) => (
          <Tab key={t.id} {...t} active={tab === t.id} onClick={setTab} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {tab === 'progress'    && <ProgressView steps={steps} pipelineState={pipelineState} />}
              {tab === 'overview'    && results && <OverviewTab    results={results} />}
              {tab === 'models'      && results && <ModelsTab      results={results} />}
              {tab === 'predictions' && results && <PredictionsTab results={results} />}
              {tab === 'charts'      && results && <ChartsTab      results={results} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
