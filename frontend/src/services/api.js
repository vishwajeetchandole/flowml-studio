import axios from 'axios';

export const BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// Normalize error messages from the backend's detail shape
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

/** POST /api/preprocess */
export const preprocessDataset = (fileName, config) =>
  api.post('/api/preprocess', { file_name: fileName, config }).then((r) => r.data);

/** POST /api/train */
export const trainModels = (fileName, targetColumn, taskType = 'classification') =>
  api
    .post('/api/train', {
      file_name: fileName,
      target_column: targetColumn,
      task_type: taskType,
    })
    .then((r) => r.data);

/** POST /api/predict */
export const runPredictions = (fileName) =>
  api.post('/api/predict', { file_name: fileName }).then((r) => r.data);

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
