import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, Brain, BarChart3, Layers,
  ChevronRight, Play, Star, Check, Cpu, Sparkles,
  TrendingUp, Database, GitBranch, Award, Users, Globe,
  ArrowUpRight, Menu, X, Code2, Sliders, CheckCircle2,
  FileSpreadsheet, Activity, ChevronDown, RefreshCw, Terminal,
  ExternalLink, HelpCircle, Lock, Lightbulb, Copy
} from 'lucide-react';

/* ─── Animated Counter ───────────────────────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Glow Blob ──────────────────────────────────────────────────────────────── */
function Blob({ color, style }) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000"
      style={{ background: color, ...style }}
    />
  );
}

/* ─── Gradient Text ──────────────────────────────────────────────────────────── */
function GText({ children, from = '#6366f1', to = '#3b82f6', className = '' }) {
  return (
    <span
      className={className}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {children}
    </span>
  );
}

/* ─── Section Fade-In Wrapper ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, y = 24 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Pill Badge ─────────────────────────────────────────────────────────────── */
function Pill({ children, color = '#6366f1' }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{
        background: color + '15',
        border: `1px solid ${color}35`,
        color,
      }}
    >
      <Sparkles className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────────────────────── */
function Navbar({ onLaunch }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Home', href: '#hero', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'Features', href: '#features' },
    { label: 'Documentation', href: '/docs', isRoute: true },
    { label: 'Tutorials', href: '/tutorials', isRoute: true },
    { label: 'About', href: '/about', isRoute: true },
    { label: 'Contact', href: '/contact', isRoute: true },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8, 12, 20, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.07)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          >
            <Cpu className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 16px rgba(99, 102, 241, 0.6)' }} />
          </div>
          <div>
            <span
              className="font-sora font-extrabold text-lg tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FlowML
            </span>
            <span className="text-xs px-2 py-0.5 ml-2 rounded-full font-mono font-semibold" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              v2.4
            </span>
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-6">
          {links.map((l) =>
            l.isRoute ? (
              <button
                key={l.label}
                onClick={() => navigate(l.href)}
                className="text-sm font-medium transition-all text-slate-300 hover:text-white"
              >
                {l.label}
              </button>
            ) : (
              <a
                key={l.label}
                href={l.href}
                onClick={l.onClick}
                className="text-sm font-medium transition-all text-slate-300 hover:text-white"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        {/* CTA & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => navigate('/signin')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-shadow"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
          <button
            onClick={onLaunch}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
          >
            Studio
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded-lg"
          style={{ color: '#f0f4ff', background: 'rgba(255, 255, 255, 0.05)' }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{
              background: 'rgba(8, 12, 20, 0.96)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="px-6 py-5 space-y-3">
              {links.map((l) =>
                l.isRoute ? (
                  <button
                    key={l.label}
                    onClick={() => {
                      setOpen(false);
                      navigate(l.href);
                    }}
                    className="block w-full text-left text-base font-medium py-2 text-slate-300 hover:text-white"
                  >
                    {l.label}
                  </button>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    className="block text-base font-medium py-2 text-slate-300 hover:text-white"
                    onClick={(e) => {
                      setOpen(false);
                      if (l.onClick) {
                        e.preventDefault();
                        l.onClick();
                      }
                    }}
                  >
                    {l.label}
                  </a>
                )
              )}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/signin');
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/signup');
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─── INTERACTIVE HERO PIPELINE MOCKUP ────────────────────────────────────────── */
function InteractiveHeroPipeline({ onLaunch }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(3); // 0=upload, 1=preprocess, 2=automl, 3=model, 4=output
  const [selectedNode, setSelectedNode] = useState('model');

  const nodes = [
    {
      id: 'upload',
      title: 'Dataset Ingestion',
      subtitle: 'heart_disease.csv · 1,025 rows',
      color: '#3b82f6',
      icon: Database,
      meta: { rows: 1025, cols: 14, task: 'Classification', target: 'condition' },
    },
    {
      id: 'preprocess',
      title: 'Smart Preprocessing',
      subtitle: 'StandardScaler · Mode Impute',
      color: '#8b5cf6',
      icon: Sliders,
      meta: { imputed: '12 nulls', scaled: '13 numerical', encoded: '1 categorical' },
    },
    {
      id: 'automl',
      title: 'Auto-ML Engine',
      subtitle: '6 Algorithms · 5-Fold CV',
      color: '#ec4899',
      icon: Brain,
      meta: { algos: 6, folds: 5, metric: 'Accuracy & ROC', time: '1.4s' },
    },
    {
      id: 'model',
      title: 'Random Forest',
      subtitle: '96.4% Accuracy · Winner 🏆',
      color: '#22c55e',
      icon: Award,
      meta: { n_estimators: 100, max_depth: 8, accuracy: '96.4%', f1: '0.962' },
    },
    {
      id: 'output',
      title: 'Predictions & SHAP',
      subtitle: 'Live inference · Full report',
      color: '#f59e0b',
      icon: BarChart3,
      meta: { predictions: '1,025 generated', topFeature: 'thalach (+0.38)', confidence: '98.1%' },
    },
  ];

  const handleSimulate = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);
    setSelectedNode('upload');

    const times = [0, 800, 1600, 2400, 3200];
    nodes.forEach((n, idx) => {
      setTimeout(() => {
        setActiveStep(idx);
        setSelectedNode(n.id);
        if (idx === nodes.length - 1) {
          setTimeout(() => setIsRunning(false), 800);
        }
      }, times[idx]);
    });
  };

  const curr = nodes.find((n) => n.id === selectedNode) || nodes[3];

  return (
    <div
      id="demo"
      className="relative w-full max-w-5xl mx-auto mt-14 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 20, 32, 0.95) 0%, rgba(8, 12, 20, 0.98) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 25px 80px -20px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Top simulated window bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-white/5 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 pl-2">
            workspace / pipeline_production_v2.flow
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: isRunning ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: 'white',
              boxShadow: isRunning ? 'none' : '0 2px 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulating Flow...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Test Run Pipeline
              </>
            )}
          </button>

          <button
            onClick={onLaunch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
          >
            Open in Studio <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pipeline node graph representation */}
      <div className="relative py-4">
        {/* Animated background track wire */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-800/80 rounded-full overflow-hidden z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"
            animate={{
              x: isRunning ? ['-100%', '100%'] : '0%',
              width: isRunning ? '40%' : '100%',
            }}
            transition={{
              repeat: isRunning ? Infinity : 0,
              duration: 1.2,
              ease: 'linear',
            }}
          />
        </div>

        {/* Nodes Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {nodes.map((n, idx) => {
            const Icon = n.icon;
            const isPassed = activeStep >= idx;
            const isCurrent = activeStep === idx;
            const isSelected = selectedNode === n.id;

            return (
              <motion.div
                key={n.id}
                whileHover={{ y: -3, scale: 1.02 }}
                onClick={() => setSelectedNode(n.id)}
                className="cursor-pointer p-4 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between"
                style={{
                  background: isSelected
                    ? `linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? `2px solid ${n.color}`
                    : isPassed
                    ? `1px solid ${n.color}50`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? `0 0 20px ${n.color}30` : 'none',
                }}
              >
                {/* Node header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: n.color + '22', color: n.color }}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    {isCurrent && isRunning ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    ) : isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                    )}
                  </div>

                  <h4 className="font-sora font-semibold text-sm text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{n.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{isSelected ? '● Inspected' : 'Click to inspect'}</span>
                  <span style={{ color: n.color }}>{n.id.toUpperCase()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Node live inspector drawer */}
      <div
        className="mt-6 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: curr.color + '25', color: curr.color }}
          >
            INFO
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              Selected Node Inspector: <span style={{ color: curr.color }}>{curr.title}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {Object.entries(curr.meta)
                .map(([k, v]) => `${k}: ${v}`)
                .join('  |  ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Validated & Optimal
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────────────── */
function Hero({ onLaunch }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.2]);

  const words = ['Simpler', 'Faster', 'Intelligent', 'Production-Ready'];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen pt-28 pb-20 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#080c14' }}>
      {/* Background ambient glows */}
      <Blob color="#6366f1" style={{ width: 700, height: 700, top: -150, left: '50%', transform: 'translateX(-50%)' }} />
      <Blob color="#3b82f6" style={{ width: 450, height: 450, bottom: '15%', right: '-5%' }} />
      <Blob color="#8b5cf6" style={{ width: 350, height: 350, top: '25%', left: '-5%' }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto w-full">
        {/* Release badge */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <Pill color="#6366f1">FlowML Studio 2.4 · Visual Auto-ML & Explainable AI</Pill>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-sora font-extrabold leading-[1.08] mb-6"
          style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)', color: '#f0f4ff', letterSpacing: '-0.03em' }}
        >
          Machine Learning Made
          <br />
          <span className="inline-block relative">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIdx}
                initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -25, filter: 'blur(10px)' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {words[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed text-slate-400"
        >
          Design, train, compare 6 ML algorithms, and deploy production-ready pipelines with a stunning visual canvas.
          From raw CSVs to interactive SHAP explanations in seconds — zero Python required.
        </motion.p>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLaunch}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-2xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 8px 36px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Play className="w-5 h-5 fill-current" />
            Launch Studio Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </motion.button>

          <a
            href="#demo"
            className="flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-slate-200 transition-all hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <Activity className="w-4.5 h-4.5 text-indigo-400" />
            Interactive Preview
          </a>
        </motion.div>

        {/* Trust metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="font-semibold text-slate-300 ml-1">4.9 / 5</span>
          </div>
          <span>•</span>
          <span>10,000+ pipelines evaluated</span>
          <span>•</span>
          <span>Runs locally on your machine</span>
        </motion.div>

        {/* Interactive canvas component */}
        <InteractiveHeroPipeline onLaunch={onLaunch} />
      </motion.div>
    </section>
  );
}

/* ─── STATS ──────────────────────────────────────────────────────────────────── */
function Stats() {
  const items = [
    { value: 10000, suffix: '+', label: 'Models Trained', sub: 'Across 40+ industries', color: '#6366f1' },
    { value: 98, suffix: '%', label: 'Peak Accuracy', sub: 'With ensemble tuning', color: '#22c55e' },
    { value: 12, suffix: 'x', label: 'Faster Delivery', sub: 'From dataset to deployment', color: '#f59e0b' },
    { value: 100, suffix: '%', label: 'Data Privacy', sub: 'Zero cloud telemetry', color: '#3b82f6' },
  ];

  return (
    <section className="py-20 relative" style={{ background: '#080c14', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 0.1}>
              <div
                className="text-center p-6 rounded-2xl h-full flex flex-col justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="text-3xl md:text-4xl font-extrabold font-sora mb-2 tracking-tight" style={{ color: it.color }}>
                  <Counter to={it.value} suffix={it.suffix} />
                </div>
                <p className="text-sm font-bold text-slate-200">{it.label}</p>
                <p className="text-xs text-slate-500 mt-1">{it.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── BENTO GRID FEATURES ────────────────────────────────────────────────────── */
function Features() {
  const items = [
    {
      icon: GitBranch,
      color: '#6366f1',
      title: 'Visual Reactive Pipeline Studio',
      desc: 'Drag, drop, and link nodes to configure complete machine learning workflows. Nodes react dynamically to schema changes with real-time feedback and validation.',
      span: 'md:col-span-2',
      tag: 'Core Engine',
    },
    {
      icon: Brain,
      color: '#ec4899',
      title: 'Auto-ML Concurrent Training',
      desc: 'Concurrently trains 6 scikit-learn models (Random Forest, SVM, Decision Tree, Logistic Regression, Linear Regression, KNN) and automatically crowns the champion.',
      span: '',
      tag: 'Auto-ML',
    },
    {
      icon: BarChart3,
      color: '#22c55e',
      title: 'Explainable AI & SHAP Insights',
      desc: 'Crack open the black box. Get comprehensive feature importance rankings, confusion matrices, and distribution graphs for transparent decisions.',
      span: '',
      tag: 'Explainability',
    },
    {
      icon: Database,
      color: '#f59e0b',
      title: 'Intelligent Data Preprocessing',
      desc: 'Automatic null value imputation, categorical one-hot encoding, and feature scaling (Standard / MinMax) designed to prevent data leakage.',
      span: '',
      tag: 'Data Prep',
    },
    {
      icon: Shield,
      color: '#3b82f6',
      title: 'Zero Data Leakage Guarantee',
      desc: 'Processing runs locally on your machine via Flask backend. No sensitive CSVs, patient records, or internal financial figures are sent to third parties.',
      span: '',
      tag: 'Security',
    },
    {
      icon: Code2,
      color: '#8b5cf6',
      title: '1-Click Exports & Full Screen Reports',
      desc: 'Download model predictions as CSV, export complete pipeline configurations, or view results on an immersive full-screen analytics dashboard.',
      span: 'md:col-span-2',
      tag: 'Production Output',
    },
  ];

  return (
    <section id="features" className="py-28 relative" style={{ background: '#080c14' }}>
      <Blob color="#6366f1" style={{ width: 550, height: 550, top: '25%', right: '-15%' }} />
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#6366f1">Feature Architecture</Pill>
            <h2
              className="font-sora font-extrabold mt-5 mb-4 text-slate-100"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              Enterprise ML Capabilities,<br />
              <GText from="#6366f1" to="#3b82f6">Zero Boilerplate Required</GText>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-slate-400">
              FlowML replaces thousands of lines of fragile glue code with an intuitive, deterministic visual canvas.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative p-8 rounded-3xl overflow-hidden h-full flex flex-col justify-between ${it.span}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = it.color + '50';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.045)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                  }}
                >
                  <div
                    className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
                    style={{ background: it.color }}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: it.color + '20' }}>
                        <Icon className="w-6 h-6" style={{ color: it.color }} />
                      </div>
                      <span className="text-[11px] font-mono px-3 py-1 rounded-full font-bold uppercase" style={{ background: it.color + '15', color: it.color }}>
                        {it.tag}
                      </span>
                    </div>

                    <h3 className="font-sora font-bold text-xl mb-3 text-slate-100">{it.title}</h3>
                    <p className="text-sm md:text-base leading-relaxed text-slate-400">{it.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold" style={{ color: it.color }}>
                    Learn more in docs <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── INTERACTIVE BLUEPRINTS ─────────────────────────────────────────────────── */
function Blueprints({ onLaunch }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const blueprints = [
    {
      id: 'healthcare',
      domain: 'Healthcare',
      title: 'Patient Heart Disease Classification',
      dataset: 'Cleveland Heart Study (1,025 records)',
      target: 'Cardiovascular Risk (Binary 0 / 1)',
      nodes: ['Dataset Loader', 'Missing Imputer', 'StandardScaler', 'Random Forest + SVM', 'SHAP Impact Analysis'],
      bestModel: 'Random Forest Classifier',
      accuracy: '96.4%',
      f1Score: '0.96',
      color: '#ef4444',
      icon: Activity,
      insight: 'Top risk indicator: Maximum heart rate achieved (thalach) with correlation coefficient +0.42.',
    },
    {
      id: 'finance',
      domain: 'Fintech',
      title: 'Credit Card Fraud Anomaly Detection',
      dataset: 'European Card Transactions (284K instances)',
      target: 'Fraudulent Activity (Class 0 / 1)',
      nodes: ['CSV Ingestion', 'Class Balancer', 'MinMax Scaler', 'Gradient Tree + Decision Tree', 'Precision/Recall ROC'],
      bestModel: 'Decision Tree Ensemble',
      accuracy: '99.2%',
      f1Score: '0.98',
      color: '#3b82f6',
      icon: Shield,
      insight: 'Detected fraudulent spikes within 1.2ms inference latency with 0.01% false positive rate.',
    },
    {
      id: 'realestate',
      domain: 'Real Estate',
      title: 'Property Valuation & Price Estimator',
      dataset: 'California Housing Census (20,640 blocks)',
      target: 'Median House Value ($USD Continuous)',
      nodes: ['Data Upload', 'Outlier Truncation', 'Standard Scaler', 'Linear Regression + Random Forest', 'R² & Residual Plots'],
      bestModel: 'Random Forest Regressor',
      accuracy: '0.92 R²',
      f1Score: '0.89 RMSE',
      color: '#22c55e',
      icon: Database,
      insight: 'Median income of cluster block accounted for 54% of overall price variance.',
    },
    {
      id: 'churn',
      domain: 'SaaS & Telecom',
      title: 'Customer Churn Early Warning System',
      dataset: 'Telco Churn Dataset (7,043 customers)',
      target: 'Churn Status (Yes / No)',
      nodes: ['CSV Loader', 'One-Hot Encoder', 'Standard Scaler', 'Logistic Regression + KNN', 'Retention Probability'],
      bestModel: 'Logistic Regression',
      accuracy: '91.8%',
      f1Score: '0.91',
      color: '#f59e0b',
      icon: Users,
      insight: 'Contract tenure under 6 months combined with fiber optic internet predicted 78% churn rate.',
    },
  ];

  const bp = blueprints[selectedIdx];

  return (
    <section id="blueprints" className="py-28 relative" style={{ background: '#0a0f1c' }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#ec4899">Pre-built Blueprints</Pill>
            <h2
              className="font-sora font-extrabold mt-5 mb-4 text-slate-100"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              Explore Proven Blueprints<br />
              <GText from="#ec4899" to="#8b5cf6">Ready to Run in 1 Click</GText>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-slate-400">
              Select an industry template to inspect its architectural graph, hyperparameters, and live accuracy benchmarks.
            </p>
          </div>
        </Reveal>

        {/* Blueprint tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {blueprints.map((item, idx) => {
            const Icon = item.icon;
            const active = selectedIdx === idx;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIdx(idx)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: active ? item.color + '20' : 'rgba(255, 255, 255, 0.03)',
                  border: active ? `1.5px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  color: active ? '#ffffff' : 'rgba(240, 244, 255, 0.6)',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: item.color }} />
                <span>{item.domain}</span>
              </button>
            );
          })}
        </div>

        {/* Blueprint card display */}
        <div
          className="p-8 md:p-10 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.025)',
            border: `1px solid ${bp.color}35`,
            boxShadow: `0 20px 60px ${bp.color}15`,
          }}
        >
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full" style={{ background: bp.color + '20', color: bp.color }}>
                  {bp.domain} Template
                </span>
                <span className="text-xs text-slate-400">• Scikit-Learn Engine</span>
              </div>
              <h3 className="font-sora font-extrabold text-2xl md:text-3xl text-slate-100 mb-3">{bp.title}</h3>
              <p className="text-sm text-slate-400 mb-6">
                <strong className="text-slate-200">Dataset:</strong> {bp.dataset} | <strong className="text-slate-200">Target:</strong> {bp.target}
              </p>

              {/* Node sequence pill track */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pipeline Node Sequence:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {bp.nodes.map((node, i) => (
                    <React.Fragment key={node}>
                      <span
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200"
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        {node}
                      </span>
                      {i < bp.nodes.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-500" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-amber-300">Auto-ML Finding:</strong> {bp.insight}
                </p>
              </div>
            </div>

            {/* Right benchmark card */}
            <div
              className="p-6 rounded-2xl flex flex-col justify-between h-full"
              style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <div>
                <span className="text-xs font-mono uppercase text-slate-400">Winning Algorithm</span>
                <h4 className="font-sora font-bold text-xl text-slate-100 mt-1 mb-4">{bp.bestModel}</h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Validation Metric</span>
                      <span className="font-mono font-bold" style={{ color: bp.color }}>{bp.accuracy}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: '95%', background: bp.color }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">F1 / Performance Score</span>
                      <span className="font-mono font-bold text-slate-200">{bp.f1Score}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onLaunch}
                className="mt-6 w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95"
                style={{ background: `linear-gradient(135deg, ${bp.color}, #6366f1)` }}
              >
                Launch Studio with Blueprint <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── ALGORITHMS SECTION ─────────────────────────────────────────────────────── */
function Models() {
  const algos = [
    { name: 'Random Forest', acc: 96, color: '#f59e0b', tag: 'Ensemble', desc: '100 estimators with bagging, perfect for noisy tabular data' },
    { name: 'Support Vector Machine (SVM)', acc: 93, color: '#8b5cf6', tag: 'Kernel', desc: 'Radial Basis Function kernel with dynamic C-regularization' },
    { name: 'Logistic Regression', acc: 90, color: '#6366f1', tag: 'Linear', desc: 'Fast L2 penalized baseline with probability calibration' },
    { name: 'Decision Tree', acc: 88, color: '#ef4444', tag: 'Tree-based', desc: 'Gini impurity split with auto pruning to combat overfitting' },
    { name: 'K-Nearest Neighbors (KNN)', acc: 86, color: '#3b82f6', tag: 'Instance', desc: 'Minkowski distance metric with weighted neighbor voting' },
    { name: 'Linear Regression', acc: 91, color: '#22c55e', tag: 'Regression', desc: 'Ordinary least squares with feature coefficient breakdown' },
  ];

  return (
    <section id="models" className="py-28 relative" style={{ background: '#080c14' }}>
      <Blob color="#8b5cf6" style={{ width: 450, height: 450, top: '10%', left: '-5%' }} />
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#8b5cf6">Competitive Benchmark</Pill>
            <h2
              className="font-sora font-extrabold mt-5 mb-4 text-slate-100"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              6 Algorithms Compete Concurrently.<br />
              <GText from="#8b5cf6" to="#ec4899">The Winner Takes the Crown.</GText>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto text-slate-400">
              FlowML trains all candidate models simultaneously with cross-validation and selects the best performer for your predictions.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algos.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl h-full flex flex-col justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: a.color + '18', color: a.color }}>
                      {a.tag}
                    </span>
                    <span className="text-2xl font-bold font-mono" style={{ color: a.color }}>
                      {a.acc}%
                    </span>
                  </div>

                  <h3 className="font-sora font-bold text-lg text-slate-100 mb-2">{a.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{a.desc}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Benchmark Score</span>
                    <span>{a.acc} / 100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-slate-800">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${a.acc}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      style={{ background: `linear-gradient(90deg, ${a.color}80, ${a.color})` }}
                    />
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CODE VS FLOWML COMPARISON ──────────────────────────────────────────────── */
function CodeCompare() {
  return (
    <section id="compare" className="py-28 relative" style={{ background: '#0a0f1c' }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#22c55e">Code vs Visual</Pill>
            <h2
              className="font-sora font-extrabold mt-5 mb-4 text-slate-100"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              Why ML Teams Are Switching to<br />
              <GText from="#22c55e" to="#3b82f6">Visual Pipeline Engineering</GText>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-slate-400">
              Eliminate boilerplate glue code, train/test leakage traps, and brittle notebooks.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Traditional code panel */}
          <div
            className="p-6 md:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                  ❌ Traditional Python Glue Code
                </span>
                <span className="text-xs text-slate-500 font-mono">~120 lines</span>
              </div>
              <h3 className="font-sora font-bold text-lg text-slate-100 mb-4">Brittle, Manual, Error-Prone</h3>

              {/* Code snippet mock */}
              <div className="p-4 rounded-xl bg-black/60 font-mono text-xs text-slate-400 leading-relaxed overflow-x-auto space-y-1 border border-white/5">
                <p className="text-rose-400">import pandas as pd, numpy as np</p>
                <p className="text-slate-500">from sklearn.model_selection import train_test_split, KFold</p>
                <p className="text-slate-500">from sklearn.preprocessing import StandardScaler, OneHotEncoder</p>
                <p className="text-slate-500">from sklearn.ensemble import RandomForestClassifier</p>
                <p className="text-amber-400"># Manual missing value handling & potential leakage:</p>
                <p>df = pd.read_csv('dataset.csv')</p>
                <p>df.fillna(df.mean(), inplace=True)  # Leakage warning!</p>
                <p>X = df.drop(columns=['target'])</p>
                <p>X_scaled = StandardScaler().fit_transform(X)</p>
                <p># Manually write loops to train 6 models...</p>
                <p className="text-rose-400"># 90+ more lines for metrics, SHAP, and plotting...</p>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs md:text-sm text-slate-400">
                <li className="flex items-center gap-2 text-rose-400/90">
                  <X className="w-4 h-4 shrink-0 text-rose-500" /> High risk of train-test data leakage
                </li>
                <li className="flex items-center gap-2 text-rose-400/90">
                  <X className="w-4 h-4 shrink-0 text-rose-500" /> Manual hyperparameter tuning and model tracking
                </li>
                <li className="flex items-center gap-2 text-rose-400/90">
                  <X className="w-4 h-4 shrink-0 text-rose-500" /> Complex plotting scripts for confusion matrix & ROC
                </li>
              </ul>
            </div>

            <p className="mt-6 text-xs text-slate-500 border-t border-white/5 pt-4">
              Time to prototype: <strong>2 - 4 hours</strong>
            </p>
          </div>

          {/* FlowML Studio panel */}
          <div
            className="p-6 md:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, rgba(99, 102, 241, 0.1), rgba(34, 197, 94, 0.05))',
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  ✓ FlowML Studio Architecture
                </span>
                <span className="text-xs text-indigo-400 font-mono">0 lines of code</span>
              </div>
              <h3 className="font-sora font-bold text-lg text-slate-100 mb-4">Visual, Deterministic, Instant</h3>

              {/* Visual graph mockup */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>Upload Node (Auto-schema detection)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Preprocessing Node (Leak-free scaling & encoding)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span>Auto-ML Arena (6 algorithms trained concurrently)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">96.4% Acc</span>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs md:text-sm text-slate-300">
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" /> Built-in leakage protection and proper pipeline split
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" /> Automated leaderboards with cross-validation
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" /> Full-screen interactive charts and SHAP explanations
                </li>
              </ul>
            </div>

            <p className="mt-6 text-xs text-emerald-400 border-t border-white/5 pt-4 font-semibold">
              Time to prototype: <strong>Under 3 minutes</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────────────────────────── */
function Testimonials() {
  const reviews = [
    {
      name: 'Dr. Elena Rostova',
      role: 'Lead ML Scientist at BioGenix',
      quote:
        'FlowML Studio reduced our biomarker classification turnaround from days to 15 minutes. Being able to visualize the entire preprocessing pipeline alongside SHAP plots is game-changing.',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'VP of Engineering at FinEdge',
      quote:
        'The concurrent 6-algorithm Auto-ML trainer gave our team instant confidence in model selection. We exported predictions straight to CSV without writing a single line of boilerplate.',
      rating: 5,
    },
    {
      name: 'Sarah Chen',
      role: 'Principal Data Architect at ScaleLoop',
      quote:
        'Our junior data scientists iterate significantly faster with FlowML’s visual canvas. The full-screen results dashboard makes stakeholder presentations effortless.',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 relative" style={{ background: '#080c14' }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#f59e0b">Social Proof</Pill>
            <h2 className="font-sora font-extrabold mt-5 mb-4 text-slate-100" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
              Trusted by ML Engineers & Researchers
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1}>
              <div
                className="p-8 rounded-3xl h-full flex flex-col justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed italic mb-6">"{r.quote}"</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="font-sora font-bold text-slate-100 text-sm">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ────────────────────────────────────────────────────────────────── */
function Pricing({ onLaunch }) {
  const plans = [
    {
      name: 'Community',
      price: '$0',
      sub: 'Forever Free',
      desc: 'Ideal for students, researchers, and solo ML experimenters.',
      color: '#6b7280',
      features: [
        'Visual Node Pipeline Studio',
        'Upload CSV & Excel datasets',
        'All 6 Scikit-Learn Algorithms',
        'Auto-ML Leaderboard',
        'Full-screen analytics dashboard',
        'Export predictions as CSV',
      ],
      cta: 'Launch Free Studio',
      outlined: true,
    },
    {
      name: 'Professional',
      price: '$29',
      sub: 'per month',
      desc: 'For professional data scientists who need advanced exports and custom hyperparameters.',
      color: '#6366f1',
      highlight: true,
      features: [
        'Everything in Community',
        'Custom hyperparameter tuning',
        'Deep SHAP feature importances',
        'PDF audit-ready report generation',
        'Saved pipeline workspace presets',
        'Priority feature requests',
      ],
      cta: 'Start Pro Trial',
      outlined: false,
    },
    {
      name: 'Enterprise',
      price: '$99',
      sub: 'per seat / month',
      desc: 'For teams needing centralized model deployment, audit logs, and on-premise setups.',
      color: '#22c55e',
      features: [
        'Everything in Professional',
        'On-premise Docker deployment',
        'Custom PyTorch / XGBoost nodes',
        'Multi-user shared workspaces',
        'Role-based access controls',
        'Dedicated ML engineer support',
      ],
      cta: 'Contact Sales',
      outlined: true,
    },
  ];

  return (
    <section id="pricing" className="py-28 relative" style={{ background: '#0a0f1c' }}>
      <Blob color="#6366f1" style={{ width: 500, height: 500, bottom: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#f59e0b">Predictable Pricing</Pill>
            <h2
              className="font-sora font-extrabold mt-5 mb-4 text-slate-100"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              Simple, Transparent Pricing
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto text-slate-400">
              Start free forever on your local environment. Upgrade as your data science workload scales.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className={`relative p-8 rounded-3xl h-full flex flex-col justify-between ${p.highlight ? 'scale-105' : ''}`}
                style={{
                  background: p.highlight
                    ? 'linear-gradient(160deg, rgba(99, 102, 241, 0.16), rgba(59, 130, 246, 0.08))'
                    : 'rgba(255, 255, 255, 0.025)',
                  border: p.highlight ? '1.5px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: p.highlight ? '0 20px 60px rgba(99, 102, 241, 0.25)' : 'none',
                }}
              >
                {p.highlight && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white tracking-wide uppercase"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-sora font-bold text-lg text-slate-100 mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-400 mb-6">{p.desc}</p>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="font-sora font-extrabold text-4xl md:text-5xl text-slate-100">{p.price}</span>
                    <span className="text-xs text-slate-400">/ {p.sub}</span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5 text-xs md:text-sm text-slate-300">
                        <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onLaunch}
                  className="w-full mt-8 py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={
                    p.outlined
                      ? { background: 'transparent', border: '1.5px solid rgba(255, 255, 255, 0.15)', color: '#f0f4ff' }
                      : { background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: 'white', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }
                  }
                >
                  {p.cta}
                </motion.button>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ACCORDION ──────────────────────────────────────────────────────────── */
function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Do I need to know how to code in Python to use FlowML?',
      a: 'Not at all! FlowML Studio is designed so anyone can build, train, evaluate, and interpret machine learning models through a visual drag-and-drop interface. For experienced practitioners, it serves as a rapid experimentation tool that eliminates boilerplate.',
    },
    {
      q: 'Which machine learning algorithms are included out of the box?',
      a: 'FlowML includes Random Forest, Logistic Regression, Linear Regression, Decision Tree, Support Vector Machine (SVM), and K-Nearest Neighbors (KNN). Our Auto-ML engine trains all suitable models simultaneously and ranks them by accuracy or R².',
    },
    {
      q: 'Is my dataset kept private and secure?',
      a: 'Yes, 100%. FlowML executes its pipeline runner locally on your local Flask server. Your uploaded CSVs, patient data, financial figures, or proprietary metrics never leave your computer.',
    },
    {
      q: 'Can I export predictions and reports?',
      a: 'Yes! Once your pipeline finishes executing, you can inspect the full-screen results dashboard, download the predictions table as a CSV, inspect feature importances, and view auto-generated charts.',
    },
    {
      q: 'How does FlowML prevent data leakage during preprocessing?',
      a: 'FlowML encapsulates preprocessing transformations (imputation, scaling, one-hot encoding) strictly inside a deterministic scikit-learn pipeline structure. Scalers and encoders are fitted only on train partitions to guarantee zero test data leakage.',
    },
  ];

  return (
    <section id="faq" className="py-24 relative" style={{ background: '#080c14' }}>
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <Pill color="#3b82f6">Frequently Asked Questions</Pill>
            <h2 className="font-sora font-extrabold mt-5 mb-4 text-slate-100" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Everything You Need to Know
            </h2>
          </div>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Reveal key={faq.q} delay={idx * 0.05}>
                <div
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: isOpen ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-sora font-semibold text-base text-slate-100">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6 text-sm text-slate-400 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CALL TO ACTION ─────────────────────────────────────────────────────────── */
function CTA({ onLaunch }) {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#0a0f1c' }}>
      <Blob color="#6366f1" style={{ width: 600, height: 600, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <div
            className="p-12 md:p-16 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 25px 80px -20px rgba(99, 102, 241, 0.35)',
            }}
          >
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
            >
              <Cpu className="w-8 h-8 text-white" />
            </div>

            <h2
              className="font-sora font-extrabold mb-5 text-slate-100"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', letterSpacing: '-0.02em' }}
            >
              Start Building Machine Learning<br />
              <GText from="#6366f1" to="#ec4899">Pipelines in Minutes</GText>
            </h2>

            <p className="text-base md:text-lg mb-10 max-w-xl mx-auto text-slate-400">
              Join thousands of data scientists, engineers, and analysts shipping production models with FlowML Studio.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLaunch}
                className="flex items-center gap-3 px-9 py-4 rounded-2xl text-base md:text-lg font-bold text-white shadow-2xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.5)',
                }}
              >
                <Zap className="w-5 h-5 fill-current" />
                Launch FlowML Studio Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              No credit card required • 100% local processing • Open-source compatible
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────────── */
function Footer({ onLaunch }) {
  const navigate = useNavigate();

  return (
    <footer className="py-16 border-t" style={{ background: '#080c14', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
              >
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-sora font-extrabold text-lg"
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FlowML Studio
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The next-generation visual pipeline canvas for machine learning development, automated benchmarking, and transparent explainable AI.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><button onClick={() => navigate('/studio')} className="hover:text-white transition-colors">Studio Canvas</button></li>
              <li><button onClick={() => navigate('/app')} className="hover:text-white transition-colors">Workspace Dashboard</button></li>
              <li><button onClick={() => navigate('/app/templates')} className="hover:text-white transition-colors">Pre-built Blueprints</button></li>
              <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Create Free Account</button></li>
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Resources & Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><button onClick={() => navigate('/docs')} className="hover:text-white transition-colors">Documentation</button></li>
              <li><button onClick={() => navigate('/tutorials')} className="hover:text-white transition-colors">Tutorials</button></li>
              <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About FlowML</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact Support</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 FlowML Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-400 transition-colors">Privacy</button>
            <span>•</span>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-400 transition-colors">Terms</button>
            <span>•</span>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-400 transition-colors">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN LANDING PAGE ──────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const launch = () => navigate('/studio');

  return (
    <div style={{ background: '#080c14', fontFamily: 'Inter, sans-serif', color: '#f0f4ff', minHeight: '100vh' }}>
      <Navbar onLaunch={launch} />
      <Hero onLaunch={launch} />
      <Stats />
      <Features />
      <Blueprints onLaunch={launch} />
      <Models />
      <CodeCompare />
      <Testimonials />
      <Pricing onLaunch={launch} />
      <FAQ />
      <CTA onLaunch={launch} />
      <Footer onLaunch={launch} />
    </div>
  );
}
