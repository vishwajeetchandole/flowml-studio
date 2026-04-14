import React, { useState, useRef } from 'react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
/* eslint-enable no-unused-vars */
import {
  X,
  Settings,
  Upload,
  Table,
  Wrench,
  Layers,
  Zap,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Trophy,
} from 'lucide-react';
import {
  uploadDataset,
  analyzeDataset,
  preprocessDataset,
  trainModels,
  runPredictions,
} from '../../services/api';

// ─── Icon & color map per node type ──────────────────────────────
const NODE_META = {
  upload:          { icon: Upload,  color: 'secondary', label: 'Data Input' },
  loadCsv:         { icon: Upload,  color: 'secondary', label: 'Load CSV' },
  preview:         { icon: Table,   color: 'secondary', label: 'Data Preview' },
  fillMissing:     { icon: Wrench,  color: 'warning',   label: 'Processing' },
  encode:          { icon: Wrench,  color: 'warning',   label: 'Processing' },
  scale:           { icon: Wrench,  color: 'warning',   label: 'Processing' },
  randomForest:    { icon: Layers,  color: 'primary',   label: 'Model Trainer' },
  linearRegression:{ icon: Layers,  color: 'primary',   label: 'Model Trainer' },
  decisionTree:    { icon: Layers,  color: 'primary',   label: 'Model Trainer' },
  aiDecision:      { icon: Zap,     color: 'danger',    label: 'AI Intelligence' },
  explainableAi:   { icon: Zap,     color: 'danger',    label: 'AI Intelligence' },
  prediction:      { icon: FileText,color: 'success',   label: 'Output' },
  report:          { icon: FileText,color: 'success',   label: 'Output' },
};

// ─── Shared field components ──────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--color-text-muted)' }}>
      {label}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
  />
);

const Select = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors appearance-none"
      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
  </div>
);

const ActionBtn = ({ onClick, loading, disabled, children, variant = 'primary' }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95 ${
      variant === 'primary'
        ? 'btn-primary'
        : 'text-white'
    } ${loading || disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    style={variant !== 'primary' ? { background: 'linear-gradient(to right,#22c55e,#16a34a)' } : {}}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
    {children}
  </button>
);

const StatusBox = ({ type, message }) => {
  const styles = {
    success: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', Icon: CheckCircle2 },
    error:   { bg: 'bg-danger/10',  border: 'border-danger/20',  text: 'text-danger',  Icon: AlertCircle },
  };
  const s = styles[type] || styles.error;
  return (
    <div className={`p-3 rounded-lg border ${s.bg} ${s.border} flex items-start gap-2`}>
      <s.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.text}`} />
      <p className={`text-xs leading-relaxed ${s.text}`}>{message}</p>
    </div>
  );
};

// ─── PANEL: Upload / LoadCSV ──────────────────────────────────────
const UploadPanel = ({ node, onUpdateNodeData, onDatasetUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);

  const dataset = node.data.uploadedDataset;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await uploadDataset(file);
      const datasetInfo = {
        file_name: result.file_name,
        rows: result.rows,
        columns: result.columns,
        column_names: result.column_names,
      };
      onUpdateNodeData(node.id, {
        uploadedDataset: datasetInfo,
        status: 'uploaded',
        description: `${result.rows} rows × ${result.columns} cols`,
      });
      onDatasetUploaded(datasetInfo);
      setStatus({ type: 'success', msg: `✓ "${result.file_name}" loaded — ${result.rows} rows, ${result.columns} columns.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Upload Dataset">
        <div
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-primary/50"
          style={{ borderColor: 'var(--color-border)' }}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-primary/60" />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Click to select a file
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            CSV or Excel (.xlsx / .xls)
          </p>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
        </div>
      </Field>

      <ActionBtn onClick={() => fileRef.current?.click()} loading={loading}>
        {!loading && <Upload className="w-4 h-4" />}
        {loading ? 'Uploading…' : 'Choose & Upload File'}
      </ActionBtn>

      {status && <StatusBox type={status.type} message={status.msg} />}

      {dataset && (
        <div className="rounded-lg p-3 space-y-3" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Dataset Info</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Stat label="File" value={dataset.file_name} />
            <Stat label="Rows" value={dataset.rows?.toLocaleString()} />
            <Stat label="Columns" value={dataset.columns} />
          </div>
          <div>
            <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>COLUMNS</div>
            <div className="flex flex-wrap gap-1">
              {dataset.column_names?.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PANEL: Preview / Analyze ─────────────────────────────────────
const PreviewPanel = ({ node, onUpdateNodeData, uploadedDataset }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const analysis = node.data.analysis;

  const handleAnalyze = async () => {
    if (!uploadedDataset?.file_name) {
      setStatus({ type: 'error', msg: 'No dataset uploaded yet. Add and configure an Upload node first.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await analyzeDataset(uploadedDataset.file_name);
      onUpdateNodeData(node.id, { analysis: result, status: 'analyzed' });
      setStatus({ type: 'success', msg: 'Dataset analyzed successfully.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {uploadedDataset ? (
        <StatusBox type="success" message={`Dataset: ${uploadedDataset.file_name} (${uploadedDataset.rows} rows)`} />
      ) : (
        <StatusBox type="error" message="No dataset found. Upload a file first." />
      )}

      <ActionBtn onClick={handleAnalyze} loading={loading} disabled={!uploadedDataset}>
        {!loading && <Table className="w-4 h-4" />}
        {loading ? 'Analyzing…' : 'Analyze Dataset'}
      </ActionBtn>

      {status && !loading && <StatusBox type={status.type} message={status.msg} />}

      {analysis && (
        <div className="space-y-3">
          <InfoRow label="Suggested Target" value={analysis.suggested_target} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Numeric Columns
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.numeric_columns?.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary/10 text-secondary">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Categorical Columns
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.categorical_columns?.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded text-[10px] font-mono bg-warning/10 text-warning">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Missing Values
            </div>
            <div className="space-y-1">
              {Object.entries(analysis.missing_values || {})
                .filter(([, v]) => v > 0)
                .map(([col, cnt]) => (
                  <div key={col} className="flex justify-between text-xs">
                    <span className="font-mono" style={{ color: 'var(--color-text)' }}>{col}</span>
                    <span className="text-warning font-bold">{cnt}</span>
                  </div>
                ))}
              {Object.values(analysis.missing_values || {}).every((v) => v === 0) && (
                <p className="text-xs text-success">No missing values ✓</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PANEL: Preprocess ────────────────────────────────────────────
const PreprocessPanel = ({ node, onUpdateNodeData, uploadedDataset }) => {
  const [strategy, setStrategy] = useState(
    node.data.config?.strategy || (node.type === 'fillMissing' ? 'mean' : node.type === 'encode' ? 'onehot' : 'standard')
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const strategyOptions = {
    fillMissing: [
      { value: 'mean', label: 'Mean' },
      { value: 'median', label: 'Median' },
      { value: 'constant', label: 'Constant (0)' },
    ],
    encode: [
      { value: 'onehot', label: 'One-Hot Encoding' },
      { value: 'label', label: 'Label Encoding' },
    ],
    scale: [
      { value: 'standard', label: 'Standard Scaler (Z-score)' },
      { value: 'minmax', label: 'Min-Max Normalization' },
    ],
  };

  const options = strategyOptions[node.type] || strategyOptions.scale;

  const handleApply = async () => {
    if (!uploadedDataset?.file_name) {
      setStatus({ type: 'error', msg: 'No uploaded dataset found. Run an Upload node first.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      // Map node type → backend config keys { missing_values, categorical_encoding, scaling }
      const config =
        node.type === 'fillMissing'
          ? { missing_values: strategy, categorical_encoding: 'label', scaling: 'none' }
          : node.type === 'encode'
          ? { missing_values: 'mean', categorical_encoding: strategy, scaling: 'none' }
          : { missing_values: 'mean', categorical_encoding: 'label', scaling: strategy };

      const result = await preprocessDataset(uploadedDataset.file_name, config);
      onUpdateNodeData(node.id, {
        config,
        processedFile: result.processed_file,
        status: 'processed',
        description: `${result.rows} rows × ${result.columns} cols`,
      });
      setStatus({ type: 'success', msg: `Processed: ${result.rows} rows × ${result.columns} columns saved.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {uploadedDataset ? (
        <StatusBox type="success" message={`Source: ${uploadedDataset.file_name}`} />
      ) : (
        <StatusBox type="error" message="Upload a dataset first." />
      )}

      <Field label="Strategy">
        <Select value={strategy} onChange={setStrategy} options={options} />
      </Field>

      <ActionBtn onClick={handleApply} loading={loading} disabled={!uploadedDataset}>
        {!loading && <Wrench className="w-4 h-4" />}
        {loading ? 'Processing…' : 'Apply Preprocessing'}
      </ActionBtn>

      {status && <StatusBox type={status.type} message={status.msg} />}
    </div>
  );
};

// ─── PANEL: Model Training ────────────────────────────────────────
const ModelPanel = ({ node, onUpdateNodeData, uploadedDataset }) => {
  const cols = uploadedDataset?.column_names || [];
  const [targetCol, setTargetCol] = useState(node.data.target_column || (cols.at(-1) ?? ''));
  const [taskType, setTaskType] = useState(node.data.task_type || 'classification');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const results = node.data.trainingResults;

  const handleTrain = async () => {
    if (!uploadedDataset?.file_name) {
      setStatus({ type: 'error', msg: 'No dataset uploaded. Add an Upload node first.' });
      return;
    }
    if (!targetCol) {
      setStatus({ type: 'error', msg: 'Select a target column.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await trainModels(uploadedDataset.file_name, targetCol, taskType);
      onUpdateNodeData(node.id, {
        target_column: targetCol,
        task_type: taskType,
        trainingResults: result,
        status: 'trained',
        description: `Best: ${result.best_model}`,
      });
      setStatus({ type: 'success', msg: `Training complete! Best model: ${result.best_model}` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {uploadedDataset ? (
        <StatusBox type="success" message={`Dataset: ${uploadedDataset.file_name}`} />
      ) : (
        <StatusBox type="error" message="Upload a dataset first." />
      )}

      <Field label="Target Column">
        <Select
          value={targetCol}
          onChange={setTargetCol}
          options={cols}
          placeholder="Select target column…"
        />
      </Field>

      <Field label="Task Type">
        <Select
          value={taskType}
          onChange={setTaskType}
          options={[
            { value: 'classification', label: 'Classification' },
            { value: 'regression', label: 'Regression' },
          ]}
        />
      </Field>

      <ActionBtn onClick={handleTrain} loading={loading} disabled={!uploadedDataset || !targetCol}>
        {!loading && <Layers className="w-4 h-4" />}
        {loading ? 'Training Models…' : 'Train Models'}
      </ActionBtn>

      {status && <StatusBox type={status.type} message={status.msg} />}

      {results && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            <Trophy className="w-3 h-3 text-warning" />
            Model Leaderboard
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            {results.models?.map((m, i) => {
              const isBest = m.model_name === results.best_model;
              const metric = taskType === 'classification' ? m.accuracy : m.mse;
              const metricLabel = taskType === 'classification' ? 'ACC' : 'MSE';
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 text-xs ${i > 0 ? 'border-t' : ''} ${isBest ? 'bg-primary/5' : ''}`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-2">
                    {isBest && <Trophy className="w-3 h-3 text-warning" />}
                    <span className={`font-medium ${isBest ? 'text-primary' : ''}`} style={!isBest ? { color: 'var(--color-text)' } : {}}>
                      {m.model_name}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${isBest ? 'text-primary' : ''}`} style={!isBest ? { color: 'var(--color-text-muted)' } : {}}>
                    {metricLabel}: {typeof metric === 'number' ? metric.toFixed(4) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PANEL: Output / Prediction ───────────────────────────────────
const OutputPanel = ({ node, onUpdateNodeData, uploadedDataset }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const predictions = node.data.predictions;

  const handlePredict = async () => {
    if (!uploadedDataset?.file_name) {
      setStatus({ type: 'error', msg: 'No dataset found. Upload and train a model first.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await runPredictions(uploadedDataset.file_name);
      onUpdateNodeData(node.id, { predictions: result.predictions, status: 'predicted' });
      setStatus({ type: 'success', msg: `Generated ${result.predictions?.length ?? 0} predictions.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {uploadedDataset ? (
        <StatusBox type="success" message={`Source: ${uploadedDataset.file_name}`} />
      ) : (
        <StatusBox type="error" message="No dataset found." />
      )}

      <ActionBtn onClick={handlePredict} loading={loading} disabled={!uploadedDataset} variant="success">
        {!loading && <FileText className="w-4 h-4" />}
        {loading ? 'Running Predictions…' : 'Run Predictions'}
      </ActionBtn>

      {status && <StatusBox type={status.type} message={status.msg} />}

      {predictions && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Predictions Preview
          </div>
          <div
            className="rounded-lg font-mono text-xs p-3 overflow-auto max-h-40 space-y-1"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            {predictions.slice(0, 20).map((p, i) => (
              <div key={i} className="flex gap-2">
                <span className="opacity-40 select-none">{String(i).padStart(3, '0')}</span>
                <span style={{ color: 'var(--color-text)' }}>{String(p)}</span>
              </div>
            ))}
            {predictions.length > 20 && (
              <div className="opacity-40 text-center">… {predictions.length - 20} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PANEL: AI / Default ──────────────────────────────────────────
const DefaultPanel = ({ node }) => (
  <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
    <p>This node type (<code className="text-primary">{node.type}</code>) will be connected to the AI reasoning engine in a future release.</p>
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
      <Stat label="Node ID" value={node.id} />
      <Stat label="Type" value={node.type} />
    </div>
  </div>
);

// ─── Small helpers ────────────────────────────────────────────────
const Stat = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    <span className="text-xs font-mono truncate max-w-[60%] text-right" style={{ color: 'var(--color-text)' }}>{value ?? '—'}</span>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-xs">
    <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    <span className="font-semibold text-primary">{value ?? '—'}</span>
  </div>
);

// ─── Main RightPanel ──────────────────────────────────────────────
const UPLOAD_TYPES   = ['upload', 'loadCsv'];
const PREVIEW_TYPES  = ['preview'];
const PROCESS_TYPES  = ['fillMissing', 'encode', 'scale'];
const MODEL_TYPES    = ['randomForest', 'linearRegression', 'decisionTree'];
const OUTPUT_TYPES   = ['prediction', 'report'];

const RightPanel = ({ node, onClose, onUpdateNodeData, uploadedDataset, onDatasetUploaded }) => {
  if (!node) return null;

  const meta = NODE_META[node.type] || { icon: Settings, color: 'primary', label: 'Node' };
  const Icon = meta.icon;
  const varColor = `var(--color-${meta.color})`;

  const renderPanel = () => {
    if (UPLOAD_TYPES.includes(node.type))
      return <UploadPanel node={node} onUpdateNodeData={onUpdateNodeData} onDatasetUploaded={onDatasetUploaded} />;
    if (PREVIEW_TYPES.includes(node.type))
      return <PreviewPanel node={node} onUpdateNodeData={onUpdateNodeData} uploadedDataset={uploadedDataset} />;
    if (PROCESS_TYPES.includes(node.type))
      return <PreprocessPanel node={node} onUpdateNodeData={onUpdateNodeData} uploadedDataset={uploadedDataset} />;
    if (MODEL_TYPES.includes(node.type))
      return <ModelPanel node={node} onUpdateNodeData={onUpdateNodeData} uploadedDataset={uploadedDataset} />;
    if (OUTPUT_TYPES.includes(node.type))
      return <OutputPanel node={node} onUpdateNodeData={onUpdateNodeData} uploadedDataset={uploadedDataset} />;
    return <DefaultPanel node={node} />;
  };

  return (
    <motion.aside
      key={node.id}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 22, stiffness: 110 }}
      className="w-80 h-full z-40 absolute right-0 shadow-2xl overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${varColor} 15%, transparent)` }}
          >
            <Icon className="w-4 h-4" style={{ color: varColor }} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: varColor }}>
              {meta.label}
            </div>
            <h3 className="font-sora font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
              {node.data.label}
            </h3>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-black/10 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node status badge */}
      {node.data.status && (
        <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-semibold text-success uppercase tracking-wider">{node.data.status}</span>
          </div>
        </div>
      )}

      {/* Panel content */}
      <div className="p-4 space-y-4">{renderPanel()}</div>
    </motion.aside>
  );
};

export default RightPanel;
