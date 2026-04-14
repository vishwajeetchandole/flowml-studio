import os
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from services.data_loader import load_dataset
from services.model_trainer import train_models
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()

class TrainRequest(BaseModel):
    file_name: str
    target_column: str
    task_type: str = "classification" # or 'regression'

def training_task(file_name: str, target_column: str, task_type: str):
    try:
        file_path = os.path.join("uploads", file_name)
        df = load_dataset(file_path)
        
        if target_column not in df.columns:
            log_event(f"Target column '{target_column}' not found.", level="ERROR")
            return
            
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        results = train_models(X, y, task_type)
        log_event(f"Training task finished successfully. Best model: {results['best_model']}")
        # In a generic implementation, results could be saved to a database or file
        
    except Exception as e:
        log_event(f"Training background task failed: {str(e)}", level="ERROR")

@router.post("/train")
async def train(request: TrainRequest, background_tasks: BackgroundTasks):
    file_path = os.path.join("uploads", request.file_name)
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found")
        
    # Validating eagerly before background execution
    try:
         df = load_dataset(file_path)
         if request.target_column not in df.columns:
             raise_http_exception(400, "Invalid Target", f"Column '{request.target_column}' is not in dataset.")
    except Exception as e:
         raise_http_exception(500, "Verification Error", str(e))
         
    # We could either return the result directly or run in background depending on data size
    # Since the request spec asks for response `{models: [...], best_model: ...}`,
    # it implies synchronous by default, but we can also demonstrate sync for smaller datasets.
    
    # For now, let's run synchronously to match the required response structure:
    try:
        X = df.drop(columns=[request.target_column])
        y = df[request.target_column]
        results = train_models(X, y, request.task_type)
        return results
    except Exception as e:
        log_event(f"Training error: {str(e)}", level="ERROR")
        raise_http_exception(500, "Error training models", str(e))
