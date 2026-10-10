# FlowML Development Progress

## Phase 1: Backend Engine and Contracts ✓
- [x] 1.1 `backend/auth.py` - get_current_user (Firebase verify + DEV_AUTH bypass, default DEV_AUTH="1")
- [x] 1.2 `backend/services/store.py` - StoreBackend interface + LocalDiskStore (per-uid paths, path-traversal guard)
- [x] 1.3 Rewrite `routes/upload.py` - uses uid, store.py, returns dataset_id; added GET /api/datasets, GET /preview, DELETE
- [x] 1.4 Rewrite `routes/analyze.py` - uid-scoped dataset lookup
- [x] 1.5 Rewrite `routes/preprocess.py` - per-uid datasets + preprocessors artifacts
- [x] 1.6 Rewrite `routes/train.py` - per-uid model_id, artifacts via store.py, Windows-safe temp handling; added GET /api/models, DELETE
- [x] 1.7 Rewrite `routes/predict.py` - predict_with_store() resolves both dataset and model by uid
- [x] 1.8 Rewrite `routes/visualize.py` - per-uid artifact resolution; added actual_vs_predicted + model_comparison
- [x] 1.9 Update `app.py` - removed global ensure_dir calls; registered runs router
- [x] 2.1-2.4 Executor Rebuild - graph validation, status tracking, SHA-256 output caching, per-run logs/metrics
- [x] 3.1-3.3 Job Queue - InProcessQueue with concurrency limits and runs router
- [x] 4.1-4.6 ML Completeness - data nodes (removeDuplicates, selectColumns, splitData), model nodes (knn, svm, kmeans, aiDecision), explainableAi, report
- [x] 5.1-5.5 All 42 backend pytest tests pass

---

## Phase 2: Frontend Product ✓

### 1. Auth & API Client
- [x] `frontend/src/services/firebase.js`: Firebase Auth SDK initialization with real Firebase + automatic `DEV_AUTH` mock fallback (stores session in localStorage, issues dev bearer tokens, simulates full auth flow when keys are absent).
- [x] `frontend/src/context/AuthContext.jsx`: Full React auth context providing `user`, `signIn`, `signUp`, `signOut`, `resetPassword`, `resendVerification`, `getIdToken`, `isDevMode`.
- [x] `frontend/src/services/api.js`: Centralized Axios client attaching `Authorization: Bearer <token>` on all requests. CRUD endpoints for datasets, models, runs, pipelines, and project helpers.
- [x] `frontend/src/components/auth/ProtectedRoute.jsx`: Protected route guard redirecting unauthenticated users to `/signin`.
- [x] Auth screens:
  - `SignIn.jsx`: Email/password login, demo engineer bypass button, link to reset password & sign up.
  - `SignUp.jsx`: Name, email, password, confirm password, terms check, instant dev login.
  - `ForgotPassword.jsx`: Email recovery trigger & reset dispatch.
  - `VerifyEmail.jsx`: Email verification prompt, resend trigger, continue to workspace.

### 2. Dashboard (`/app` Layout with Persistent Sidebar)
- [x] `DashboardLayout.jsx`: Responsive layout with navigation sidebar (Projects, Datasets, Models, Runs, Templates, Settings), live backend API health badge, user profile card, sign out.
- [x] `ProjectsView.jsx`: Project CRUD, template badges, duplicate project, rename, delete modal with confirmation, one-click "Open in Studio".
- [x] `DatasetsView.jsx`: Dataset table, upload modal with file selector, preview modal (schema, rows, columns, nulls, duplicates), delete.
- [x] `ModelsView.jsx`: Trained model catalog, task type, algorithm version, evaluation metrics badges (Accuracy, F1, R²), delete.
- [x] `RunsView.jsx`: Run execution table, live status polling (`queued`, `running`, `completed`, `failed`, `stopped`), run logs modal, metrics inspect, stop run button, rerun action.
- [x] `TemplatesView.jsx`: 3 production blueprints (Customer Churn, Real Estate Valuation, Customer Segmentation) that open directly in Studio canvas.
- [x] `SettingsView.jsx`: Account settings, UID copy tool, Firebase config diagnostic table, dev auth switch.
- [x] Common UI: `Toast.jsx` for alerts and feedback, animated loading skeletons, empty state illustrations.

### 3. Studio Upgrades (`Workflow.jsx`, `App.jsx`, Inspector & Nodes)
- [x] **History & Saving**: Undo/Redo stack (with keyboard shortcuts `Ctrl+Z`, `Ctrl+Y`), Stop button, debounced autosave + manual save button, workflow title & description editing.
- [x] **Pre-run DAG Validation**: Graph cycle detection, isolated nodes check, source node requirement check, visual red error badges and tooltip banners on offending nodes.
- [x] **Live Node Execution Badges**: Status badges (`Pending`, `Running`, `Completed`, `Failed`) overlaid dynamically during pipeline execution.
- [x] **10 New Palette Nodes & Inspectors**:
  - `removeDuplicates`: Column subsets, keep strategy.
  - `selectColumns`: Include/exclude column selection.
  - `splitData`: Test size ratio, random seed, stratification flag.
  - `logisticRegression`: C regularization, penalty, solver.
  - `knn`: Number of neighbors, metric distance, weight function.
  - `svm`: Kernel (rbf/linear/poly), C regularization, gamma.
  - `kmeans`: n_clusters, init method, max iterations.
  - `aiDecision`: Target column, task type, metric optimization target.
  - `explainableAi`: Model selector, top-N feature count, baseline sample count.
  - `report`: Report title, leaderboard inclusion, metric charts inclusion.
- [x] **Results Overlay Upgrades**:
  - Actual vs. Predicted comparison tab.
  - Model Leaderboard comparison tab.
  - Explainability & SHAP feature importance tab.
  - HTML Report download button & viewer.

### 4. Landing Page Completion & Routing
- [x] Header Navigation: `Home`, `Features`, `Documentation`, `Tutorials`, `About`, `Contact`.
- [x] Action Buttons: `Sign In` (`/signin`), `Get Started` / `Sign Up` (`/signup`), `Studio` (`/studio`).
- [x] Legal & Info Pages:
  - `frontend/src/pages/info/InfoPages.jsx`: Dedicated pages for `/docs`, `/tutorials`, `/about`, `/contact`, `/privacy`, `/terms`.
- [x] Responsive layout across desktop, tablet, and mobile.
- [x] Full router integration in `main.jsx` with `AuthProvider`.
- [x] Build validation: `npm run build` completed cleanly without errors.

---

## Phase 3: Python Execution, Admin, Security, Docs, Testing ✓

### 1. Python Code Editor (Frontend)
- [x] `frontend/src/components/code/PythonEditor.jsx`: Full-featured in-browser code editor with line numbers, code snippets dropdown (Feature Engineering, Missing Data, Model, Plot), dataset binding dropdown, execution status pill, duration timer, copy script button, stop/run actions.
- [x] Multi-tab output console: Standard Output terminal with syntax highlighting, traceback / error viewer, Matplotlib plot gallery (auto-rendered base64 PNGs), and transformed dataset table view.
- [x] Execution history modal: Lists previous code runs with timestamps, status, duration, and 1-click reload into editor.
- [x] `frontend/src/pages/dashboard/CodeEditorView.jsx`: Standalone Python Studio integrated into the app dashboard navigation (`/app/code`).

### 2. Isolated Execution Sandbox (Backend - TOP PRIORITY)
- [x] `docker/Dockerfile.worker`: Hardened Docker worker container with non-root user `flowml:1000`, `--network none`, `--read-only` root fs, 64MB memory tmpfs `/tmp`, 256MB memory limit, 1.0 CPU quota, and 64 PIDs limit.
- [x] `backend/services/sandbox_runner.py`: Dedicated standalone sandbox script executing in an isolated process/container; captures stdout, stderr, execution duration, tracebacks, matplotlib figures as base64 PNGs, and transformed DataFrames.
- [x] `backend/services/code_executor.py`: AST static verification blocking forbidden modules (`socket`, `requests`, `urllib`, `subprocess`, host secret reads) + SubprocessSandboxRunner fallback with stripped environment, per-run sandbox directory, active memory watchdog (>256MB kill), and watchdog timeout.
- [x] Endpoints: `POST /api/code/run`, `POST /api/code/runs/{run_id}/stop`, `GET /api/code/history`.
- [x] `customPython` DAG Node:
  - Registered in `backend/services/pipeline_executor.py` (`NODE_OUTPUT_TYPE`, `REQUIRES_DATAFRAME`, `DATAFRAME_PRODUCERS`, `PROCESS_TYPES`).
  - Studio integration: Custom node palette item in `Sidebar.jsx`, visual node in `CustomNodes.jsx`, and parameter inspector with starter snippets & test runner in `PipelinePanel.jsx`.

### 3. Admin & Governance
- [x] Admin Role Check (`backend/auth.py`): Verifies `admin: true` custom claim or `ADMIN_UIDS` env var. Blocks deactivated users with 403 Forbidden.
- [x] Admin endpoints (`backend/routes/admin.py`):
  - `GET /api/admin/users`: List users, registration date, dataset/model count, active/inactive status.
  - `POST /api/admin/users/{uid}/status`: Activate or deactivate user accounts.
  - `GET /api/admin/jobs`: Running, queued, completed, and failed jobs across all users.
  - `GET /api/admin/system`: Real-time CPU, RAM, and disk storage metrics.
  - `GET/POST /api/admin/limits`: Configurable quotas (timeout, memory, max upload MB, user dataset quota).
  - `GET /api/admin/audit-logs`: Security events and audit trail (`storage/audit_events.jsonl`).
- [x] Admin UI (`frontend/src/pages/dashboard/AdminView.jsx`): Security operations dashboard with metrics gauges, user management table, running jobs monitor, limits configuration form, and audit log viewer. Accessible via sidebar at `/app/admin`.

### 4. Security Hardening
- [x] File upload size validation (`MAX_UPLOAD_SIZE_MB`, returns 413 Payload Too Large).
- [x] Rate limiting service (`backend/services/rate_limiter.py`, sliding window, returns 429 Too Many Requests).
- [x] Audit logger (`backend/services/audit.py`, records auth, deactivation, and security alerts).
- [x] Global secure exception handler (`backend/app.py`, suppresses internal stack traces in client responses).
- [x] Account and data deletion endpoint (`DELETE /api/account` and `DELETE /api/account/data` in `backend/routes/account.py`, wipes all user-scoped storage).

### 5. Docs and Interactive Learning
- [x] In-app documentation (`/docs` in `frontend/src/pages/info/InfoPages.jsx`):
  - Complete directory for all 14 visual DAG nodes (inputs, outputs, parameters, when to use).
  - Mathematical metrics glossary (Accuracy, Precision, Recall, F1, ROC-AUC, R², MSE, RMSE, MAE, Silhouette, Inertia).
  - Execution sandbox limits (CPU 1.0, 256MB RAM, 15-60s timeout, read-only root, no network).
  - Supported Python libraries (`numpy`, `pandas`, `scikit-learn`, `matplotlib`, standard library).
  - Security and architecture FAQs.
- [x] Interactive tutorials (`/tutorials` in `frontend/src/pages/info/InfoPages.jsx`):
  - 2 sample datasets (`titanic.csv` for classification and `housing.csv` for regression) in `frontend/public/samples/` with 1-click download & Studio load.
  - 4-step visual modeling walkthrough framework.
  - 3 tested Python starter snippets with 1-click "Copy Script" and "Open in Studio" integration.

### 6. Testing & Quality Assurance
- [x] 60/60 tests passing across all test suites:
  - `test_code_execution.py`: AST static verification, timeout enforcement, memory limit enforcement, stdout capture, plot capture, customPython DAG node.
  - `test_isolation.py`: Subprocess/Docker isolation, environment sanitization, sandbox temp isolation.
  - `test_security.py`: File size 413 limit, rate limiting 429, secure error masking, GDPR account & data wipe.
  - `test_admin.py`: Role guard, user management, metrics, limit updates, audit log queries.
  - `test_multi_user.py`: 3 and 5 simulated concurrent users with dataset privacy, account isolation, failing code, and crash recovery.
  - `test_executor.py`, `test_queue.py`, `test_nodes.py`: Core DAG pipeline and worker queue.
- [x] Production frontend build: `npm run build` completed cleanly without errors.

