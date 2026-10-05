import React, { useState, useEffect, useRef } from 'react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { X, Terminal, Trash2, RotateCcw } from 'lucide-react';
import { LOG_SSE_URL } from '../../services/api';

const ConsolePanel = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef(null);
  const esRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev.slice(-300), { type, time, msg }]);
  };

  // Connect / disconnect SSE based on panel open state
  useEffect(() => {
    if (!isOpen) {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      return;
    }

    let retryTimeout = null;

    const connect = () => {
      addLog('info', 'FlowML Engine initialized — connecting to log stream…');
      try {
        const es = new EventSource(LOG_SSE_URL);
        esRef.current = es;

        es.onopen = () => {
          setConnected(true);
          addLog('success', 'Log stream connected.');
        };

        es.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.message) {
              addLog('info', data.message);
            } else if (data.log) {
              // Backend format: "timestamp - flowml - LEVEL - message"
              const parts = data.log.split(' - ');
              const raw = parts.length >= 4 ? parts.slice(3).join(' - ') : data.log;
              const logStr = data.log.toUpperCase();
              const type = logStr.includes('ERROR')
                ? 'error'
                : logStr.includes('WARNING') || logStr.includes('WARN')
                ? 'warning'
                : 'info';
              addLog(type, raw);
            }
          } catch {
            addLog('info', evt.data);
          }
        };

        es.onerror = () => {
          setConnected(false);
          es.close();
          esRef.current = null;
          addLog('warning', 'Log stream disconnected — retrying in 4 s…');
          retryTimeout = setTimeout(connect, 4000);
        };
      } catch (err) {
        setConnected(false);
        addLog('error', 'Could not open SSE connection: ' + err.message);
      }
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setConnected(false);
    };
  }, [isOpen]);

  const clearLogs = () => setLogs([]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
          style={{
            height: '32vh',
            backgroundColor: 'var(--color-surface)',
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
              <h3
                className="font-sora font-semibold text-sm tracking-widest"
                style={{ color: 'var(--color-text)' }}
              >
                SYSTEM CONSOLE
              </h3>
              <div className="flex items-center gap-2 ml-3">
                <StatusDot
                  active={connected}
                  label={connected ? 'Engine Online' : 'Offline'}
                />
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

          {/* Log stream */}
          <div
            ref={scrollRef}
            className="p-4 overflow-y-auto font-mono text-xs space-y-1.5"
            style={{ height: 'calc(100% - 57px)' }}
          >
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 opacity-40 select-none" style={{ color: 'var(--color-text-muted)' }}>
                  {log.time}
                </span>
                <span
                  className={
                    log.type === 'success'
                      ? 'text-success'
                      : log.type === 'warning'
                      ? 'text-warning'
                      : log.type === 'error'
                      ? 'text-danger'
                      : ''
                  }
                  style={log.type === 'info' ? { color: 'var(--color-text-muted)' } : {}}
                >
                  <span className="font-bold uppercase mr-1">[{log.type}]</span>
                  {log.msg}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div
                className="h-full flex flex-col items-center justify-center opacity-30"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <RotateCcw className="w-7 h-7 mb-2" />
                <p>Console cleared — waiting for logs…</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatusDot = ({ active, label }) => (
  <div
    className="flex items-center gap-1.5 px-2 py-1 rounded-full"
    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
  >
    <div
      className={`w-1.5 h-1.5 rounded-full animate-pulse ${active ? 'bg-success' : 'bg-danger'}`}
    />
    <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
      {label}
    </span>
  </div>
);

export default ConsolePanel;
