import React from 'react';
import { motion } from 'framer-motion';
import { X, Settings, PlayCircle } from 'lucide-react';

const RightPanel = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="w-80 h-full z-45 absolute right-0 shadow-2xl overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-sora font-semibold text-sm">PROPERTIES</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Node info */}
        <header className="space-y-1">
          <div className="text-xs font-bold text-primary tracking-widest uppercase">
            {node.type?.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <h2 className="text-xl font-bold font-sora">{node.data.label}</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Configure {node.data.label.toLowerCase()} settings and parameters.
          </p>
        </header>

        {/* Fields */}
        <div className="space-y-4">
          <PropertyField label="Node Name" value={node.data.label} />

          <div className="space-y-2">
            <label className="text-xs font-semibold block uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Target Column
            </label>
            <select
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option>Select Column...</option>
              <option>Price</option>
              <option>Category</option>
              <option>Sales</option>
              <option>Output</option>
            </select>
          </div>

          <PropertySlider label="Trees" min={10} max={200} defaultValue={100} />
          <PropertySlider label="Max Depth" min={1} max={20} defaultValue={10} />

          <div className="flex items-center gap-3 pt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <span className="ms-3 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Use GPU Accelerator
              </span>
            </label>
          </div>
        </div>

        <div className="pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button className="w-full btn-primary py-3 justify-center text-sm">
            <PlayCircle className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

const PropertyField = ({ label, value }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold block uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
      {label}
    </label>
    <input
      type="text"
      defaultValue={value}
      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
    />
  </div>
);

const PropertySlider = ({ label, min, max, defaultValue }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <span className="text-xs font-mono text-primary font-bold">{defaultValue}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      defaultValue={defaultValue}
      className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-primary"
      style={{ backgroundColor: 'var(--color-border)' }}
    />
  </div>
);

export default RightPanel;
