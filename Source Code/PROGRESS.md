# FlowML Phase 1 Progress

## Task Group 1: Auth and Storage Layer ?
- [x] 1.1 `backend/auth.py` - get_current_user (Firebase verify + DEV_AUTH bypass)
      Files: backend/auth.py
- [x] 1.2 `backend/services/store.py` - StoreBackend interface + LocalDiskStore (per-uid paths, path-traversal guard)
      Files: backend/services/store.py
- [x] 1.3 Rewrite `routes/upload.py` - uses uid, store.py, returns dataset_id
      Files: backend/routes/upload.py
- [x] 1.4 Rewrite `routes/analyze.py` - uid-scoped dataset lookup
      Files: backend/routes/analyze.py
- [x] 1.5 Rewrite `routes/preprocess.py` - per-uid datasets + preprocessors artifacts
      Files: backend/routes/preprocess.py
- [x] 1.6 Rewrite `routes/train.py` - per-uid model_id, artifacts via store.py, Windows-safe temp handling
      Files: backend/routes/train.py
- [x] 1.7 Rewrite `routes/predict.py` - predict_with_store() resolves both dataset and model by uid
      Files: backend/routes/predict.py, backend/services/predictor.py
- [x] 1.8 Rewrite `routes/visualize.py` - per-uid artifact resolution; added actual_vs_predicted + model_comparison
      Files: backend/routes/visualize.py, backend/services/visualization.py
- [x] 1.9 Update `app.py` - removed global ensure_dir calls; registered runs router
      Files: backend/app.py

## Task Group 2: Executor Rebuild ?
- [x] 2.1 pipeline_executor.py - graph validation (cycles, missing inputs, type checks, missing params)
- [x] 2.2 Executor per-node status: Pending/Running/Completed/Failed + stop support (cancel_flag)
- [x] 2.3 Node output caching by SHA-256 hash(params + upstream hashes); rerun only changed nodes
- [x] 2.4 Per-run logs/metrics written to store via append_run_log/save_run_result
      Files: backend/services/pipeline_executor.py

## Task Group 3: Job Queue ?
- [x] 3.1 `backend/services/job_queue.py` - InProcessQueue with Queued/Running/Completed/Failed/Stopped states
- [x] 3.2 Per-user concurrency limits (MAX_CONCURRENT_PER_USER, MAX_QUEUED_PER_USER env vars, defaults 1+3)
- [x] 3.3 `routes/runs.py` - POST /api/runs (202), GET /api/runs, GET /api/runs/{id}, POST /api/runs/{id}/stop
      Files: backend/services/job_queue.py, backend/routes/runs.py

## Task Group 4: ML Completeness ?
- [x] 4.1 New data nodes: removeDuplicates, selectColumns, splitData (ratio, seed, stratify) in executor
- [x] 4.2 New model nodes: knn, svm (already in zoo); kmeans (+ silhouette score); aiDecision
- [x] 4.3 Visualizations: actual_vs_predicted plot + model_comparison chart added
- [x] 4.4 `aiDecision` node - recommends models from profiler output and trains top zoo
- [x] 4.5 `explainableAi` node - permutation importance + top-10 feature list
- [x] 4.6 `report` node - HTML summary (data shape, model leaderboard, prediction count)
      Files: backend/services/pipeline_executor.py, backend/services/visualization.py, backend/services/model_trainer.py

## Task Group 5: Tests ?
- [x] 5.1 `tests/test_isolation.py` - user A 403/404 on user B resources; path traversal blocked
- [x] 5.2 `tests/test_executor.py` - validation errors, caching, stop (flag + queue)
- [x] 5.3 `tests/test_queue.py` - queue limits, failed/stop/403/404/400 states
- [x] 5.4 `tests/test_nodes.py` - removeDuplicates, selectColumns, splitData, kmeans, aiDecision, explainableAi, report
- [x] 5.5 All 42 tests pass: `pytest backend/tests/ -v` ? 42 passed in 12.50s
      Files: backend/tests/conftest.py, test_isolation.py, test_executor.py, test_queue.py, test_nodes.py

---
_Phase 1 COMPLETE. 42/42 tests pass. Ready for Phase 2._
