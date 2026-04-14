import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import ReactFlow, {
  addEdge,
  Controls,
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

  const dotColor = theme === 'dark' ? '#1e293b' : '#cbd5e1';
  const canvasBg = theme === 'dark' ? '#020617' : '#f8fafc';

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
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
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
          snapToGrid
          snapGrid={[20, 20]}
          style={{ background: 'transparent' }}
        >
          <Controls />
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
