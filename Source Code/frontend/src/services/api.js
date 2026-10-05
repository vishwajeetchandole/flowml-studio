import axios from 'axios';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Fixed: was incorrectly set to :8001; backend runs on :8000
export const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300_000, // 5 min — generous for large datasets / slow machines
});

// Normalise backend error shapes into plain Error objects
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail;
    const msg =
      (typeof detail === 'object' ? detail?.error : detail) ||
      err.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(String(msg)));
  }
);

// ── Endpoints ─────────────────────────────────────────────────────────────────

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

/** POST /api/analyze */
export const analyzeDataset = (fileName) =>
  api.post('/api/analyze', { file_name: fileName }).then((r) => r.data);

/**
 * POST /api/preprocess
 * @param {string}      fileName     - original uploaded filename
 * @param {object}      config       - { missing_values, categorical_encoding, scaling }
 * @param {string|null} targetColumn - excluded from scaling
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
 * @param {string}      fileName          - raw uploaded filename
 * @param {string}      targetColumn      - column to predict
 * @param {string}      taskType          - "classification" | "regression"
 * @param {string|null} processedFileName - preprocessed file to train on (preferred)
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

/**
 * POST /api/predict
 * @param {string}      fileName     - file to run inference on
 * @param {string|null} targetColumn - dropped server-side before inference
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

/** POST /api/pipeline */
export const runPipeline = (nodes, edges) =>
  api.post('/api/pipeline', { nodes, edges }).then((r) => r.data);

/** GET /api/health */
export const checkHealth = () => api.get('/api/health').then((r) => r.data);

/** SSE endpoint URL for real-time logs */
export const LOG_SSE_URL = `${BASE_URL}/api/logs`;

export default api;
