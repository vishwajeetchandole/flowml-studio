import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import Workflow from './pages/Workflow';
import PipelinePanel from './components/layout/PipelinePanel';
import ResultsOverlay from './components/layout/ResultsOverlay';
import {
  Cpu, Play, RotateCcw, Sun, Moon, Save, Download,
  CheckCircle2, AlertCircle, Loader2, Zap, BarChart3, X,
  LayoutTemplate,
} from 'lucide-react';
import { useTheme } from './theme/ThemeProvider';
import {
  uploadDataset, analyzeDataset, preprocessDataset,
  trainModels, runPredictions, getVisualizations,
} from './services/api';

/* ─── Node type groupings ────────────────────────────────────────────────────── */
const UPLOAD_TYPES     = ['upload', 'loadCsv'];
const PREPROCESS_TYPES = ['fillMissing', 'encode', 'scale'];
const MODEL_TYPES      = ['randomForest', 'linearRegression', 'decisionTree', 'aiDecision'];
const OUTPUT_TYPES     = ['prediction', 'report'];
const VIZ_TYPES        = ['explainableAi'];

/* ─── Topological sort ───────────────────────────────────────────────────────── */
function topoSort(nodes, edges) {
  const adj = {}, indegree = {};
  nodes.forEach((n) => { adj[n.id] = []; indegree[n.id] = 0; });
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (indegree[e.target] !== undefined) indegree[e.target]++;
  });
  const queue = nodes.filter((n) => indegree[n.id] === 0).map((n) => n.id);
  const result = [];
  while (queue.length) {
    const id = queue.shift(); result.push(id);
    (adj[id] || []).forEach((nid) => { indegree[nid]--; if (indegree[nid] === 0) queue.push(nid); });
  }
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return result.map((id) => map[id]).filter(Boolean);
}

/* ─── Inner App ──────────────────────────────────────────────────────────────── */
function AppInner() {
  const { theme, toggleTheme } = useTheme();

  const [selectedNode,   setSelectedNode]   = useState(null);
  const [showPanel,      setShowPanel]      = useState(false);
  const [pipelineState,  setPipelineState]  = useState('idle');
  const [pipelineSteps,  setPipelineSteps]  = useState([]);
  const [results,        setResults]        = useState(null);
  const [showResults,    setShowResults]    = useState(false);
  const [toast,          setToast]          = useState(null);
  const workflowRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const addStep = useCallback((label, status = 'running', detail = '') => {
    const id = Date.now() + Math.random();
    setPipelineSteps((p) => [...p, { id, label, status, detail, ts: new Date().toLocaleTimeString() }]);
    return id;
  }, []);

  const updateStep = useCallback((id, patch) => {
    setPipelineSteps((p) => p.map((s) => s.id === id ? { ...s, ...patch } : s));
  }, []);

  /* ─── Run Pipeline ───────────────────────────────────────────────────────── */
  const handleRun = useCallback(async () => {
    if (pipelineState === 'running') return;
    const wf = workflowRef.current?.getWorkflowData();
    if (!wf?.nodes?.length) { showToast('Add at least one node to the canvas first!', 'error'); return; }

    const ordered = topoSort(wf.nodes, wf.edges);
    setPipelineSteps([]);
    setResults(null);
    setPipelineState('running');
    setShowResults(true);
    setShowPanel(false);

    let uploadResult = null, preprocessResult = null, trainResult = null;
    let predResult = null, vizResult = null;
    let targetColumn = null, taskType = 'classification';

    try {
      for (const node of ordered) {
        const t = node.type;

        /* 1 ─ Upload */
        if (UPLOAD_TYPES.includes(t)) {
          const sid = addStep('Upload Dataset', 'running', 'Reading file…');
          if (!node.data._uploadedFile && !node.data.file_name) {
            updateStep(sid, { status: 'warning', detail: 'No file attached — skipping' }); continue;
          }
          if (node.data._uploadedFile) {
            const r = await uploadDataset(node.data._uploadedFile);
            uploadResult = r;
            updateStep(sid, { status: 'done', detail: `${r.file_name}  ·  ${r.rows?.toLocaleString()} rows  ·  ${r.columns} cols` });
          } else {
            uploadResult = { file_name: node.data.file_name };
            updateStep(sid, { status: 'done', detail: `Using ${node.data.file_name}` });
          }
          const asid = addStep('Analyse Dataset', 'running', 'Detecting column types & target…');
          const analysis = await analyzeDataset(uploadResult.file_name);
          targetColumn = analysis.suggested_target;
          taskType     = analysis.suggested_task_type ?? 'classification';
          updateStep(asid, { status: 'done', detail: `Target: "${targetColumn}"  ·  Task: ${taskType}  ·  ${analysis.total_rows?.toLocaleString()} rows` });
        }

        /* 2 ─ Preprocess */
        else if (PREPROCESS_TYPES.includes(t)) {
          if (!uploadResult) { addStep('Preprocess', 'skipped', 'No dataset available'); continue; }
          const sid = addStep(`Preprocess — ${node.data.label}`, 'running', 'Applying transformations…');
          const cfg = {
            missing_values:       node.data.missing_values       ?? 'mean',
            categorical_encoding: node.data.categorical_encoding ?? 'label',
            scaling:              node.data.scaling              ?? 'standard',
          };
          const r = await preprocessDataset(uploadResult.file_name, cfg, targetColumn);
          preprocessResult = r;
          updateStep(sid, { status: 'done', detail: `${r.rows?.toLocaleString()} rows  ·  ${r.columns} features` });
        }

        /* 3 ─ Model */
        else if (MODEL_TYPES.includes(t)) {
          if (!uploadResult) { addStep('Train Models', 'skipped', 'No dataset available'); continue; }
          const sid = addStep('Train Models', 'running', 'Running 6 algorithms…');
          const src = preprocessResult?.processed_file ?? uploadResult.file_name;
          const r   = await trainModels(uploadResult.file_name, targetColumn, taskType, src !== uploadResult.file_name ? src : null);
          trainResult = { ...r, targetColumn, taskType };
          const best = r.models?.find((m) => m.model_name === r.best_model);
          const metricStr = taskType === 'classification'
            ? `Acc ${(best?.accuracy * 100).toFixed(1)}%`
            : `R² ${best?.r2?.toFixed(3)}`;
          updateStep(sid, { status: 'done', detail: `Best: ${r.best_model}  ·  ${metricStr}` });
        }

        /* 4 ─ Prediction */
        else if (OUTPUT_TYPES.includes(t)) {
          if (!uploadResult || !trainResult) { addStep('Predictions', 'skipped', 'Train a model first'); continue; }
          const sid = addStep('Run Predictions', 'running', 'Scoring all rows…');
          const src = preprocessResult?.processed_file ?? uploadResult.file_name;
          const r   = await runPredictions(src, targetColumn);
          predResult = r;
          updateStep(sid, { status: 'done', detail: `${r.predictions?.length?.toLocaleString()} predictions generated` });
        }

        /* 5 ─ Explainable AI / Viz */
        else if (VIZ_TYPES.includes(t)) {
          if (!uploadResult) { addStep('Visualisations', 'skipped', 'No dataset'); continue; }
          const sid = addStep('Generate Charts', 'running', 'Building visualisations…');
          const r   = await getVisualizations(uploadResult.file_name);
          vizResult = r;
          updateStep(sid, { status: 'done', detail: `${Object.keys(r).length} charts generated` });
        }
      }

      /* Always get viz if we have an upload */
      if (!vizResult && uploadResult) {
        try { vizResult = await getVisualizations(uploadResult.file_name); } catch (_) {}
      }

      setResults({ uploadResult, preprocessResult, trainResult, predResult, vizResult, targetColumn, taskType });
      setPipelineState('done');
      addStep('Pipeline Complete', 'done', '🎉 All steps finished successfully');
      showToast('Pipeline complete!', 'success');

    } catch (err) {
      setPipelineState('error');
      addStep('Pipeline Failed', 'error', err.message);
      showToast(err.message, 'error');
    }
  }, [pipelineState, addStep, updateStep, showToast]);

  const handleNodeClick    = useCallback((node) => { setSelectedNode(node); setShowPanel(!!node); }, []);
  const handleSave         = useCallback(() => {
    const wf = workflowRef.current?.getWorkflowData(); if (!wf) return;
    localStorage.setItem('flowml_workflow', JSON.stringify(wf));
    showToast('Workflow saved to browser storage');
  }, [showToast]);
  const handleExport       = useCallback(() => {
    const wf = workflowRef.current?.getWorkflowData(); if (!wf) return;
    const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'flowml_pipeline.json' }).click();
    URL.revokeObjectURL(url);
  }, []);
  const handleUpdateNode   = useCallback((nodeId, newData) => {
    workflowRef.current?.updateNode(nodeId, newData);
    setSelectedNode((p) => p?.id === nodeId ? { ...p, data: { ...p.data, ...newData } } : p);
  }, []);

  const isRunning = pipelineState === 'running';

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <TopBar
        theme={theme} toggleTheme={toggleTheme}
        isRunning={isRunning} pipelineState={pipelineState}
        onRun={handleRun} onSave={handleSave} onExport={handleExport}
        hasResults={!!results} showResults={showResults}
        onToggleResults={() => setShowResults((v) => !v)}
      />

      {/* ── Workspace ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar */}
        <NodeLibrary />

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Workflow onNodeClick={handleNodeClick} actionsRef={workflowRef} />

          {/* Canvas hint */}
          <AnimatePresence>
            {!selectedNode && pipelineState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl pointer-events-none flex items-center gap-3"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <LayoutTemplate className="w-4 h-4 shrink-0" />
                <span className="text-sm">Drag nodes · Connect them · Click <strong className="text-primary">Run Pipeline</strong></span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Node config drawer (slides in from right, over canvas) */}
          <AnimatePresence>
            {showPanel && selectedNode && !showResults && (
              <motion.div
                key="panel"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="absolute inset-y-0 right-0 z-30 w-80"
                style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', boxShadow: '-8px 0 32px rgba(0,0,0,0.25)' }}
              >
                <PipelinePanel node={selectedNode} onClose={() => { setShowPanel(false); setSelectedNode(null); }} onUpdateNodeData={handleUpdateNode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Full-screen Results Overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {showResults && (
          <ResultsOverlay
            pipelineState={pipelineState}
            steps={pipelineSteps}
            results={results}
            onClose={() => setShowResults(false)}
            onReset={() => { setPipelineState('idle'); setPipelineSteps([]); setResults(null); setShowResults(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 40, x: '-50%' }}
            className="fixed bottom-10 left-1/2 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl z-[999] text-base font-semibold"
            style={{
              background: toast.type === 'error' ? '#ef4444' : 'linear-gradient(135deg,#22c55e,#16a34a)',
              color: 'white',
              boxShadow: toast.type === 'error' ? '0 12px 40px rgba(239,68,68,0.45)' : '0 12px 40px rgba(34,197,94,0.45)',
            }}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Top Bar ────────────────────────────────────────────────────────────────── */
function TopBar({ theme, toggleTheme, isRunning, pipelineState, onRun, onSave, onExport, hasResults, showResults, onToggleResults }) {
  const navigate = useNavigate();
  const statusMap = {
    idle:    { dot: '#6366f1', label: 'Ready to run' },
    running: { dot: '#f59e0b', label: 'Running pipeline…' },
    done:    { dot: '#22c55e', label: 'Pipeline complete' },
    error:   { dot: '#ef4444', label: 'Pipeline error' },
  };
  const s = statusMap[pipelineState] ?? statusMap.idle;

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 z-50"
      style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>

      {/* Brand */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} title="Back to Home"
          className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
            <Cpu className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 16px rgba(99,102,241,0.5)' }} />
          </div>
          <div>
            <div className="font-sora font-bold text-lg leading-tight"
              style={{ background: 'linear-gradient(90deg,#6366f1,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FlowML Studio
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.dot }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* Results toggle pill */}
        {hasResults && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={onToggleResults}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: showResults ? 'rgba(99,102,241,0.15)' : 'var(--color-bg)',
              border: `1px solid ${showResults ? 'rgba(99,102,241,0.4)' : 'var(--color-border)'}`,
              color: showResults ? '#6366f1' : 'var(--color-text-muted)',
            }}>
            <BarChart3 className="w-4 h-4" />
            {showResults ? 'Hide Results' : 'View Results'}
          </motion.button>
        )}

        <NavBtn icon={Save}     label="Save"    onClick={onSave}   />
        <NavBtn icon={Download} label="Export"  onClick={onExport} />

        <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border)' }} />

        {/* RUN */}
        <motion.button
          whileHover={!isRunning ? { scale: 1.03 } : {}} whileTap={!isRunning ? { scale: 0.97 } : {}}
          onClick={onRun} disabled={isRunning} id="run-pipeline-btn"
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-base font-bold text-white transition-all"
          style={{
            background: isRunning ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
              : pipelineState === 'done'  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
              : pipelineState === 'error' ? 'linear-gradient(135deg,#ef4444,#dc2626)'
              : 'linear-gradient(135deg,#6366f1,#3b82f6)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            opacity: isRunning ? 0.8 : 1,
            cursor:  isRunning ? 'not-allowed' : 'pointer',
          }}>
          {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" />Running…</>
            : pipelineState === 'done'  ? <><RotateCcw className="w-4 h-4" />Run Again</>
            : <><Play className="w-4 h-4 fill-current" />Run Pipeline</>}
        </motion.button>

        <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border)' }} />

        {/* Theme */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme} id="theme-toggle-btn"
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          <AnimatePresence mode="wait">
            <motion.div key={theme}
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}>
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
}

function NavBtn({ icon: Icon, label, onClick }) {
  return (
    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={onClick} title={label}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={{ color: 'var(--color-text-muted)', border: '1px solid transparent' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
      <Icon className="w-4 h-4" />
      <span className="hidden lg:inline">{label}</span>
    </motion.button>
  );
}

/* ─── Node Library (left sidebar) ───────────────────────────────────────────── */
const NODES = [
  { section: 'Data',        color: '#3b82f6', items: [
    { type: 'upload',           label: 'Upload Dataset',  hint: 'CSV · Excel · JSON'    },
    { type: 'preview',          label: 'Preview Data',    hint: 'Explore & inspect'     },
  ]},
  { section: 'Processing',  color: '#8b5cf6', items: [
    { type: 'fillMissing',      label: 'Fill Missing',    hint: 'Impute null values'    },
    { type: 'encode',           label: 'Encode Labels',   hint: 'Label / One-hot'       },
    { type: 'scale',            label: 'Scale Features',  hint: 'Standard / MinMax'     },
  ]},
  { section: 'Models',      color: '#f59e0b', items: [
    { type: 'randomForest',     label: 'Random Forest',   hint: 'Class. + Regression'   },
    { type: 'linearRegression', label: 'Linear Regr.',    hint: 'Baseline regression'   },
    { type: 'decisionTree',     label: 'Decision Tree',   hint: 'Recursive split'       },
  ]},
  { section: 'AI & Output', color: '#22c55e', items: [
    { type: 'explainableAi',    label: 'Explainable AI',  hint: 'SHAP · Charts'         },
    { type: 'prediction',       label: 'Prediction',      hint: 'Run inference'         },
  ]},
];

function NodeLibrary() {
  const [q, setQ] = useState('');
  const filtered = NODES.map((s) => ({ ...s, items: s.items.filter((it) => !q || it.label.toLowerCase().includes(q.toLowerCase())) })).filter((s) => s.items.length);

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full"
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>

      <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Node Library
        </p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search nodes…"
          className="w-full px-3 py-2 text-sm rounded-xl focus:outline-none transition-colors"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {filtered.map((sec) => (
          <div key={sec.section}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: sec.color }}>
              {sec.section}
            </p>
            <div className="space-y-2">
              {sec.items.map((it) => (
                <motion.div key={it.type} whileHover={{ x: 3, scale: 1.01 }}
                  draggable onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', it.type); e.dataTransfer.effectAllowed = 'move'; }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = sec.color + '55'; e.currentTarget.style.boxShadow = `0 2px 12px ${sec.color}18`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div className="w-2 h-7 rounded-full shrink-0" style={{ background: sec.color }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{it.label}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{it.hint}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <Zap className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Drag nodes to canvas, connect them, then hit <strong className="text-primary">Run Pipeline</strong>.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
