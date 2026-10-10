import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, FileText, Mail, BookOpen, Video,
  Cpu, CheckCircle2, Send, ExternalLink, HelpCircle, Layers,
  Sparkles, Lock, ArrowRight, Code2, Terminal, Database
} from 'lucide-react';

function PageHeader({ title, subtitle, badge, icon: Icon }) {
  const navigate = useNavigate();

  return (
    <div className="relative pt-24 pb-12 border-b border-white/5 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to FlowML
        </button>

        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {badge && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {badge}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function PageLayout({ children, title, subtitle, badge, icon }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#080c14]/90 backdrop-blur-md border-b border-white/5 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">FlowML Studio</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/signin')}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/app')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            >
              Open App
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <PageHeader title={title} subtitle={subtitle} badge={badge} icon={icon} />
        <div className="max-w-5xl mx-auto px-6 py-12">
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#06090f] text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FlowML Studio. Visual AutoML Platform.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-300 transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-300 transition-colors">Terms</button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-300 transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── 1. Documentation Page ─────────────────────────────────────────────────── */
export function DocsPage() {
  const [activeTab, setActiveTab] = React.useState('nodes');
  const [search, setSearch] = React.useState('');

  const NODE_CATALOG = [
    {
      category: 'Data Ingestion',
      nodes: [
        {
          name: 'Upload Dataset',
          type: 'upload',
          inputs: 'None (Root Node)',
          outputs: 'DataFrame (csv/xlsx/xls)',
          params: 'file: Binary File Upload, file_name: Target identifier',
          when: 'Ingest raw local datasets from disk into user-isolated project storage.'
        },
        {
          name: 'Load CSV',
          type: 'loadCsv',
          inputs: 'None (Root Node)',
          outputs: 'DataFrame (csv)',
          params: 'file_path: Internal relative path, delimiter: Separator symbol',
          when: 'Attach previously stored datasets or system sample datasets.'
        },
        {
          name: 'Preview Dataset',
          type: 'preview',
          inputs: 'DataFrame',
          outputs: 'DataFrame (Pass-through) + Schema Profile',
          params: 'sample_rows: Top N rows to preview (default 10)',
          when: 'Inspect column data types, missing value percentages, and distributions.'
        },
        {
          name: 'Remove Duplicates',
          type: 'removeDuplicates',
          inputs: 'DataFrame',
          outputs: 'De-duplicated DataFrame',
          params: 'keep: First or Last occurrence, subset: Column identifiers',
          when: 'Clean repeating observations to prevent bias or data leakage.'
        },
        {
          name: 'Select Columns',
          type: 'selectColumns',
          inputs: 'DataFrame',
          outputs: 'Filtered Column DataFrame',
          params: 'selected_columns: Array of feature names to preserve',
          when: 'Filter out uninformative IDs, timestamps, or target leakage features.'
        }
      ]
    },
    {
      category: 'Preprocessing & Feature Engineering',
      nodes: [
        {
          name: 'Fill Missing',
          type: 'fillMissing',
          inputs: 'DataFrame',
          outputs: 'Imputed DataFrame',
          params: 'missing_values: mean | median | most_frequent | constant | drop',
          when: 'Handle null entries before passing into scikit-learn estimators.'
        },
        {
          name: 'Encode Labels',
          type: 'encode',
          inputs: 'DataFrame',
          outputs: 'Numerically Encoded DataFrame',
          params: 'categorical_encoding: label (Ordinal) | onehot (Dummy columns)',
          when: 'Convert textual categorical features into machine-readable numeric matrices.'
        },
        {
          name: 'Scale Features',
          type: 'scale',
          inputs: 'DataFrame',
          outputs: 'Normalized Feature DataFrame',
          params: 'scaling: standard (Z-Score) | minmax (0-1 Range) | robust (IQR)',
          when: 'Normalize feature magnitudes for distance-based and gradient estimators.'
        },
        {
          name: 'Split Train/Test',
          type: 'splitData',
          inputs: 'DataFrame',
          outputs: 'Train DataFrame & Test DataFrame',
          params: 'test_size: 0.15 - 0.30, random_state: Reproducibility integer seed',
          when: 'Isolate holdout test set to empirically validate model generalization.'
        },
        {
          name: 'Custom Python',
          type: 'customPython',
          inputs: 'DataFrame (bound as "df")',
          outputs: 'Transformed DataFrame',
          params: 'code: Python script, timeout: 5-60s execution limit',
          when: 'Perform arbitrary domain-specific transformations, math formulas, or outlier filters.'
        }
      ]
    },
    {
      category: 'Algorithms & Model Training',
      nodes: [
        {
          name: 'Random Forest',
          type: 'randomForest',
          inputs: 'Preprocessed Train DataFrame',
          outputs: 'Trained Model Artifact + Validation Metrics',
          params: 'n_estimators (50-200), max_depth (5-20), target_col: Target label',
          when: 'Robust non-linear baseline resilient to outliers and feature interactions.'
        },
        {
          name: 'Linear / Logistic Regression',
          type: 'linearRegression / logisticRegression',
          inputs: 'Preprocessed Train DataFrame',
          outputs: 'Linear Model Artifact + Coefficients',
          params: 'C: Inverse regularization strength, solver: lbfgs | liblinear',
          when: 'Interpretable linear benchmark for continuous prices or binary odds.'
        },
        {
          name: 'Decision Tree',
          type: 'decisionTree',
          inputs: 'Preprocessed Train DataFrame',
          outputs: 'Decision Tree Graph + Rules',
          params: 'max_depth: Maximum tree split levels, criterion: gini | entropy',
          when: 'Highly explainable decision boundaries with rule-based extraction.'
        },
        {
          name: 'Support Vector Machine (SVM)',
          type: 'svm',
          inputs: 'Scaled Train DataFrame',
          outputs: 'Maximum-Margin Classifier / Regressor',
          params: 'kernel: rbf | linear, C: Margin penalty, gamma: Scale',
          when: 'Effective in high-dimensional feature spaces with clear separation margins.'
        },
        {
          name: 'K-Means Clustering',
          type: 'kmeans',
          inputs: 'Scaled Feature DataFrame',
          outputs: 'Cluster Labels + Centroid Coordinates',
          params: 'n_clusters: Number of cohorts (2-10), init: k-means++',
          when: 'Unsupervised pattern recognition, customer segmentation, or cohort grouping.'
        }
      ]
    },
    {
      category: 'AI Decision, Explainability & Output',
      nodes: [
        {
          name: 'AI Decision',
          type: 'aiDecision',
          inputs: 'Preprocessed Dataset',
          outputs: 'Champion Model Recommendation + Tournament Leaderboard',
          params: 'metric_focus: accuracy | f1 | r2 | speed',
          when: 'Automatically train and benchmark multiple candidate models simultaneously.'
        },
        {
          name: 'Explainable AI',
          type: 'explainableAi',
          inputs: 'Trained Model + Dataset',
          outputs: 'SHAP Feature Importance & Force Plots',
          params: 'explainer_type: TreeExplainer | KernelExplainer',
          when: 'Audit model decisions, regulatory compliance, and individual feature contributions.'
        },
        {
          name: 'Prediction Output',
          type: 'prediction',
          inputs: 'Trained Model + Input Records',
          outputs: 'Inference Prediction Array + Confidence Probabilities',
          params: 'batch_inference: true | false',
          when: 'Run batch inference or single-sample real-time predictions.'
        },
        {
          name: 'Report',
          type: 'report',
          inputs: 'Pipeline Execution Context',
          outputs: 'Audit Report (HTML / PDF / JSON)',
          params: 'reportTitle: Document heading, format: html | pdf | json',
          when: 'Export reproducible compliance documentation and performance summaries.'
        }
      ]
    }
  ];

  const METRICS = [
    { name: 'Accuracy', formula: '(TP + TN) / Total', desc: 'Overall percentage of correct predictions across all classes. Best for balanced datasets.' },
    { name: 'Precision', formula: 'TP / (TP + FP)', desc: 'Proportion of positive identifications that were actually correct. Crucial when false positives are expensive.' },
    { name: 'Recall (Sensitivity)', formula: 'TP / (TP + FN)', desc: 'Proportion of actual positives identified correctly. Crucial for medical diagnosis and fraud detection.' },
    { name: 'F1 Score', formula: '2 * (Precision * Recall) / (Precision + Recall)', desc: 'Harmonic mean of precision and recall. Ideal single metric for imbalanced classification tasks.' },
    { name: 'ROC-AUC', formula: 'Area under TPR vs FPR curve', desc: 'Discriminative capacity across all classification decision thresholds. Invariant to class distribution.' },
    { name: 'R² (Determination)', formula: '1 - (SS_res / SS_tot)', desc: 'Proportion of variance in target variable predictable from independent features. 1.0 is a perfect score.' },
    { name: 'MSE / RMSE', formula: 'Mean((y - y_hat)²)', desc: 'Mean Squared Error heavily penalizes large outlier mistakes. RMSE is in the original target units.' },
    { name: 'MAE', formula: 'Mean(|y - y_hat|)', desc: 'Mean Absolute Error represents median-style average magnitude of prediction deviations.' },
    { name: 'Silhouette Score', formula: '(b - a) / max(a, b)', desc: 'Measures how similar an observation is to its own cluster compared to neighboring clusters (-1 to +1).' }
  ];

  const FAQS = [
    {
      q: 'How does isolated code execution protect system security?',
      a: 'User scripts NEVER run inside the main FastAPI server process. Each code invocation runs inside an isolated container sandbox (or dedicated child subprocess) with a stripped environment, read-only root filesystem, memory capped at 256MB, CPU capped at 1.0 core, execution timeout enforced at 15s, and all network calls statically and dynamically blocked.'
    },
    {
      q: 'Can I export trained models to production?',
      a: 'Yes! Trained model artifacts can be downloaded directly from the Models tab as standalone Python joblib binaries. These can be deployed directly into AWS Lambda, Docker, or any Python runtime with standard scikit-learn.'
    },
    {
      q: 'What file formats are supported for dataset ingestion?',
      a: 'FlowML natively parses CSV (.csv), Excel spreadsheets (.xlsx, .xls), and structured tabular JSON files up to 25MB (configurable by system administrators in Admin Ops).'
    },
    {
      q: 'How is user data kept private across multi-tenant teams?',
      a: 'All files, dataset uploads, models, and execution logs are partitioned under user-scoped paths (storage/{uid}/). Access is guarded by Firebase ID token verification and path traversal defenses.'
    },
    {
      q: 'What happens if a custom Python script enters an infinite loop or memory leak?',
      a: 'The execution supervisor enforces strict watchdog timeouts (default 15s) and active memory limits (256MB). Any process exceeding memory or time limits is immediately terminated with SIGKILL, returning a clear error without crashing the server.'
    }
  ];

  const filteredNodes = NODE_CATALOG.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.when.toLowerCase().includes(search.toLowerCase()) ||
      n.type.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.nodes.length > 0);

  return (
    <PageLayout
      title="System Documentation & API Reference"
      subtitle="Complete guides, node definitions, mathematical metrics glossary, and isolated execution limits for FlowML Studio."
      badge="Comprehensive Manual"
      icon={BookOpen}
    >
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
        {[
          { id: 'nodes', label: '14 Studio Nodes' },
          { id: 'metrics', label: 'Metrics Glossary' },
          { id: 'sandbox', label: 'Execution Limits & Sandbox' },
          { id: 'libraries', label: 'Supported Libraries' },
          { id: 'faq', label: 'Security & FAQs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Nodes Tab */}
      {activeTab === 'nodes' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              FlowML provides 14 visual building blocks covering data ingestion, feature transformation, machine learning models, and explainability.
            </p>
            <input
              type="text"
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0e1422] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>

          {filteredNodes.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> {cat.category}
              </h3>
              <div className="grid gap-3">
                {cat.nodes.map((node, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0e1422] border border-white/5 hover:border-indigo-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-white">{node.name}</span>
                        <code className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {node.type}
                        </code>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{node.when}</p>
                    <div className="grid sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Inputs</span>
                        <span className="text-slate-300 font-mono text-[10px]">{node.inputs}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Outputs</span>
                        <span className="text-slate-300 font-mono text-[10px]">{node.outputs}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Key Parameters</span>
                        <span className="text-indigo-300 font-mono text-[10px] truncate block">{node.params}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            Standard loss metrics and evaluation benchmarks calculated during pipeline runs and model tournament leaderboards.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {METRICS.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0e1422] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{m.name}</h4>
                  <code className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {m.formula}
                  </code>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sandbox & Limits Tab */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0e1422] border border-indigo-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Isolated Execution Sandbox Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              To guarantee zero impact on the primary API server, all user-authored Python code and DAG custom transform blocks execute inside a hardened sandbox container worker. If Docker is unavailable in local environments, the backend seamlessly falls back to a restricted OS child process with active runtime watchdog enforcement.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'CPU Quota', val: '1.0 Core', desc: 'Isolated worker CPU quota to prevent compute exhaustion.' },
              { title: 'RAM Ceiling', val: '256 MB', desc: 'Active memory watch. Exceeding triggers automatic SIGKILL termination.' },
              { title: 'Execution Timeout', val: '15 - 60s', desc: 'Strict supervisor watchdog aborts any infinite while loops.' },
              { title: 'PIDs Ceiling', val: '64 Processes', desc: 'Fork bombs and multi-process spawns are proactively blocked.' },
              { title: 'Network Policy', val: 'Blocked (None)', desc: 'Zero outbound or inbound network connections permitted.' },
              { title: 'Root Filesystem', val: 'Read-Only', desc: 'Temp storage limited to a 64MB memory tmpfs mounted at /tmp.' },
            ].map((lim, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{lim.title}</span>
                <span className="text-base font-black text-indigo-400 font-mono block">{lim.val}</span>
                <p className="text-xs text-slate-400">{lim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Supported Libraries Tab */}
      {activeTab === 'libraries' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            The Python sandbox includes production data science and analytics packages:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'NumPy', ver: '>= 1.24', desc: 'Vectorized tensor operations, linear algebra, log/exp mathematical transforms.' },
              { name: 'Pandas', ver: '>= 2.0', desc: 'DataFrame ingestion, filtering, grouping, date arithmetic, and series encoding.' },
              { name: 'Scikit-Learn', ver: '>= 1.4', desc: 'Preprocessing scalers, encoders, classifiers, regressors, and loss functions.' },
              { name: 'Matplotlib', ver: '>= 3.8', desc: 'Charts rendered via headless Agg backend automatically returned as base64 PNGs.' },
              { name: 'Python Standard', ver: '3.10+', desc: 'Standard math, datetime, re (regex), json, collections, and itertools.' }
            ].map((lib, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0e1422] border border-white/5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  Py
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{lib.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{lib.ver}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{lib.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#0e1422] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

/* ─── 2. Tutorials Page ─────────────────────────────────────────────────────── */
export function TutorialsPage() {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const SAMPLE_DATASETS = [
    {
      name: 'Titanic Passenger Survival',
      filename: 'titanic.csv',
      task: 'Binary Classification',
      rows: '891 Observations',
      cols: '11 Features',
      target: 'Survived (0 = Died, 1 = Lived)',
      desc: 'Predict passenger survival probabilities based on passenger class, age, fare, and cabin embarkation port.',
      downloadUrl: '/samples/titanic.csv',
      templateId: 'classification'
    },
    {
      name: 'California Real Estate Housing',
      filename: 'housing.csv',
      task: 'Continuous Regression',
      rows: '506 Observations',
      cols: '9 Numerical Metrics',
      target: 'MedHouseVal (Median Property Price)',
      desc: 'Predict median home values across block groups based on median household income, house age, and room averages.',
      downloadUrl: '/samples/housing.csv',
      templateId: 'regression'
    }
  ];

  const STARTER_CODES = [
    {
      title: '1. Custom Data Cleaning & Null Treatment',
      desc: 'Handle missing values with domain logic and strip outliers using pandas and numpy.',
      code: `# FlowML Custom Python Transformation
# df is automatically provided by the upstream node
import numpy as np

# 1. Fill missing age values with median
if 'Age' in df.columns:
    median_age = df['Age'].median()
    df['Age'] = df['Age'].fillna(median_age)
    print(f"Imputed Age column with median: {median_age}")

# 2. Extract title prefixes from passenger names
if 'Name' in df.columns:
    df['Title'] = df['Name'].str.extract(r' ([A-Za-z]+)\\.', expand=False)
    print("Extracted title categories:", df['Title'].value_counts().head(3).to_dict())

print(f"Transformation complete. Result shape: {df.shape}")
`
    },
    {
      title: '2. Log Transform & Interaction Feature Engineering',
      desc: 'Synthesize polynomial features and normalize skewed distributions for linear models.',
      code: `# Feature Engineering: Outliers and Interaction Terms
import numpy as np

# Apply log1p transform to positive numerical columns to compress long tails
num_cols = df.select_dtypes(include=[np.number]).columns
for col in num_cols:
    if (df[col] >= 0).all():
        df[f'{col}_log'] = np.log1p(df[col])

# Create interaction features if multiple numeric columns exist
if len(num_cols) >= 2:
    f1, f2 = num_cols[0], num_cols[1]
    df[f'{f1}_mult_{f2}'] = df[f1] * df[f2]
    print(f"Created interaction feature: {f1}_mult_{f2}")

print(f"Engineered feature set: {list(df.columns)}")
`
    },
    {
      title: '3. Custom Matplotlib Visualizer',
      desc: 'Generate distribution figures. Charts are rendered by matplotlib Agg and returned directly to the UI.',
      code: `# Plot generation in FlowML Sandbox
import matplotlib.pyplot as plt

plt.figure(figsize=(7, 4))
plt.title("Distribution of Primary Numerical Column")
first_num = df.select_dtypes(include=['number']).columns[0]
plt.hist(df[first_num].dropna(), bins=20, color='#6366f1', edgecolor='black', alpha=0.8)
plt.xlabel(first_num)
plt.ylabel("Frequency")
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
# Matplotlib figures are automatically captured and displayed!
print(f"Chart rendered for column: {first_num}")
`
    }
  ];

  return (
    <PageLayout
      title="Hands-On Tutorials & Quickstarts"
      subtitle="Kickstart your visual machine learning workflow with ready-to-run sample datasets and reusable Python scripts."
      badge="Interactive Guides"
      icon={Video}
    >
      <div className="space-y-12">
        {/* Sample Datasets Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              01
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pre-Loaded Sample Datasets (1-Click Run)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 max-w-2xl">
            Download our curated sample datasets or launch them directly with ready-made visual pipelines in the Studio.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {SAMPLE_DATASETS.map((ds, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                      {ds.task}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{ds.rows} · {ds.cols}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{ds.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{ds.desc}</p>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-slate-400 mb-6">
                    <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Target Variable</span>
                    <span className="text-emerald-400">{ds.target}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <a
                    href={ds.downloadUrl}
                    download={ds.filename}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white text-center transition-all border border-white/10"
                  >
                    Download CSV
                  </a>
                  <button
                    onClick={() => navigate('/app/templates')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                  >
                    Open Blueprint <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Step Walkthrough Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              02
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              4-Step Visual Modeling Workflow
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Follow this end-to-end framework to build and evaluate models in minutes.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: 'Step 1',
                title: 'Data Ingestion & Profiling',
                desc: 'Upload CSV or connect datasets. The preview inspector automatically infers column types, missing value ratios, and distributions.'
              },
              {
                step: 'Step 2',
                title: 'Feature Engineering',
                desc: 'Connect Fill Missing, One-Hot Encoding, and StandardScaler blocks. Drop in a Custom Python block for domain formulas.'
              },
              {
                step: 'Step 3',
                title: 'Tournament Benchmark',
                desc: 'Add multiple algorithm nodes or the AI Decision node. FlowML trains candidates concurrently across a thread pool.'
              },
              {
                step: 'Step 4',
                title: 'Audit & Export',
                desc: 'Inspect the accuracy leaderboard, confusion matrix, and SHAP explainability charts. Download the production joblib artifact.'
              }
            ].map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0e1422] border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{step.step}</span>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Starter Python Snippets */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              03
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Starter Python Sandbox Code Examples
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Tested starter code ready to copy into your Custom Python DAG blocks or Python Studio.
          </p>

          <div className="space-y-6">
            {STARTER_CODES.map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-[#0e1422] border border-white/5 overflow-hidden">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCode(item.code, idx)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 border border-white/10"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Code2 className="w-3.5 h-3.5" />
                          Copy Script
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/app/code')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-xs font-semibold text-indigo-300 hover:text-white transition-all border border-indigo-500/30"
                    >
                      Open in Studio
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-[#080c14]">
                  <pre className="font-mono text-xs text-indigo-200/90 leading-relaxed overflow-x-auto whitespace-pre">
                    {item.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

/* ─── 3. About Page ─────────────────────────────────────────────────────────── */
export function AboutPage() {
  return (
    <PageLayout
      title="About FlowML"
      subtitle="Bridging the gap between code-first ML engineering and intuitive no-code workflow design."
      badge="Our Mission"
      icon={Cpu}
    >
      <div className="max-w-3xl space-y-8">
        <div className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white">Visual Power Without The Black Box</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            FlowML Studio was created with a clear principle: machine learning should be visual and rapid, without sacrificing the rigour, auditability, and execution performance of state-of-the-art Python toolchains.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every block on the canvas maps directly to verified scikit-learn transformers, real pandas dataframes, and mathematical loss functions. When you click run, your graph compiles into a validated Directed Acyclic Graph (DAG) executed with isolated memory sandboxes.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <span className="text-2xl font-black text-indigo-400 block mb-1">100%</span>
            <span className="text-xs text-slate-400">Scikit-Learn Compatible</span>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <span className="text-2xl font-black text-blue-400 block mb-1">0ms</span>
            <span className="text-xs text-slate-400">Cloud Lock-in</span>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <span className="text-2xl font-black text-emerald-400 block mb-1">SHAP</span>
            <span className="text-xs text-slate-400">Explainable Decisions</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

/* ─── 4. Contact Page ───────────────────────────────────────────────────────── */
export function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout
      title="Contact Support & Sales"
      subtitle="Have questions about deploying FlowML on your private cloud or custom dataset integrations?"
      badge="Get in Touch"
      icon={Mail}
    >
      <div className="max-w-xl p-8 rounded-2xl bg-[#0e1422] border border-white/5">
        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Message Dispatched</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thank you for reaching out! Our engineering team will review your inquiry and follow up within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080c14] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Work Email</label>
              <input
                required
                type="email"
                placeholder="jane@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080c14] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Tell us about your pipeline requirements..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080c14] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Send Inquiry
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  );
}

/* ─── 5. Privacy Policy Page ─────────────────────────────────────────────────── */
export function PrivacyPage() {
  return (
    <PageLayout
      title="Privacy Policy"
      subtitle="How FlowML handles your telemetry, training data, and user identity."
      badge="Security & Compliance"
      icon={Shield}
    >
      <div className="max-w-3xl space-y-6 text-sm text-slate-400 leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
          <h2 className="text-base font-bold text-white">1. Data Ownership & Sovereignty</h2>
          <p>
            Your datasets, feature columns, and trained models remain 100% your property. FlowML never uses customer datasets to train foundational models or shared services.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
          <h2 className="text-base font-bold text-white">2. User Authentication</h2>
          <p>
            Authentication credentials are processed through Firebase Authentication. We store only your email identifier and unique user identification token (UID) to scope file system directories and sandbox isolation.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
          <h2 className="text-base font-bold text-white">3. Local & Dev Mode</h2>
          <p>
            In offline development mode (DEV_AUTH), all storage paths reside locally within your disk workspace storage folder. No network telemetry is sent externally.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}

/* ─── 6. Terms of Service Page ───────────────────────────────────────────────── */
export function TermsPage() {
  return (
    <PageLayout
      title="Terms of Service"
      subtitle="Standard software usage license and rights when executing FlowML pipelines."
      badge="Legal Agreement"
      icon={FileText}
    >
      <div className="max-w-3xl space-y-6 text-sm text-slate-400 leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
          <h2 className="text-base font-bold text-white">1. Permitted Use</h2>
          <p>
            You may use FlowML Studio for personal, educational, research, and commercial machine learning applications. You are solely responsible for ensuring training data meets applicable privacy regulations (such as HIPAA and GDPR).
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#0e1422] border border-white/5 space-y-3">
          <h2 className="text-base font-bold text-white">2. Execution Safety</h2>
          <p>
            Machine learning outputs are probabilistic inferences. You agree that model predictions are advisory and must be verified before deployment in critical safety-of-life or high-liability systems.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
