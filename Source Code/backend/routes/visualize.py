import os
import joblib
from fastapi import APIRouter
from fastapi.responses import FileResponse
from services.data_loader import load_dataset
from services.visualization import (
    generate_correlation_heatmap,
    generate_distribution_plots,
    generate_feature_importance,
    generate_confusion_matrix,
)
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()
SAVE_DIR = "models/saved_models"


@router.get("/visualizations")
async def get_visualizations(file_name: str):
    """
    Return all available charts for the given dataset.

    Dataset charts (always attempted):
      • Correlation heatmap
      • Feature distribution histograms

    Model charts (generated if a trained model exists):
      • Feature importance  (tree models: native; linear models: |coef|; others: permutation)
      • Confusion matrix    (classification only)
    """
    file_path = os.path.join("uploads", file_name)
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found", f"No upload found: {file_name}")

    try:
        df = load_dataset(file_path)
        charts: dict = {}

        # ── Dataset charts ────────────────────────────────────────────────────
        heatmap = generate_correlation_heatmap(df)
        if heatmap:
            charts["correlation_heatmap"] = f"data:image/png;base64,{heatmap}"

        dist = generate_distribution_plots(df)
        if dist:
            charts["distributions"] = f"data:image/png;base64,{dist}"

        # ── Model charts (only if model is trained) ───────────────────────────
        model_path    = os.path.join(SAVE_DIR, "best_model.joblib")
        features_path = os.path.join(SAVE_DIR, "features.joblib")

        if os.path.exists(model_path) and os.path.exists(features_path):
            model    = joblib.load(model_path)
            features = joblib.load(features_path)

            fi = generate_feature_importance(model, features)
            if fi:
                charts["feature_importance"] = f"data:image/png;base64,{fi}"

            # Confusion matrix — classification only
            test_path      = os.path.join(SAVE_DIR, "test_data.joblib")
            task_type_path = os.path.join(SAVE_DIR, "task_type.joblib")
            if os.path.exists(test_path) and os.path.exists(task_type_path):
                task_type = joblib.load(task_type_path)
                if task_type == "classification":
                    X_test, y_test = joblib.load(test_path)
                    cm = generate_confusion_matrix(model, X_test, y_test)
                    if cm:
                        charts["confusion_matrix"] = f"data:image/png;base64,{cm}"

        return charts

    except Exception as exc:
        log_event(f"Visualization error: {exc}", level="ERROR")
        raise_http_exception(500, "Error generating visualizations", str(exc))


@router.get("/download-model")
async def download_model():
    """Download the best trained model as a joblib file."""
    model_path = os.path.join(SAVE_DIR, "best_model.joblib")
    if not os.path.exists(model_path):
        raise_http_exception(404, "Model not found", "No trained model is available. Train a model first.")
    return FileResponse(
        path=model_path,
        filename="best_model.joblib",
        media_type="application/octet-stream",
    )
