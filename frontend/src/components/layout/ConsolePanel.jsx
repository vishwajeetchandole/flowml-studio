import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Trash2, RotateCcw } from 'lucide-react';

const DUMMY_LOGS = [
  { type: 'info',    time: '21:05:12', msg: 'System initialized. FlowML Engine ready.' },
  { type: 'info',    time: '21:05:13', msg: 'Loaded workspace "AutoML Studio Project v1".' },
  { type: 'success', time: '21:05:15', msg: 'Connected to GPU Instance (A100-SXM4).' },
  { type: 'warning', time: '21:05:18', msg: 'Input dataset has 12% missing values in "Price" column.' },
];

const ConsolePanel = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState(DUMMY_LOGS);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl shadow-2xl"
          style={{
            height: '30vh',
            backgroundColor: 'color-mix(in srgb, var(--color-surface) 97%, transparent)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-sora font-semibold text-sm tracking-widest" style={{ color: 'var(--color-text)' }}>
                SYSTEM CONSOLE
              </h3>
              <div className="flex items-center gap-2 ml-4">
                <StatusBadge color="bg-success" label="Engine: Online" />
                <StatusBadge color="bg-secondary" label="Nodes: 12 Active" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Log content */}
          <div
            ref={scrollRef}
            className="p-4 overflow-y-auto h-[calc(100%-56px)] font-mono text-xs space-y-2"
          >
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="opacity-40 select-none" style={{ color: 'var(--color-text-muted)' }}>
                  [{log.time}]
                </span>
                <span className={`
                  ${log.type === 'info'    ? '' : ''}
                  ${log.type === 'success' ? 'text-success' : ''}
                  ${log.type === 'warning' ? 'text-warning'  : ''}
                  ${log.type === 'error'   ? 'text-danger'   : ''}
                `}
                style={log.type === 'info' ? { color: 'var(--color-text-muted)' } : {}}
                >
                  <span className="font-bold mr-2 uppercase">{log.type}:</span>
                  {log.msg}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-30" style={{ color: 'var(--color-text-muted)' }}>
                <RotateCcw className="w-8 h-8 mb-2" />
                <p>Console cleared. Waiting for logs...</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatusBadge = ({ color, label }) => (
  <div
    className="flex items-center gap-2 px-2 py-1 rounded-full"
    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
  >
    <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
    <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
  </div>
);

export default ConsolePanel;
