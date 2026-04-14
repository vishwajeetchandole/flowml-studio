import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ThemeProvider } from './theme/ThemeProvider';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import ConsolePanel from './components/layout/ConsolePanel';
import Workflow from './pages/Workflow';
import { runPipeline } from './services/api';

function App() {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState(null); // null | 'running' | 'success' | 'error'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Global dataset info — shared across nodes (upload → model → predict)
  const [uploadedDataset, setUploadedDataset] = useState(null);

  // Ref that Workflow fills so Navbar can call getWorkflowData() & updateNode()
  const workflowActionsRef = useRef(null);

  const toggleConsole = () => setIsConsoleOpen((p) => !p);

  // Called by Navbar "Run Pipeline"
  const handleRunPipeline = useCallback(async () => {
    if (isRunning || !workflowActionsRef.current) return;
    const { nodes, edges } = workflowActionsRef.current.getWorkflowData();
    if (!nodes || nodes.length === 0) {
      alert('Add some nodes to the canvas before running the pipeline!');
      return;
    }
    setIsRunning(true);
    setPipelineStatus('running');
    setIsConsoleOpen(true);
    try {
      await runPipeline(nodes, edges);
      setPipelineStatus('success');
    } catch (err) {
      setPipelineStatus('error');
      console.error('Pipeline error:', err.message);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleSave = useCallback(() => {
    if (!workflowActionsRef.current) return;
    const { nodes, edges } = workflowActionsRef.current.getWorkflowData();
    localStorage.setItem('flowml_workflow', JSON.stringify({ nodes, edges }));
    showToast('Workflow saved locally!');
  }, [showToast]);

  const handleExport = useCallback(() => {
    if (!workflowActionsRef.current) return;
    const { nodes, edges } = workflowActionsRef.current.getWorkflowData();
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowml_pipeline.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Called by RightPanel when it mutates a node's data (e.g. file uploaded, model trained)
  const handleUpdateNodeData = useCallback((nodeId, newData) => {
    if (workflowActionsRef.current) {
      workflowActionsRef.current.updateNode(nodeId, newData);
    }
    // Keep selectedNode in sync so RightPanel re-renders with latest data
    setSelectedNode((prev) =>
      prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev
    );
  }, []);

  return (
    <ThemeProvider>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
        <Navbar
          toggleConsole={toggleConsole}
          isConsoleOpen={isConsoleOpen}
          onRunPipeline={handleRunPipeline}
          isRunning={isRunning}
          pipelineStatus={pipelineStatus}
          onSave={handleSave}
          onExport={handleExport}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />

          <main className="flex-1 relative overflow-hidden">
            <Workflow
              onNodeClick={setSelectedNode}
              actionsRef={workflowActionsRef}
            />
          </main>

          {selectedNode && (
            <RightPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdateNodeData={handleUpdateNodeData}
              uploadedDataset={uploadedDataset}
              onDatasetUploaded={setUploadedDataset}
            />
          )}
        </div>

        <ConsolePanel isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />

        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-8 left-1/2 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg z-[100] text-sm font-medium border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-success" style={{ color: '#22c55e' }} />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

export default App;
