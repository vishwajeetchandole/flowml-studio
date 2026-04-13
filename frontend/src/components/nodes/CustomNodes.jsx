import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { motion } from 'framer-motion';
import {
  Database,
  Wrench,
  Layers,
  Zap,
  FileText,
  CheckCircle2,
  Trash2,
  Table
} from 'lucide-react';

const BaseNode = ({ id, data, type, icon, colorName, selected }) => {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const varColor = `var(--color-${colorName})`;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`min-w-[200px] p-4 relative group rounded-xl shadow-lg transition-all duration-300 ${selected ? 'ring-2 ring-primary' : ''
        }`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: selected ? `1px solid ${varColor}` : '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5! h-2.5! border-2! border-dark-card!"
        style={{ backgroundColor: varColor }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, ${varColor} 15%, transparent)`,
            color: varColor
          }}
        >
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md cursor-pointer"
          style={{ color: 'var(--color-danger, #ef4444)' }}
          title="Delete Node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
          {type}
        </div>
        <div className="text-sm font-bold font-sora tracking-tight">
          {data.label}
        </div>
        {data.description && (
          <div className="text-[10px] line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
            {data.description}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)' }}>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-success" />
          <span className="text-[9px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Ready</span>
        </div>
        <div className="text-[9px] font-mono opacity-50" style={{ color: 'var(--color-text-muted)' }}>
          ID: {id ? id.substring(0, 4).toUpperCase() : '----'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5! h-2.5! border-2! border-dark-card!"
        style={{ backgroundColor: varColor }}
      />
    </motion.div>
  );
};

export const UploadNode = memo((props) => (
  <BaseNode {...props} type="Data Input" icon={<Database />} colorName="secondary" />
));

export const PreviewNode = memo((props) => (
  <BaseNode {...props} type="Data Preview" icon={<Table />} colorName="secondary" />
));

export const PreprocessNode = memo((props) => (
  <BaseNode {...props} type="Processing" icon={<Wrench />} colorName="warning" />
));

export const ModelNode = memo((props) => (
  <BaseNode {...props} type="Model Trainer" icon={<Layers />} colorName="primary" />
));

export const AIDecisionNode = memo((props) => (
  <BaseNode {...props} type="AI Intelligence" icon={<Zap />} colorName="danger" />
));

export const OutputNode = memo((props) => (
  <BaseNode {...props} type="Output" icon={<FileText />} colorName="success" />
));
