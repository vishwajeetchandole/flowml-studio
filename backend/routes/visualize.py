import os
from fastapi import APIRouter
from pydantic import BaseModel
from services.data_loader import load_dataset
from services.visualization import generate_correlation_heatmap
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()

@router.get("/visualizations")
async def get_visualizations(file_name: str):
    file_path = os.path.join("uploads", file_name)
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found")
        
    try:
        df = load_dataset(file_path)
        heatmap_base64 = generate_correlation_heatmap(df)
        
        # Add more charts as needed and return in a dict
        return {
            "correlation_heatmap": f"data:image/png;base64,{heatmap_base64}"
        }
    except Exception as e:
        log_event(f"Visualization error: {str(e)}", level="ERROR")
        raise_http_exception(500, "Error generating visualizations", str(e))

@router.get("/download-model")
async def download_model():
    model_path = os.path.join("models", "saved_models", "best_model.joblib")
    if not os.path.exists(model_path):
        raise_http_exception(404, "Model not found", "No trained model is available for download.")
        
    from fastapi.responses import FileResponse
    return FileResponse(path=model_path, filename="best_model.joblib", media_type="application/octet-stream")
