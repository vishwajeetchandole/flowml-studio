import os
from collections import deque
from utils.logger import log_event

# ─────────────────────────────────────────────────────────────────────────────
# Node type groupings
# ─────────────────────────────────────────────────────────────────────────────
UPLOAD_TYPES  = {"upload", "loadCsv"}
PREVIEW_TYPES = {"preview"}
PROCESS_TYPES = {"fillMissing", "encode", "scale"}
MODEL_TYPES   = {"randomForest", "linearRegression", "decisionTree", "aiDecision"}
OUTPUT_TYPES  = {"prediction", "report"}


def _topological_sort(nodes: list, edges: list) -> list:
    """Kahn's algorithm — returns node IDs in execution order."""
    node_ids  = [n["id"] for n in nodes]
    adj       = {nid: [] for nid in node_ids}
    in_degree = {nid: 0 for nid in node_ids}

    for edge in edges:
        src = edge.get("source")
        tgt = edge.get("target")
        if src in adj and tgt in in_degree:
            adj[src].append(tgt)
            in_degree[tgt] += 1

    queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
    order = []
    while queue:
        nid = queue.popleft()
        order.append(nid)
        for neighbor in adj[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return order


def _get_preprocess_config(node_type: str, node_data: dict) -> dict:
    """Map visual node type + data to a backend preprocessing config."""
    cfg = node_data.get("config", {})
    if node_type == "fillMissing":
        return {
            "missing_values": cfg.get("missing_values", "mean"),
            "categorical_encoding": "label",
            "scaling": "none",
        }
    if node_type == "encode":
        return {
            "missing_values": "mean",
            "categorical_encoding": cfg.get("categorical_encoding", "label"),
            "scaling": "none",
        }
    if node_type == "scale":
        return {
            "missing_values": "mean",
            "categorical_encoding": "label",
            "scaling": cfg.get("scaling", "standard"),
        }
    return {"missing_values": "mean", "categorical_encoding": "label", "scaling": "none"}


def execute_pipeline(workflow_data: dict) -> dict:
    """
    Execute a visual ML pipeline from its nodes + edges.

    The pipeline DAG is topologically sorted and each node is executed in order.
    State (the current DataFrame, target column, etc.) is passed via a shared
    *context* dict between nodes.
    """
    # Lazy imports inside function to avoid circular dependency at module load
    from services.data_loader import load_dataset
    from services.data_analyzer import analyze_dataset
    from services.preprocessing import preprocess_data
    from services.model_trainer import train_models
    from services.predictor import predict

    log_event("Starting visual pipeline execution…")

    nodes = workflow_data.get("nodes", [])
    edges = workflow_data.get("edges", [])

    if not nodes:
        return {"status": "error", "message": "No nodes in pipeline.", "results": []}

    node_map = {n["id"]: n for n in nodes}
    execution_order = _topological_sort(nodes, edges)

    if len(execution_order) != len(nodes):
        log_event("Pipeline contains a cycle — cannot execute.", level="ERROR")
        return {"status": "error", "message": "Pipeline has a cycle.", "results": []}

    # Shared context flowing between nodes
    ctx = {
        "df":           None,
        "file_name":    None,
        "target_column": None,
        "task_type":    "classification",
        "train_results": None,
        "predictions":   None,
    }

    results = []

    for node_id in execution_order:
        node      = node_map.get(node_id)
        if not node:
            continue

        node_type = node.get("type", "unknown")
        node_data = node.get("data", {})

        log_event(f"▶ Node [{node_type}] ({node_id})")

        try:
            # ── Upload / Load CSV ─────────────────────────────────────────────
            if node_type in UPLOAD_TYPES:
                dataset_info = node_data.get("uploadedDataset", {})
                file_name = dataset_info.get("file_name")
                if not file_name:
                    raise ValueError("No file uploaded. Configure this Upload node first.")
                file_path = os.path.join("uploads", file_name)
                ctx["df"] = load_dataset(file_path)
                ctx["file_name"] = file_name
                results.append({
                    "node_id": node_id, "type": node_type, "status": "completed",
                    "message": f"Loaded {ctx['df'].shape[0]:,} rows × {ctx['df'].shape[1]} cols",
                })

            # ── Preview / Analyze ─────────────────────────────────────────────
            elif node_type in PREVIEW_TYPES:
                if ctx["df"] is None:
                    raise ValueError("No dataset in context. Add an Upload node before Preview.")
                insights = analyze_dataset(ctx["df"])
                results.append({
                    "node_id": node_id, "type": node_type, "status": "completed",
                    "message": (
                        f"Analyzed. {insights['row_count']:,} rows, {insights['col_count']} cols. "
                        f"Suggested target: '{insights['suggested_target']}'"
                    ),
                })

            # ── Preprocessing ─────────────────────────────────────────────────
            elif node_type in PROCESS_TYPES:
                if ctx["df"] is None:
                    raise ValueError("No dataset in context. Add an Upload node before Preprocessing.")
                config = _get_preprocess_config(node_type, node_data)
                if ctx["target_column"]:
                    config["target_column"] = ctx["target_column"]
                ctx["df"] = preprocess_data(ctx["df"], config)
                results.append({
                    "node_id": node_id, "type": node_type, "status": "completed",
                    "message": f"Preprocessing done. Output shape: {ctx['df'].shape}",
                })

            # ── Model Training ────────────────────────────────────────────────
            elif node_type in MODEL_TYPES:
                if ctx["df"] is None:
                    raise ValueError("No dataset in context. Add an Upload node before Training.")
                target_col = node_data.get("target_column") or ctx.get("target_column")
                if not target_col or target_col not in ctx["df"].columns:
                    raise ValueError(
                        f"Target column '{target_col}' not found. "
                        "Set it in the Model node configuration."
                    )
                task_type = node_data.get("task_type", "classification")
                ctx["target_column"] = target_col
                ctx["task_type"]     = task_type

                X = ctx["df"].drop(columns=[target_col])
                y = ctx["df"][target_col]
                ctx["train_results"] = train_models(X, y, task_type)
                best = ctx["train_results"]["best_model"]
                results.append({
                    "node_id": node_id, "type": node_type, "status": "completed",
                    "message": f"Training complete. Best: {best}",
                })

            # ── Output / Prediction ───────────────────────────────────────────
            elif node_type in OUTPUT_TYPES:
                if ctx["df"] is None:
                    raise ValueError("No dataset in context.")
                pred_result = predict(ctx["df"], target_column=ctx.get("target_column"))
                ctx["predictions"] = pred_result["predictions"]
                results.append({
                    "node_id": node_id, "type": node_type, "status": "completed",
                    "message": f"Generated {len(ctx['predictions']):,} predictions.",
                })

            else:
                results.append({
                    "node_id": node_id, "type": node_type, "status": "skipped",
                    "message": f"Node type '{node_type}' is not yet wired into the pipeline.",
                })

        except Exception as exc:
            log_event(f"Node {node_id} ({node_type}) error: {exc}", level="ERROR")
            results.append({
                "node_id": node_id, "type": node_type, "status": "error",
                "message": str(exc),
            })
            break  # Halt on first error

    overall = "error" if any(r["status"] == "error" for r in results) else "success"
    log_event(f"Pipeline finished — status: {overall}")
    return {"status": overall, "results": results}
