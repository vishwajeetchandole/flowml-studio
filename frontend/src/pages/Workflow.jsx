import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  UploadNode,
  PreprocessNode,
  ModelNode,
  AIDecisionNode,
  OutputNode,
  PreviewNode
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

const initialNodes = [
  {
    id: '1',
    type: 'upload',
    data: { label: 'Upload Dataset', description: 'Primary training data source' },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'randomForest',
    data: { label: 'Random Forest', description: 'Ensemble learning model' },
    position: { x: 400, y: 100 },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#6366F1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' }
  },
];

const Workflow = ({ onNodeClick }) => {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // SVG attrs can't use CSS vars — concrete hex per theme
  // Use high-contrast values so dots are clearly visible
  const dotColor = theme === 'dark' ? '#334155' : '#cbd5e1';   // slate-700 / slate-300
  const canvasBg = theme === 'dark' ? '#020617' : '#F8FAFC';   // match --color-bg

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params,
    animated: true,
    style: { stroke: '#6366F1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' }
  }, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${Math.random().toString(36).substr(2, 9)}`,
        type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
          description: `Custom ${type} node configuration`
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="w-full h-full flex flex-col" ref={reactFlowWrapper}>
      {/* Apply dot pattern via CSS radial-gradient - more reliable than SVG Background */}
      <div
        className="flex-1 h-full"
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

export default ({ onNodeClick }) => (
  <ReactFlowProvider>
    <Workflow onNodeClick={onNodeClick} />
  </ReactFlowProvider>
);
