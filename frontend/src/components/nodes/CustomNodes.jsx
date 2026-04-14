import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
/* eslint-enable no-unused-vars */
import {
  Database,
  Wrench,
  Layers,
  Zap,
  FileText,
  Trash2,
  Table,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

// ─── Status badge config ─────────────────────────────────────────
const STATUS_CONFIG = {
  uploaded:  { label: 'Uploaded',  cls: 'text-success', Dot: CheckCircle2 },
  analyzed:  { label: 'Analyzed',  cls: 'text-success', Dot: CheckCircle2 },
  processed: { label: 'Processed', cls: 'text-success', Dot: CheckCircle2 },
  trained:   { label: 'Trained',   cls: 'text-success', Dot: CheckCircle2 },
  predicted: { label: 'Predicted', cls: 'text-success', Dot: CheckCircle2 },
  error:     { label: 'Error',     cls: 'text-danger',  Dot: AlertCircle  },
};

// ─── Base node component ─────────────────────────────────────────
const BaseNode = ({ id, data, type, icon, colorName, selected }) => {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const varColor = `var(--color-${colorName})`;
  const statusCfg = data.status ? STATUS_CONFIG[data.status] : null;
  const StatusIcon = statusCfg?.Dot;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`min-w-[210px] p-4 relative group rounded-2xl shadow-lg transition-all duration-300 ${
        selected ? 'ring-2 ring-offset-0' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: selected ? `1.5px solid ${varColor}` : '1.5px solid var(--color-border)',
        boxShadow: selected ? `0 0 0 3px color-mix(in srgb, ${varColor} 15%, transparent)` : undefined,
        color: 'var(--color-text)',
        ringColor: varColor,
      }}
    >
      {/* Target handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          backgroundColor: varColor,
          border: '2px solid var(--color-surface)',
        }}
      />

      {/* Header row: type-icon + delete btn */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${varColor} 15%, transparent)`,
            color: varColor,
          }}
        >
          {React.cloneElement(icon, { className: 'w-4 h-4' })}
        </div>

        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md cursor-pointer"
          style={{
            color: 'var(--color-danger, #ef4444)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Delete Node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Label + description */}
      <div className="space-y-0.5 mb-3">
        <div
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {type}
        </div>
        <div className="text-sm font-bold font-sora leading-tight">{data.label}</div>
        {data.description && (
          <div
            className="text-[10px] line-clamp-2 leading-snug"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {data.description}
          </div>
        )}
      </div>

      {/* Footer: status + node-id */}
      <div
        className="pt-2.5 flex items-center justify-between"
        style={{ borderTop: `1px solid color-mix(in srgb, var(--color-border) 60%, transparent)` }}
      >
        <div className="flex items-center gap-1.5">
          {statusCfg ? (
            <>
              <StatusIcon className={`w-3 h-3 ${statusCfg.cls}`} />
              <span className={`text-[9px] font-semibold ${statusCfg.cls}`}>{statusCfg.label}</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-[9px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Ready
              </span>
            </>
          )}
        </div>
        <div className="text-[9px] font-mono opacity-40" style={{ color: 'var(--color-text-muted)' }}>
          {id ? id.slice(-4).toUpperCase() : '----'}
        </div>
      </div>

      {/* Source handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          backgroundColor: varColor,
          border: '2px solid var(--color-surface)',
        }}
      />
    </motion.div>
  );
};

// ─── Exported typed node variants ────────────────────────────────
export const UploadNode = memo((props) => (
  <BaseNode {...props} type="Data Input" icon={<Database />} colorName="secondary" />
));
UploadNode.displayName = 'UploadNode';

export const PreviewNode = memo((props) => (
  <BaseNode {...props} type="Data Preview" icon={<Table />} colorName="secondary" />
));
PreviewNode.displayName = 'PreviewNode';

export const PreprocessNode = memo((props) => (
  <BaseNode {...props} type="Processing" icon={<Wrench />} colorName="warning" />
));
PreprocessNode.displayName = 'PreprocessNode';

export const ModelNode = memo((props) => (
  <BaseNode {...props} type="Model Trainer" icon={<Layers />} colorName="primary" />
));
ModelNode.displayName = 'ModelNode';

export const AIDecisionNode = memo((props) => (
  <BaseNode {...props} type="AI Intelligence" icon={<Zap />} colorName="danger" />
));
AIDecisionNode.displayName = 'AIDecisionNode';

export const OutputNode = memo((props) => (
  <BaseNode {...props} type="Output" icon={<FileText />} colorName="success" />
));
OutputNode.displayName = 'OutputNode';
