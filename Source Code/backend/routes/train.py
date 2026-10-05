import os
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.data_loader import load_dataset
from services.model_trainer import train_models
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()


class TrainRequest(BaseModel):
    file_name: str
    processed_file_name: Optional[str] = None   # Use preprocessed file when available
    target_column: str
    task_type: str = "classification"           # "classification" | "regression"


@router.post("/train")
async def train(request: TrainRequest):
    """
    Train multiple ML models on the uploaded (or preprocessed) dataset.

    Priority: preprocessed file → raw uploaded file.
    Training runs in a thread-pool executor so the async event loop is never blocked,
    allowing log-streaming (SSE) and health-check endpoints to remain responsive
    during potentially long training runs.
    """
    # Resolve which file to train on
    candidate_names = [request.processed_file_name, request.file_name]
    file_path: Optional[str] = None
    for name in candidate_names:
        if name:
            p = os.path.join("uploads", name)
            if os.path.exists(p):
                file_path = p
                log_event(f"Training on file: {name}")
                break

    if file_path is None:
        raise_http_exception(404, "File not found", "Neither the processed nor the raw dataset file could be located.")

    try:
        df = load_dataset(file_path)
    except Exception as exc:
        raise_http_exception(500, "Could not load dataset", str(exc))

    if request.target_column not in df.columns:
        raise_http_exception(
            400, "Invalid target column",
            f"Column '{request.target_column}' does not exist in the dataset. "
            f"Available columns: {df.columns.tolist()}"
        )

    X = df.drop(columns=[request.target_column])
    y = df[request.target_column]

    try:
        # Run blocking training in a thread-pool so the event loop stays free
        loop = asyncio.get_running_loop()
        results = await loop.run_in_executor(
            None,
            lambda: train_models(X, y, request.task_type)
        )
        return results

    except Exception as exc:
        log_event(f"Training error: {exc}", level="ERROR")
        raise_http_exception(500, "Error training models", str(exc))
