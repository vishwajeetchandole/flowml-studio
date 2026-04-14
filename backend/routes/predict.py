import os
from fastapi import APIRouter
from pydantic import BaseModel
from services.data_loader import load_dataset
from services.predictor import predict
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()

class PredictRequest(BaseModel):
    file_name: str

@router.post("/predict")
async def generate_predictions(request: PredictRequest):
    file_path = os.path.join("uploads", request.file_name)
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found")
        
    try:
        df = load_dataset(file_path)
        predictions = predict(df)
        
        return {
            "predictions": predictions
        }
    except Exception as e:
        log_event(f"Prediction error: {str(e)}", level="ERROR")
        raise_http_exception(500, "Error running predictions", str(e))
