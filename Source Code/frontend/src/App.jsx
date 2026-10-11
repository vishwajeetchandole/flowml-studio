import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Workflow from './pages/Workflow';
import Sidebar from './components/layout/Sidebar';
import PipelinePanel from './components/layout/PipelinePanel';
import ResultsOverlay from './components/layout/ResultsOverlay';
import FlowMLIcon from './components/FlowMLIcon';
import Logo from './components/common/Logo';
import {
  Cpu, Play, RotateCcw, Save, Download,
  CheckCircle2, AlertCircle, Loader2, Zap, BarChart3, X,
  LayoutTemplate, Undo2, Redo2, Square, ArrowLeft, ShieldAlert,
  Plus, Database, Layers, Code, Settings, BookOpen, FileCode,
  HardDrive, RefreshCw, Sparkles, ChevronDown, HelpCircle,
  Sliders, User,
} from 'lucide-react';
import {
  uploadDataset, analyzeDataset, preprocessDataset,
  trainModels, runPredictions, getVisualizations,
  getProjects, saveProject, checkHealth,
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
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = routeProjectId || searchParams.get('project') || 'proj-default';

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

  /* ─── Keyboard Shortcuts for Colab: Run, Save, Undo, Redo ────────────── */
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
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleManualSave]);

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
        try {
          vizResult = await getVisualizations(uploadResult.file_name);
        } catch (e) {
          console.warn('Fallback visualization failed:', e);
        }
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
        showToast={showToast}
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

/* ─── Google Colab Style Canvas Top Bar ──────────────────────────────────────── */
function TopBar({
  isRunning, pipelineState,
  workflowName, setWorkflowName, saveStatus,
  onRun, onStop, onSave, onExport, onUndo, onRedo,
  hasResults, showResults, onToggleResults, showToast,
}) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'Save Pipeline (Ctrl+S)', icon: Save, action: onSave },
        { label: 'Export Pipeline JSON', icon: Download, action: onExport },
        { divider: true },
        { label: 'Back to Dashboard', icon: ArrowLeft, action: () => navigate('/app/projects') },
        { label: 'Return to Home', icon: Cpu, action: () => navigate('/') },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo (Ctrl+Z)', icon: Undo2, action: onUndo },
        { label: 'Redo (Ctrl+Y)', icon: Redo2, action: onRedo },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: showResults ? 'Hide Results Overlay' : 'View Results Overlay', icon: BarChart3, action: onToggleResults },
        { label: 'Model Tournaments', icon: Layers, action: () => navigate('/app/models') },
        { label: 'Dataset Store', icon: Database, action: () => navigate('/app/datasets') },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        { label: 'Custom Python Code Node', icon: Code, action: () => showToast?.('Drag "Custom Python" from left palette', 'info') },
        { label: 'Upload Dataset Node', icon: Database, action: () => showToast?.('Drag "Upload Dataset" from left palette', 'info') },
        { label: 'Preprocessing Node', icon: Sliders, action: () => showToast?.('Drag preprocessing transforms from left palette', 'info') },
        { label: 'Random Forest Model', icon: Layers, action: () => showToast?.('Drag "Random Forest" from left palette', 'info') },
        { label: 'AI Decision Tournament', icon: Sparkles, action: () => showToast?.('Drag "AI Decision" from left palette', 'info') },
      ],
    },
    {
      id: 'runtime',
      label: 'Runtime',
      items: [
        { label: isRunning ? 'Interrupt Execution' : 'Run Pipeline (Ctrl+Enter)', icon: isRunning ? Square : Play, action: isRunning ? onStop : onRun },
        {
          label: 'Reconnect Kernel (Python 3.11)',
          icon: RefreshCw,
          action: () => {
            checkHealth()
              .then(() => {
                setBackendOnline(true);
                showToast?.('Kernel connected: Python 3.11 Kernel');
              })
              .catch(() => {
                setBackendOnline(false);
                showToast?.('Kernel offline - check backend server', 'error');
              });
          },
        },
        { label: 'Execution Limits & Sandbox', icon: ShieldAlert, action: () => navigate('/docs') },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { label: 'Workspace Settings', icon: Settings, action: () => navigate('/app/settings') },
        { label: 'Dataset Store', icon: Database, action: () => navigate('/app/datasets') },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Documentation & Guide', icon: BookOpen, action: () => navigate('/docs') },
        { label: 'Sample Tutorials', icon: FileCode, action: () => navigate('/tutorials') },
        { label: 'About Team & Mission', icon: User, action: () => navigate('/about') },
      ],
    },
  ];

  return (
    <div className="flex flex-col shrink-0 select-none bg-white border-b border-[#DADCE0] z-50">
      {/* ── Tier 1: Google Colab Header Bar ───────────────────────────────── */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-[#E8EAED] text-xs">
        {/* Left: Brand, Document Title & Menubar */}
        <div className="flex items-center gap-3">
          {/* FlowML Logo (clicking renders to home page) */}
          <Link to="/" className="flex items-center gap-2" title="FlowML Home">
            <FlowMLIcon size={40} />
            <span className="hidden sm:inline">
              <Logo size="text-base" />
            </span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-200" />

          {/* Notebook Document Title & Colab Menus */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="font-medium text-xs text-slate-800 bg-transparent hover:bg-slate-100 px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-[160px] truncate"
              />
              <span className="font-mono text-slate-500 text-[11px]">.ipynb</span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                [{saveStatus === 'saving' ? 'Saving…' : 'In Drive · Autosaved'}]
              </span>
            </div>

            {/* Menubar */}
            <div ref={menuRef} className="flex items-center gap-0.5 -ml-1 relative">
              {menus.map((menu) => (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      activeMenu === menu.id
                        ? 'bg-slate-200 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {menu.label}
                  </button>

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
                              item.action?.();
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-pointer"
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

        {/* Right: Colab RAM / Disk Resource Bars & Kernel Status */}
        <div className="flex items-center gap-3">
          {/* RAM & Disk Resource Meters (Signature Colab Feature) */}
          <div className="hidden lg:flex items-center gap-3 px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono">
            <div className="flex items-center gap-1.5" title="Sandbox RAM Allocation: 2.4GB / 12.0GB Used">
              <span className="text-slate-500 font-semibold">RAM</span>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[26%] rounded-full" />
              </div>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5" title="Sandbox Disk: 18.5GB / 100.0GB Used">
              <span className="text-slate-500 font-semibold">Disk</span>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[18%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Colab Kernel Connection Pill */}
          <div
            onClick={() => {
              checkHealth()
                .then(() => {
                  setBackendOnline(true);
                  showToast?.('Kernel connected: Python 3.11');
                })
                .catch(() => {
                  setBackendOnline(false);
                  showToast?.('Kernel offline', 'error');
                });
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer transition-colors ${
              backendOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="Python 3.11 Kernel (Click to refresh)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-semibold hidden sm:inline">{backendOnline ? 'Connected (Python 3.11)' : 'Offline'}</span>
          </div>

          {/* Back to Dashboard Button */}
          <button
            onClick={() => navigate('/app/projects')}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            title="Exit Canvas to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>

      {/* ── Tier 2: Colab Action Ribbon ─────────────────────────────────────── */}
      <div className="h-10 px-3 bg-[#F8F9FA] flex items-center justify-between text-xs">
        {/* Left Colab Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              showToast?.('Drag "Custom Python" from left palette to add code block', 'info');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 hover:bg-white border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-violet-600" />
            <span>+ Code</span>
          </button>

          <button
            onClick={() => {
              showToast?.('Drag "Upload Dataset" from left palette onto the canvas', 'info');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 hover:bg-white border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Dataset</span>
          </button>

          <button
            onClick={() => {
              showToast?.('Drag a Model or AI Decision node from the left palette', 'info');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 hover:bg-white border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Model</span>
          </button>

          <span className="text-slate-300 mx-1">|</span>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onUndo}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-slate-300 mx-1">|</span>

          {/* Save / Export */}
          <button
            onClick={onSave}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Save Project (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onExport}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Colab Run / Results Controls */}
        <div className="flex items-center gap-2">
          {hasResults && (
            <button
              onClick={onToggleResults}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all border cursor-pointer ${
                showResults
                  ? 'bg-violet-100 text-violet-700 border-violet-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
              <span>{showResults ? 'Hide Results' : 'View Results'}</span>
            </button>
          )}

          {/* Google Colab Execution Run Button */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1 rounded font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Interrupt</span>
            </button>
          ) : (
            <button
              onClick={onRun}
              className="flex items-center gap-1.5 px-3 py-1 rounded font-bold text-xs text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
              title="Run Pipeline (Ctrl+Enter)"
            >
              {pipelineState === 'done' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Run Again</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Pipeline</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────────── */
export default function App() {
  return <AppInner />;
}
