import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import ReactFlow, {
  addEdge,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  UploadNode,
  PreprocessNode,
  ModelNode,
  AIDecisionNode,
  OutputNode,
  PreviewNode,
} from '../components/nodes/CustomNodes';

const nodeTypes = {
  upload: UploadNode,
  loadCsv: UploadNode,
  preview: PreviewNode,
  fillMissing: PreprocessNode,
  encode: PreprocessNode,
  scale: PreprocessNode,
  randomForest: ModelNode,
  linearRegression: ModelNode,
  decisionTree: ModelNode,
  aiDecision: AIDecisionNode,
  explainableAi: AIDecisionNode,
  prediction: OutputNode,
  report: OutputNode,
};

const LABEL_MAP = {
  upload: 'Upload Dataset',
  loadCsv: 'Load CSV',
  preview: 'Preview Dataset',
  fillMissing: 'Fill Missing',
  encode: 'Encode Labels',
  scale: 'Scale Features',
  randomForest: 'Random Forest',
  linearRegression: 'Linear Regression',
  decisionTree: 'Decision Tree',
  aiDecision: 'AI Decision',
  explainableAi: 'Explainable AI',
  prediction: 'Prediction',
  report: 'Report',
};

const DESC_MAP = {
  upload: 'CSV, JSON, SQL — primary data source',
  loadCsv: 'Load a local CSV file',
  preview: 'Inspect data as a table',
  fillMissing: 'Mean, Median, or Constant strategy',
  encode: 'One-hot or Label encoding',
  scale: 'Normalize or Standardize features',
  randomForest: 'Ensemble learning model',
  linearRegression: 'Baseline regression model',
  decisionTree: 'Recursive partitioning',
  aiDecision: 'Autonomous reasoning engine',
  explainableAi: 'Feature importance & SHAP',
  prediction: 'Run model inference',
  report: 'Generate PDF / HTML report',
};

const initialNodes = [
  {
    id: 'node-1',
    type: 'upload',
    data: { label: 'Upload Dataset', description: 'CSV, JSON, SQL — primary data source' },
    position: { x: 80, y: 120 },
  },
  {
    id: 'node-2',
    type: 'randomForest',
    data: { label: 'Random Forest', description: 'Ensemble learning model' },
    position: { x: 400, y: 120 },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true,
    style: { stroke: '#6366F1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' },
  },
];

// Inner component — must be inside ReactFlowProvider
const WorkflowInner = ({ onNodeClick, actionsRef }) => {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const dotColor = theme === 'dark' ? '#1a2236' : '#dde3ed';
  const canvasBg  = theme === 'dark' ? '#080c14' : '#f0f4f8';

  // Expose workflow actions to parent (App.jsx) via ref
  useEffect(() => {
    if (!actionsRef) return;
    actionsRef.current = {
      getWorkflowData: () => ({ nodes, edges }),
      updateNode: (nodeId, newData) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
          )
        );
      },
    };
  }, [nodes, edges, actionsRef, setNodes]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#6366F1' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node-${Math.random().toString(36).substr(2, 9)}`,
        type,
        position,
        data: {
          label: LABEL_MAP[type] || type,
          description: DESC_MAP[type] || `Configure ${type} node`,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <div
        className="w-full h-full"
        style={{
          '--dot-color': dotColor,
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundColor: canvasBg,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={(_, node) => onNodeClick(node)}
          onPaneClick={() => onNodeClick(null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          snapToGrid
          snapGrid={[20, 20]}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#6366F1', strokeWidth: 2.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' },
          }}
          style={{ background: 'transparent' }}
        >
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const COLORS = { upload: '#3b82f6', loadCsv: '#0ea5e9', preview: '#06b6d4', fillMissing: '#8b5cf6', encode: '#a855f7', scale: '#d946ef', randomForest: '#f59e0b', linearRegression: '#f97316', decisionTree: '#ef4444', aiDecision: '#22c55e', explainableAi: '#10b981', prediction: '#ec4899', report: '#f43f5e' };
              return COLORS[n.type] ?? '#6366f1';
            }}
            maskColor={theme === 'dark' ? 'rgba(8,12,20,0.8)' : 'rgba(240,244,248,0.8)'}
            style={{ borderRadius: 12 }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrap with provider so useReactFlow() works inside CustomNodes
const Workflow = ({ onNodeClick, actionsRef }) => (
  <ReactFlowProvider>
    <WorkflowInner onNodeClick={onNodeClick} actionsRef={actionsRef} />
  </ReactFlowProvider>
);

export default Workflow;
