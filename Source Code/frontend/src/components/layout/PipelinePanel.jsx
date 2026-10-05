/**
 * PipelinePanel.jsx
 * Right-side panel for configuring an individual node.
 * It replaces the old RightPanel for the new single-click pipeline flow.
 */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Database, Wrench, Layers, FileText, Zap,
  CheckCircle2, AlertCircle, Loader2, Settings, Info,
} from 'lucide-react';
import { uploadDataset } from '../../services/api';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const UPLOAD_TYPES     = ['upload', 'loadCsv'];
const PREPROCESS_TYPES = ['fillMissing', 'encode', 'scale'];
const MODEL_TYPES      = ['randomForest', 'linearRegression', 'decisionTree', 'aiDecision'];
const OUTPUT_TYPES     = ['prediction', 'report'];
const VIZ_TYPES        = ['explainableAi'];

const TYPE_META = {
  upload:          { label: 'Upload Dataset',   color: '#3b82f6', Icon: Database },
  loadCsv:         { label: 'Load CSV',          color: '#0ea5e9', Icon: Database },
  preview:         { label: 'Preview Dataset',   color: '#06b6d4', Icon: Database },
  fillMissing:     { label: 'Fill Missing',       color: '#8b5cf6', Icon: Wrench  },
  encode:          { label: 'Encode Labels',      color: '#a855f7', Icon: Wrench  },
  scale:           { label: 'Scale Features',     color: '#d946ef', Icon: Wrench  },
  randomForest:    { label: 'Random Forest',      color: '#f59e0b', Icon: Layers  },
  linearRegression:{ label: 'Linear Regression',  color: '#f97316', Icon: Layers  },
  decisionTree:    { label: 'Decision Tree',      color: '#ef4444', Icon: Layers  },
  aiDecision:      { label: 'AI Decision',        color: '#22c55e', Icon: Zap     },
  explainableAi:   { label: 'Explainable AI',     color: '#10b981', Icon: Zap     },
  prediction:      { label: 'Prediction Output',  color: '#ec4899', Icon: FileText },
  report:          { label: 'Report',             color: '#f43f5e', Icon: FileText },
};

/* ─── Field wrapper ──────────────────────────────────────────────────────────── */
const Field = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
      {label}
    </label>
    {children}
    {hint && <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>}
  </div>
);

/* ─── Select ─────────────────────────────────────────────────────────────────── */
const Sel = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none transition-colors appearance-none"
    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
  >
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

/* ─── Status message ─────────────────────────────────────────────────────────── */
const Msg = ({ type, text }) => {
  const cfg = {
    success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  color: '#22c55e', Icon: CheckCircle2 },
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#ef4444', Icon: AlertCircle  },
    info:    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', color: '#6366f1', Icon: Info         },
    loading: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', color: '#6366f1', Icon: Loader2      },
  };
  const c = cfg[type] ?? cfg.info;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      <c.Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${type === 'loading' ? 'animate-spin' : ''}`} />
      {text}
    </div>
  );
};

/* ─── Upload Config Panel ────────────────────────────────────────────────────── */
function UploadConfig({ node, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const fileName = node.data.file_name;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg({ type: 'loading', text: `Uploading "${file.name}"…` });
    try {
      const r = await uploadDataset(file);
      onUpdate(node.id, { file_name: r.file_name, _uploadedFile: null, _info: r });
      setMsg({ type: 'success', text: `✓ "${r.file_name}" — ${r.rows?.toLocaleString()} rows · ${r.columns} columns` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Upload your CSV / Excel dataset here. The pipeline will use this as the data source.
      </p>

      <div
        className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all"
        style={{ borderColor: uploading ? '#6366f1' : 'var(--color-border)' }}
        onClick={() => fileRef.current?.click()}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
        onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      >
        {fileName ? (
          <div>
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{fileName}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Click to replace</p>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {uploading ? 'Uploading…' : 'Click to upload'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>CSV, Excel, JSON supported</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={handleFile} />
      </div>

      <AnimatePresence>
        {msg && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Msg {...msg} /></motion.div>}
      </AnimatePresence>

      {node.data._info && (
        <div className="grid grid-cols-2 gap-2">
          {[['Rows', node.data._info.rows?.toLocaleString()], ['Columns', node.data._info.columns]].map(([l, v]) => (
            <div key={l} className="p-3 rounded-xl text-center" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{v ?? '—'}</p>
              <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{l}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Preprocess Config Panel ────────────────────────────────────────────────── */
function PreprocessConfig({ node, onUpdate }) {
  const d = node.data;
  const up = (k, v) => onUpdate(node.id, { [k]: v });
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        These settings are applied automatically when the pipeline runs.
      </p>
      <Field label="Handle Missing Values">
        <Sel value={d.missing_values ?? 'mean'} onChange={(v) => up('missing_values', v)} options={[
          ['mean', 'Mean (numeric)'], ['median', 'Median'], ['most_frequent', 'Most Frequent'],
          ['constant', 'Constant (0 / "missing")'], ['drop', 'Drop rows'],
        ]} />
      </Field>
      <Field label="Categorical Encoding">
        <Sel value={d.categorical_encoding ?? 'label'} onChange={(v) => up('categorical_encoding', v)} options={[
          ['label', 'Label Encoding'], ['onehot', 'One-Hot Encoding'],
        ]} />
      </Field>
      <Field label="Feature Scaling">
        <Sel value={d.scaling ?? 'standard'} onChange={(v) => up('scaling', v)} options={[
          ['none', 'No Scaling'], ['standard', 'StandardScaler (Z-score)'], ['minmax', 'MinMaxScaler (0–1)'],
        ]} />
      </Field>
    </div>
  );
}

/* ─── Model Config Panel ─────────────────────────────────────────────────────── */
function ModelConfig({ node, onUpdate }) {
  const d = node.data;
  const up = (k, v) => onUpdate(node.id, { [k]: v });
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        The pipeline will auto-detect target column and task type. Optionally override below.
      </p>
      <Field label="Task Type (auto-detected)" hint="Override only if auto-detection is wrong">
        <Sel value={d.task_type ?? 'auto'} onChange={(v) => up('task_type', v)} options={[
          ['auto', 'Auto-detect'], ['classification', 'Classification'], ['regression', 'Regression'],
        ]} />
      </Field>
      <Field label="Target Column (optional)" hint="Leave blank to use auto-detected target">
        <input
          type="text"
          placeholder="e.g. price, class, label"
          value={d.target_column ?? ''}
          onChange={(e) => up('target_column', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        />
      </Field>
      <Msg type="info" text="All 6 models are trained automatically. The best is selected by accuracy / R² score." />
    </div>
  );
}

/* ─── Output Config Panel ────────────────────────────────────────────────────── */
function OutputConfig() {
  return (
    <div className="space-y-4">
      <Msg type="info" text="Predictions run automatically during pipeline execution. Results appear in the Results panel on the right." />
      <div className="p-4 rounded-2xl space-y-2" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        {['Model Leaderboard', 'Prediction Table', 'Download CSV', 'Charts & Visualizations'].map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
            <span style={{ color: 'var(--color-text)' }}>{f}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center" style={{ color: 'var(--color-text-muted)' }}>
        Click <strong className="text-primary">Run Pipeline</strong> in the top bar to execute.
      </p>
    </div>
  );
}

/* ─── PipelinePanel ──────────────────────────────────────────────────────────── */
export default function PipelinePanel({ node, onClose, onUpdateNodeData }) {
  const meta = TYPE_META[node.type] ?? { label: node.data.label ?? node.type, color: '#6366f1', Icon: Settings };
  const { Icon, color } = meta;

  const renderContent = () => {
    if (UPLOAD_TYPES.includes(node.type))     return <UploadConfig     node={node} onUpdate={onUpdateNodeData} />;
    if (PREPROCESS_TYPES.includes(node.type)) return <PreprocessConfig  node={node} onUpdate={onUpdateNodeData} />;
    if (MODEL_TYPES.includes(node.type))      return <ModelConfig       node={node} onUpdate={onUpdateNodeData} />;
    if ([...OUTPUT_TYPES, ...VIZ_TYPES].includes(node.type)) return <OutputConfig />;
    return <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No configuration for this node type.</p>;
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="w-72 shrink-0 flex flex-col h-full overflow-hidden z-30"
      style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)' }}
    >
      {/* accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

      {/* header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Configure</p>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{meta.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>

      {/* footer */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-[9px] text-center" style={{ color: 'var(--color-text-muted)' }}>
          Node ID: <span className="font-mono">{node.id}</span>
        </p>
      </div>
    </motion.div>
  );
}
