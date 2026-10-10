import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Terminal, Shield, Cpu, BookOpen, Layers, Sparkles } from 'lucide-react';
import PythonEditor from '../../components/code/PythonEditor';

export default function CodeEditorView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Lab
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> Isolated Worker Sandbox
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Python Studio</h2>
          <p className="text-xs text-slate-400">
            Write, execute, and benchmark custom transformation logic and scikit-learn models in a protected sandbox.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0e1422] border border-white/5 text-xs text-slate-300">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Limits: 1.0 CPU • 256MB RAM • No Network</span>
        </div>
      </div>

      {/* Editor Component */}
      <PythonEditor showHistoryTab={true} />
    </div>
  );
}
