import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Workflow from './pages/Workflow';
import Sidebar from './components/layout/Sidebar';
import PipelinePanel from './components/layout/PipelinePanel';
import ResultsOverlay from './components/layout/ResultsOverlay';
import {
  Cpu, Play, RotateCcw, Sun, Moon, Save, Download,
  CheckCircle2, AlertCircle, Loader2, Zap, BarChart3, X,
  LayoutTemplate, Undo2, Redo2, Square, ArrowLeft, ShieldAlert,
} from 'lucide-react';
import { useTheme } from './theme/ThemeProvider';
import {
  uploadDataset, analyzeDataset, preprocessDataset,
  trainModels, runPredictions, getVisualizations,
  getProjects, saveProject,
} from './services/api';

/* ─── Node type groupings ────────────────────────────────────────────────────── */
const UPLOAD_TYPES     = ['upload', 'loadCsv', 'preview'];
const PREPROCESS_TYPES = ['fillMissing', 'encode', 'scale', 'removeDuplicates', 'selectColumns', 'splitData'];
const MODEL_TYPES      = ['randomForest', 'linearRegression', 'decisionTree', 'logisticRegression', 'knn', 'svm', 'kmeans', 'aiDecision'];
const OUTPUT_TYPES     = ['prediction', 'report'];
const VIZ_TYPES        = ['explainableAi'];

/* ─── Topological sort & Cycle check ─────────────────────────────────────────── */
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project') || 'proj-default';

  const [workflowName, setWorkflowName] = useState(() => {
    const projs = getProjects();
    const p = projs.find((x) => x.id === projectId);
    return p ? p.name : 'Untitled Pipeline';
  });

  const [selectedNode,   setSelectedNode]   = useState(null);
  const [showPanel,      setShowPanel]      = useState(false);
  const [pipelineState,  setPipelineState]  = useState('idle');
  const [pipelineSteps,  setPipelineSteps]  = useState([]);
  const [results,        setResults]        = useState(null);
  const [showResults,    setShowResults]    = useState(false);
  const [toast,          setToast]          = useState(null);
  const [saveStatus,     setSaveStatus]     = useState('saved'); // 'saved' | 'saving' | 'unsaved'

  const workflowRef = useRef(null);
  const isStoppedRef = useRef(false);

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

  /* ─── Keyboard Shortcuts for Undo / Redo ─────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          workflowRef.current?.redo();
        } else {
          e.preventDefault();
          workflowRef.current?.undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        workflowRef.current?.redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ─── Autosave (Debounced 2s) ────────────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      const wf = workflowRef.current?.getWorkflowData();
      if (wf?.nodes?.length) {
        localStorage.setItem(`flowml_workflow_${projectId}`, JSON.stringify(wf));
        saveProject({
          id: projectId,
          name: workflowName,
          nodesCount: wf.nodes.length,
          lastModified: new Date().toISOString(),
        });
        setSaveStatus('saved');
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [projectId, workflowName]);

  /* ─── Pre-run Validation ─────────────────────────────────────────────────── */
  const validateGraph = (nodes, edges) => {
    if (!nodes.length) {
      showToast('Add at least one node to the canvas!', 'error');
      return false;
    }

    workflowRef.current?.clearValidationErrors();

    // 1. Cycle detection
    const sorted = topoSort(nodes, edges);
    if (sorted.length < nodes.length) {
      showToast('Cycle detected! Pipelines must be a Directed Acyclic Graph (DAG).', 'error');
      // Find nodes not in sorted and flag them
      const sortedIds = new Set(sorted.map((n) => n.id));
      nodes.filter((n) => !sortedIds.has(n.id)).forEach((n) => {
        workflowRef.current?.setValidationError(n.id, 'Cyclic loop dependency');
      });
      return false;
    }

    // 2. Data source node presence
    const hasSource = nodes.some((n) => UPLOAD_TYPES.includes(n.type));
    if (!hasSource) {
      showToast('Missing data source! Add an Upload Dataset node first.', 'error');
      return false;
    }

    // 3. Unattached file check on upload node
    let hasValidFile = false;
    for (const n of nodes) {
      if (UPLOAD_TYPES.includes(n.type)) {
        if (!n.data?._uploadedFile && !n.data?.file_name) {
          workflowRef.current?.setValidationError(n.id, 'Attach a dataset file');
        } else {
          hasValidFile = true;
        }
      }
    }

    if (!hasValidFile) {
      showToast('Upload node has no dataset file attached.', 'error');
      return false;
    }

    return true;
  };

  /* ─── Run Pipeline ───────────────────────────────────────────────────────── */
  const handleRun = useCallback(async () => {
    if (pipelineState === 'running') return;
    const wf = workflowRef.current?.getWorkflowData();
    if (!wf?.nodes?.length) return;

    if (!validateGraph(wf.nodes, wf.edges)) return;

    isStoppedRef.current = false;
    const ordered = topoSort(wf.nodes, wf.edges);

    // Set all nodes to pending
    ordered.forEach((n) => workflowRef.current?.setNodeStatus(n.id, 'pending'));

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
        if (isStoppedRef.current) {
          addStep('Pipeline Stopped', 'warning', 'Execution halted by user.');
          setPipelineState('idle');
          return;
        }

        const t = node.type;
        workflowRef.current?.setNodeStatus(node.id, 'running');

        /* 1 ─ Upload */
        if (UPLOAD_TYPES.includes(t)) {
          const sid = addStep('Upload Dataset', 'running', 'Reading file…');
          if (node.data._uploadedFile) {
            const r = await uploadDataset(node.data._uploadedFile);
            uploadResult = r;
            updateStep(sid, { status: 'done', detail: `${r.file_name} · ${r.rows?.toLocaleString()} rows · ${r.columns} cols` });
          } else {
            uploadResult = { file_name: node.data.file_name };
            updateStep(sid, { status: 'done', detail: `Using ${node.data.file_name}` });
          }

          const asid = addStep('Analyze Dataset', 'running', 'Inferring schema & target…');
          const analysis = await analyzeDataset(uploadResult.file_name);
          targetColumn = analysis.suggested_target;
          taskType     = analysis.suggested_task_type ?? 'classification';
          updateStep(asid, { status: 'done', detail: `Target: "${targetColumn}" · Task: ${taskType}` });
          workflowRef.current?.setNodeStatus(node.id, 'completed');
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
          updateStep(sid, { status: 'done', detail: `${r.rows?.toLocaleString()} rows · ${r.columns} features` });
          workflowRef.current?.setNodeStatus(node.id, 'completed');
        }

        /* 3 ─ Models */
        else if (MODEL_TYPES.includes(t)) {
          if (!uploadResult) { addStep('Train Models', 'skipped', 'No dataset available'); continue; }
          const sid = addStep('Train Models', 'running', 'Fitting ML estimators…');
          const src = preprocessResult?.processed_file ?? uploadResult.file_name;
          const r   = await trainModels(uploadResult.file_name, targetColumn, taskType, src !== uploadResult.file_name ? src : null);
          trainResult = { ...r, targetColumn, taskType };
          const best = r.models?.find((m) => m.model_name === r.best_model);
          const metricStr = taskType === 'classification'
            ? `Acc ${(best?.accuracy * 100).toFixed(1)}%`
            : `R² ${best?.r2?.toFixed(3)}`;
          updateStep(sid, { status: 'done', detail: `Optimal: ${r.best_model} (${metricStr})` });
          workflowRef.current?.setNodeStatus(node.id, 'completed');
        }

        /* 4 ─ Prediction */
        else if (OUTPUT_TYPES.includes(t)) {
          if (!uploadResult || !trainResult) { addStep('Predictions', 'skipped', 'Train a model first'); continue; }
          const sid = addStep('Run Predictions', 'running', 'Generating inference predictions…');
          const src = preprocessResult?.processed_file ?? uploadResult.file_name;
          const r   = await runPredictions(src, targetColumn);
          predResult = r;
          updateStep(sid, { status: 'done', detail: `${r.predictions?.length?.toLocaleString()} predictions ready` });
          workflowRef.current?.setNodeStatus(node.id, 'completed');
        }

        /* 5 ─ Explainable AI */
        else if (VIZ_TYPES.includes(t)) {
          if (!uploadResult) { addStep('Visualizations', 'skipped', 'No dataset'); continue; }
          const sid = addStep('Explainability', 'running', 'Calculating SHAP feature attributions…');
          const r   = await getVisualizations(uploadResult.file_name);
          vizResult = r;
          updateStep(sid, { status: 'done', detail: `${Object.keys(r).length} diagnostic plots generated` });
          workflowRef.current?.setNodeStatus(node.id, 'completed');
        }
      }

      if (!vizResult && uploadResult) {
        try { vizResult = await getVisualizations(uploadResult.file_name); } catch (_) {}
      }

      setResults({ uploadResult, preprocessResult, trainResult, predResult, vizResult, targetColumn, taskType });
      setPipelineState('done');
      addStep('Pipeline Complete', 'done', '🎉 All pipeline stages completed successfully');
      showToast('Pipeline complete!', 'success');

    } catch (err) {
      setPipelineState('error');
      addStep('Pipeline Failed', 'error', err.message);
      showToast(err.message, 'error');
    }
  }, [pipelineState, addStep, updateStep, showToast]);

  /* ─── Stop Pipeline ──────────────────────────────────────────────────────── */
  const handleStop = () => {
    isStoppedRef.current = true;
    setPipelineState('idle');
    showToast('Stopping pipeline…', 'info');
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setShowPanel(!!node);
  }, []);

  const handleManualSave = useCallback(() => {
    const wf = workflowRef.current?.getWorkflowData();
    if (wf) {
      localStorage.setItem(`flowml_workflow_${projectId}`, JSON.stringify(wf));
      saveProject({
        id: projectId,
        name: workflowName,
        nodesCount: wf.nodes.length,
        lastModified: new Date().toISOString(),
      });
      setSaveStatus('saved');
      showToast(`Saved "${workflowName}" successfully.`, 'success');
    }
  }, [projectId, workflowName, showToast]);

  const handleExport = useCallback(() => {
    const wf = workflowRef.current?.getWorkflowData();
    if (!wf) return;
    const json = JSON.stringify({ name: workflowName, ...wf }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '_')}_workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workflow JSON exported.', 'info');
  }, [workflowName, showToast]);

  const isRunning = pipelineState === 'running';

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <TopBar
        theme={theme}
        toggleTheme={toggleTheme}
        isRunning={isRunning}
        pipelineState={pipelineState}
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        saveStatus={saveStatus}
        onRun={handleRun}
        onStop={handleStop}
        onSave={handleManualSave}
        onExport={handleExport}
        onUndo={() => workflowRef.current?.undo()}
        onRedo={() => workflowRef.current?.redo()}
        hasResults={!!results}
        showResults={showResults}
        onToggleResults={() => setShowResults((v) => !v)}
      />

      {/* ── Workspace ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Workflow onNodeClick={handleNodeClick} actionsRef={workflowRef} />

          {/* Canvas Bottom Hint */}
          <AnimatePresence>
            {!selectedNode && pipelineState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl pointer-events-none flex items-center gap-2.5 text-xs shadow-lg backdrop-blur-md"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
                <span>Drag palette nodes · Connect pins · Click <strong className="text-primary">Run Pipeline</strong></span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Node Config Drawer */}
          <AnimatePresence>
            {showPanel && selectedNode && !showResults && (
              <motion.div
                key="panel"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="absolute inset-y-0 right-0 z-30"
              >
                <PipelinePanel
                  node={selectedNode}
                  onClose={() => { setShowPanel(false); setSelectedNode(null); }}
                  onUpdateNodeData={(id, data) => workflowRef.current?.updateNode(id, data)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Full-screen Results Overlay ─────────────────────────────────────── */}
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

      {/* ── Toast Notifications ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            className="fixed bottom-8 left-1/2 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl z-[999] text-xs font-semibold"
            style={{
              background: toast.type === 'error' ? '#ef4444' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Top Bar ────────────────────────────────────────────────────────────────── */
function TopBar({
  theme, toggleTheme, isRunning, pipelineState,
  workflowName, setWorkflowName, saveStatus,
  onRun, onStop, onSave, onExport, onUndo, onRedo,
  hasResults, showResults, onToggleResults,
}) {
  const navigate = useNavigate();

  return (
    <header
      className="h-16 shrink-0 flex items-center justify-between px-6 z-50 border-b select-none"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Brand & Back Button & Name Input */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/app/projects')}
          title="Back to Dashboard"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          >
            <Cpu className="w-4 h-4 text-white" />
          </div>

          <div>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="font-sora font-bold text-sm bg-transparent hover:bg-white/5 px-2 py-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-colors max-w-[200px] truncate"
              style={{ color: 'var(--color-text)' }}
            />
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{saveStatus === 'saving' ? 'Saving…' : 'Autosaved'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Actions: Undo / Redo */}
      <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
        <button
          onClick={onUndo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {hasResults && (
          <button
            onClick={onToggleResults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
            style={{
              background: showResults ? 'rgba(99,102,241,0.15)' : 'var(--color-bg)',
              borderColor: showResults ? '#6366f1' : 'var(--color-border)',
              color: showResults ? '#818cf8' : 'var(--color-text-muted)',
            }}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showResults ? 'Hide Results' : 'View Results'}
          </button>
        )}

        <button
          onClick={onSave}
          className="p-2 rounded-xl border text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--color-border)' }}
          title="Save Project"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onExport}
          className="p-2 rounded-xl border text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--color-border)' }}
          title="Export Workflow JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* STOP / RUN BUTTON */}
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          >
            {pipelineState === 'done' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Run Again
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Pipeline
              </>
            )}
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border text-slate-400 hover:text-white transition-colors ml-1"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
        </button>
      </div>
    </header>
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
