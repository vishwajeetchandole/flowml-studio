import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { saveProject } from '../../services/api';
import {
  LayoutTemplate, ArrowRight, Sparkles, Layers,
  Activity, Database, BrainCircuit, BarChart3,
  TreePine, Network, Zap, CheckCircle2,
} from 'lucide-react';

export default function TemplatesView() {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();

  const templates = [
    {
      id: 'template-classification',
      title: 'Customer Churn Intelligence',
      badge: 'Classification',
      badgeColor: '#818cf8',
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      description: 'Complete binary classification pipeline predicting churn with median imputation, feature scaling, Random Forest ensemble, and SHAP explainability.',
      dataset: 'telecom_churn.csv (7,043 rows)',
      target: 'Churn (Yes / No)',
      algorithms: ['Random Forest', 'Logistic Regression'],
      nodesList: ['Upload Dataset', 'Fill Missing', 'Scale Features', 'Random Forest', 'Explainable AI', 'Prediction'],
      nodes: [
        { id: 'node-1', type: 'upload', data: { label: 'Upload Dataset', file_name: 'telecom_churn.csv' }, position: { x: 50, y: 150 } },
        { id: 'node-2', type: 'fillMissing', data: { label: 'Fill Missing', missing_values: 'median' }, position: { x: 300, y: 150 } },
        { id: 'node-3', type: 'scale', data: { label: 'Scale Features', scaling: 'standard' }, position: { x: 550, y: 150 } },
        { id: 'node-4', type: 'randomForest', data: { label: 'Random Forest', n_estimators: 100, max_depth: 10 }, position: { x: 800, y: 150 } },
        { id: 'node-5', type: 'explainableAi', data: { label: 'Explainable AI', method: 'shap' }, position: { x: 1050, y: 150 } },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#6366F1' } },
      ],
    },
    {
      id: 'template-regression',
      title: 'Housing Valuation Engine',
      badge: 'Regression',
      badgeColor: '#f97316',
      badgeBg: 'rgba(249, 115, 22, 0.12)',
      description: 'Continuous value prediction pipeline with feature column selection, mean imputation, MinMax normalization, Linear Regression, and automated report export.',
      dataset: 'california_housing.csv (20,640 rows)',
      target: 'MedHouseVal ($USD)',
      algorithms: ['Linear Regression', 'Ridge', 'Decision Tree'],
      nodesList: ['Upload Dataset', 'Select Columns', 'Fill Missing', 'Scale Features', 'Linear Regression', 'Report'],
      nodes: [
        { id: 'node-1', type: 'upload', data: { label: 'Upload Dataset', file_name: 'california_housing.csv' }, position: { x: 50, y: 150 } },
        { id: 'node-2', type: 'selectColumns', data: { label: 'Select Columns', columns: ['MedInc', 'HouseAge', 'AveRooms', 'MedHouseVal'] }, position: { x: 300, y: 150 } },
        { id: 'node-3', type: 'fillMissing', data: { label: 'Fill Missing', missing_values: 'mean' }, position: { x: 550, y: 150 } },
        { id: 'node-4', type: 'scale', data: { label: 'Scale Features', scaling: 'minmax' }, position: { x: 800, y: 150 } },
        { id: 'node-5', type: 'linearRegression', data: { label: 'Linear Regression' }, position: { x: 1050, y: 150 } },
        { id: 'node-6', type: 'report', data: { label: 'Report' }, position: { x: 1300, y: 150 } },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e5-6', source: 'node-5', target: 'node-6', animated: true, style: { stroke: '#6366F1' } },
      ],
    },
    {
      id: 'template-clustering',
      title: 'Customer Segmentation',
      badge: 'Clustering',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      description: 'Unsupervised grouping workflow removing duplicated samples, scaling feature ranges, finding natural cohort clusters with KMeans, and generating distribution report.',
      dataset: 'mall_customers.csv (200 rows)',
      target: 'Unsupervised (K=4 clusters)',
      algorithms: ['K-Means Clustering'],
      nodesList: ['Upload Dataset', 'Remove Duplicates', 'Scale Features', 'K-Means', 'Report'],
      nodes: [
        { id: 'node-1', type: 'upload', data: { label: 'Upload Dataset', file_name: 'mall_customers.csv' }, position: { x: 50, y: 150 } },
        { id: 'node-2', type: 'removeDuplicates', data: { label: 'Remove Duplicates', keep: 'first' }, position: { x: 300, y: 150 } },
        { id: 'node-3', type: 'scale', data: { label: 'Scale Features', scaling: 'standard' }, position: { x: 550, y: 150 } },
        { id: 'node-4', type: 'kmeans', data: { label: 'K-Means', n_clusters: 4, max_iter: 300 }, position: { x: 800, y: 150 } },
        { id: 'node-5', type: 'report', data: { label: 'Report' }, position: { x: 1050, y: 150 } },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#6366F1' } },
        { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#6366F1' } },
      ],
    },
  ];

  const handleUseTemplate = (tpl) => {
    const newId = `proj-tpl-${Date.now()}`;
    const newProject = {
      id: newId,
      name: tpl.title,
      description: tpl.description,
      taskType: tpl.badge.toLowerCase(),
      nodesCount: tpl.nodes.length,
    };

    saveProject(newProject);
    // Persist template nodes & edges to project workflow key
    localStorage.setItem(
      `flowml_workflow_${newId}`,
      JSON.stringify({ nodes: tpl.nodes, edges: tpl.edges })
    );

    showToast(`Template "${tpl.title}" initialized!`, 'success');
    navigate(`/studio?project=${newId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-sora text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Pre-built Workflow Templates
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Kickstart your machine learning projects with production-grade architectures designed for classification, regression, and clustering.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <motion.div
            key={tpl.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl p-6 border flex flex-col justify-between shadow-lg relative overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div>
              {/* Badge & Title */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    background: tpl.badgeBg,
                    color: tpl.badgeColor,
                    border: `1px solid ${tpl.badgeColor}35`,
                  }}
                >
                  {tpl.badge}
                </span>

                <Sparkles className="w-4 h-4" style={{ color: tpl.badgeColor }} />
              </div>

              <h3 className="font-sora font-bold text-base mb-2" style={{ color: 'var(--color-text)' }}>
                {tpl.title}
              </h3>

              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {tpl.description}
              </p>

              {/* Target & Dataset info */}
              <div className="p-3 rounded-2xl border space-y-1.5 mb-4 text-[11px]" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sample Data:</span>
                  <span className="font-mono font-semibold text-slate-200">{tpl.dataset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Spec:</span>
                  <span className="font-mono font-semibold" style={{ color: tpl.badgeColor }}>{tpl.target}</span>
                </div>
              </div>

              {/* Pipeline Step Tags */}
              <div className="space-y-1 mb-6">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Pipeline Steps:
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tpl.nodesList.map((n, i) => (
                    <span
                      key={n}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300"
                    >
                      {i + 1}. {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => handleUseTemplate(tpl)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              }}
            >
              Open in Studio Canvas
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
