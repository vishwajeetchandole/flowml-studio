import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.data_loader import load_dataset
from services.predictor import predict
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()


class PredictRequest(BaseModel):
    file_name: str
    target_column: Optional[str] = None  # Dropped server-side before inference


@router.post("/predict")
async def generate_predictions(request: PredictRequest):
    """
    Run inference on the provided file using the last-trained model.

    ``target_column`` is removed before prediction so training data can be used
    for demonstration, or a fresh inference file (without the target) can be
    supplied instead.
    """
    file_path = os.path.join("uploads", request.file_name)
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found", f"No upload found: {request.file_name}")

    try:
        df = load_dataset(file_path)
        result = predict(df, target_column=request.target_column)
        return result
    except FileNotFoundError as exc:
        raise_http_exception(404, "Model not found", str(exc))
    except Exception as exc:
        log_event(f"Prediction error: {exc}", level="ERROR")
        raise_http_exception(500, "Error running predictions", str(exc))
