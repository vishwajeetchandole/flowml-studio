import axios from 'axios';
import { getCurrentIdToken } from './firebase';

// ── Base URL ──────────────────────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300_000, // 5 min — generous for large datasets / slow machines
});

// ── Attach Auth Token Interceptor ─────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getCurrentIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API Client] Could not resolve ID token for request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Normalise backend error shapes into user-friendly Error objects ───────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = 'An unexpected error occurred';
    if (err.response) {
      const { status, data } = err.response;
      const detail = data?.detail;
      if (status === 401) {
        msg = 'Your session has expired or authentication failed. Please sign in again.';
      } else if (status === 403) {
        msg = typeof detail === 'string' ? detail : 'Access forbidden. Administrator permissions may be required.';
      } else if (status === 413) {
        msg = typeof detail === 'string' ? detail : 'File exceeds maximum upload size (50MB).';
      } else if (status === 429) {
        msg = typeof detail === 'string' ? detail : 'Too many requests. Please wait a moment and try again.';
      } else if (typeof detail === 'object' && detail !== null) {
        msg = detail.error || detail.message || detail.details || 'Server processed request with errors.';
      } else if (typeof detail === 'string') {
        msg = detail;
      } else if (data?.message) {
        msg = data.message;
      } else {
        msg = `Server request failed (Status ${status})`;
      }
    } else if (err.request) {
      msg = 'Unable to reach backend API server. Please check your network or server status.';
    } else {
      msg = err.message || msg;
    }
    const cleanError = new Error(String(msg));
    cleanError.status = err.response?.status;
    return Promise.reject(cleanError);
  }
);

// ── Core Dataset & ML Endpoints ───────────────────────────────────────────────

/** POST /api/upload — multipart file upload */
export const uploadDataset = (file, onProgress) => {
  const fd = new FormData();
  fd.append('file', file);
  return api
    .post('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    })
    .then((r) => r.data);
};

/** GET /api/datasets — list caller's uploaded datasets */
export const listDatasets = () => api.get('/api/datasets').then((r) => r.data);

/** GET /api/datasets/{dataset_id}/preview — get preview rows, missing count, stats */
export const getDatasetPreview = (datasetId) =>
  api.get(`/api/datasets/${datasetId}/preview`).then((r) => r.data);

/** DELETE /api/datasets/{dataset_id} */
export const deleteDataset = (datasetId) =>
  api.delete(`/api/datasets/${datasetId}`).then((r) => r.data);

/** POST /api/analyze */
export const analyzeDataset = (fileName) =>
  api.post('/api/analyze', { file_name: fileName }).then((r) => r.data);

/**
 * POST /api/preprocess
 */
export const preprocessDataset = (fileName, config, targetColumn = null) =>
  api
    .post('/api/preprocess', {
      file_name: fileName,
      config,
      ...(targetColumn ? { target_column: targetColumn } : {}),
    })
    .then((r) => r.data);

/**
 * POST /api/train
 */
export const trainModels = (fileName, targetColumn, taskType = 'classification', processedFileName = null) =>
  api
    .post('/api/train', {
      file_name: fileName,
      target_column: targetColumn,
      task_type: taskType,
      ...(processedFileName ? { processed_file_name: processedFileName } : {}),
    })
    .then((r) => r.data);

/** GET /api/models — list caller's trained models */
export const listModels = () => api.get('/api/models').then((r) => r.data);

/** DELETE /api/models/{model_id} */
export const deleteModel = (modelId) =>
  api.delete(`/api/models/${modelId}`).then((r) => r.data);

/**
 * POST /api/predict
 */
export const runPredictions = (fileName, targetColumn = null) =>
  api
    .post('/api/predict', {
      file_name: fileName,
      ...(targetColumn ? { target_column: targetColumn } : {}),
    })
    .then((r) => r.data);

/** GET /api/visualizations?file_name=... */
export const getVisualizations = (fileName) =>
  api.get('/api/visualizations', { params: { file_name: fileName } }).then((r) => r.data);

/** POST /api/pipeline — synchronous pipeline execution */
export const runPipeline = (nodes, edges) =>
  api.post('/api/pipeline', { nodes, edges }).then((r) => r.data);

// ── Background Runs Endpoints ─────────────────────────────────────────────────

/** POST /api/runs — async job queue pipeline run */
export const submitRun = (nodes, edges, workflowMeta = null) =>
  api.post('/api/runs', { nodes, edges, workflow: workflowMeta }).then((r) => r.data);

/** GET /api/runs — list all runs for caller */
export const listRuns = () => api.get('/api/runs').then((r) => r.data);

/** GET /api/runs/{run_id} — get run status, result, logs */
export const getRun = (runId) => api.get(`/api/runs/${runId}`).then((r) => r.data);

/** POST /api/runs/{run_id}/stop — request stop */
export const stopRun = (runId) => api.post(`/api/runs/${runId}/stop`).then((r) => r.data);

/** GET /api/health */
export const checkHealth = () => api.get('/api/health').then((r) => r.data);

/** SSE endpoint URL for real-time logs */
export const LOG_SSE_URL = `${BASE_URL}/api/logs`;

// ── Projects Storage Helpers (Stored per-user in localStorage) ────────────────
const PROJECTS_KEY = 'flowml_user_projects_v2';

export function getProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      // Seed default project
      const initial = [
        {
          id: 'proj-churn-demo',
          name: 'Customer Churn Intelligence',
          description: 'End-to-end binary classification pipeline with Random Forest & SHAP analysis.',
          created: new Date(Date.now() - 3600000 * 48).toISOString(),
          lastModified: new Date(Date.now() - 3600000 * 2).toISOString(),
          nodesCount: 5,
          taskType: 'classification',
        },
        {
          id: 'proj-house-demo',
          name: 'Housing Valuation Engine',
          description: 'Predict median house values using Ridge and Random Forest regressors.',
          created: new Date(Date.now() - 3600000 * 72).toISOString(),
          lastModified: new Date(Date.now() - 3600000 * 12).toISOString(),
          nodesCount: 4,
          taskType: 'regression',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProject(project) {
  const projects = getProjects();
  const existingIdx = projects.findIndex((p) => p.id === project.id);
  const now = new Date().toISOString();
  if (existingIdx >= 0) {
    projects[existingIdx] = {
      ...projects[existingIdx],
      ...project,
      lastModified: now,
    };
  } else {
    projects.unshift({
      ...project,
      created: now,
      lastModified: now,
    });
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return project;
}

export function deleteProject(id) {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  localStorage.removeItem(`flowml_workflow_${id}`);
  return true;
}

export function duplicateProject(id) {
  const projects = getProjects();
  const found = projects.find((p) => p.id === id);
  if (!found) return null;
  const newId = `proj-${Date.now()}`;
  const copy = {
    ...found,
    id: newId,
    name: `${found.name} (Copy)`,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  projects.unshift(copy);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

  // Also duplicate workflow canvas data if saved
  const wfData = localStorage.getItem(`flowml_workflow_${id}`);
  if (wfData) {
    localStorage.setItem(`flowml_workflow_${newId}`, wfData);
  }
  return copy;
}

/* ─── PHASE 3: Python Execution Endpoints ───────────────────────────────────── */

/** POST /api/code/run — execute isolated Python script */
export const runPythonCode = (code, inputDatasetId = null, timeout = 15) =>
  api
    .post('/api/code/run', {
      code,
      input_dataset_id: inputDatasetId,
      timeout,
    })
    .then((r) => r.data);

/** POST /api/code/runs/{run_id}/stop — abort running Python worker */
export const stopPythonCode = (runId) =>
  api.post(`/api/code/runs/${runId}/stop`).then((r) => r.data);

/** GET /api/code/history — get caller's script run history */
export const getCodeHistory = () =>
  api.get('/api/code/history').then((r) => r.data);

/* ─── PHASE 3: Admin & Security Endpoints ───────────────────────────────────── */

/** GET /api/admin/users */
export const adminListUsers = () =>
  api.get('/api/admin/users').then((r) => r.data);

/** POST /api/admin/users/{uid}/status */
export const adminSetUserStatus = (uid, active) =>
  api.post(`/api/admin/users/${uid}/status`, { active }).then((r) => r.data);

/** GET /api/admin/jobs */
export const adminListJobs = () =>
  api.get('/api/admin/jobs').then((r) => r.data);

/** GET /api/admin/system */
export const adminGetSystemMetrics = () =>
  api.get('/api/admin/system').then((r) => r.data);

/** GET /api/admin/limits */
export const adminGetLimits = () =>
  api.get('/api/admin/limits').then((r) => r.data);

/** POST /api/admin/limits */
export const adminUpdateLimits = (limits) =>
  api.post('/api/admin/limits', limits).then((r) => r.data);

/** GET /api/admin/audit-logs */
export const adminGetAuditLogs = (limit = 50) =>
  api.get('/api/admin/audit-logs', { params: { limit } }).then((r) => r.data);

/** DELETE /api/account — GDPR data wipe */
export const deleteUserAccount = () =>
  api.delete('/api/account').then((r) => r.data);

export default api;
