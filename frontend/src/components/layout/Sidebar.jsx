import React from 'react';
import { 
  Database, 
  Wrench, 
  Layers, 
  Zap, 
  FileText,
  Plus
} from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
/* eslint-enable no-unused-vars */

const NODE_CATEGORIES = [
  {
    id: 'data',
    title: 'DATA',
    icon: <Database className="w-4 h-4" />,
    items: [
      { type: 'upload', label: 'Upload Dataset', desc: 'CSV, JSON, SQL' },
      { type: 'loadCsv', label: 'Load CSV', desc: 'Local file loader' },
      { type: 'preview', label: 'Preview Dataset', desc: 'Data table viewer' },
    ]
  },
  {
    id: 'processing',
    title: 'PROCESSING',
    icon: <Wrench className="w-4 h-4" />,
    items: [
      { type: 'fillMissing', label: 'Fill Missing', desc: 'Mean, Median, Constant' },
      { type: 'encode', label: 'Encode Labels', desc: 'One-hot, Label encoding' },
      { type: 'scale', label: 'Scale Features', desc: 'Normalize, Standardize' },
    ]
  },
  {
    id: 'models',
    title: 'MODELS',
    icon: <Layers className="w-4 h-4" />,
    items: [
      { type: 'randomForest', label: 'Random Forest', desc: 'Classification / Regression' },
      { type: 'linearRegression', label: 'Linear Regression', desc: 'Baseline regression model' },
      { type: 'decisionTree', label: 'Decision Tree', desc: 'Recursive partitioning' },
    ]
  },
  {
    id: 'ai',
    title: 'AI INTELLIGENCE',
    icon: <Zap className="w-4 h-4" />,
    items: [
      { type: 'aiDecision', label: 'AI Decision', desc: 'Autonomous reasoning' },
      { type: 'explainableAi', label: 'Explainable AI', desc: 'Feature importance' },
    ]
  },
  {
    id: 'output',
    title: 'OUTPUT',
    icon: <FileText className="w-4 h-4" />,
    items: [
      { type: 'prediction', label: 'Prediction', desc: 'Inference results' },
      { type: 'report', label: 'Report', desc: 'Generate PDF/HTML' },
    ]
  }
];

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className="w-72 h-full flex flex-col z-40 backdrop-blur-xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="text-xs font-bold tracking-widest px-2 mb-2" style={{ color: 'var(--color-text-muted)' }}>
          COMPONENTS LIBRARY
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {NODE_CATEGORIES.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center gap-2 px-2" style={{ color: 'var(--color-text-muted)' }}>
              {category.icon}
              <h4 className="text-[10px] font-bold tracking-widest uppercase">
                {category.title}
              </h4>
            </div>

            <div className="grid gap-2">
              {category.items.map((item) => (
                <motion.div
                  key={item.type}
                  whileHover={{ scale: 1.01 }}
                  className="group relative p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  draggable
                  onDragStart={(event) => onDragStart(event, item.type)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[10px] mt-1 leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                    <Plus className="w-3 h-3 opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pro tip */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="text-xs font-medium text-primary">Pro Tip</div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Drag and drop nodes onto the canvas to start building your pipeline.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
