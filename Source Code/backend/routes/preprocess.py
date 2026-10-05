import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict, Optional
from services.data_loader import load_dataset
from services.preprocessing import preprocess_data
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()


class PreprocessRequest(BaseModel):
    file_name: str
    config: Dict[str, Any]
    target_column: Optional[str] = None  # Excluded from scaling


@router.post("/preprocess")
async def preprocess(request: PreprocessRequest):
    """
    Preprocess the uploaded dataset.

    The preprocessed result is saved as ``processed_<file_name>`` under uploads/.
    Fitted transformer objects are saved to models/saved_models/ so they can be
    reapplied consistently at prediction time.
    """
    file_path = os.path.join("uploads", request.file_name)
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found", f"No upload found: {request.file_name}")

    try:
        df = load_dataset(file_path)

        # Merge target_column into config so scaler skips it
        config = dict(request.config)
        if request.target_column:
            config["target_column"] = request.target_column

        processed_df = preprocess_data(df, config, save_preprocessors=True)

        # Persist processed dataset
        processed_name = f"processed_{request.file_name}"
        processed_path = os.path.join("uploads", processed_name)
        if request.file_name.lower().endswith(".csv"):
            processed_df.to_csv(processed_path, index=False)
        else:
            processed_df.to_excel(processed_path, index=False)

        log_event(f"Processed file saved → {processed_path}")
        return {
            "message": "Data preprocessed successfully.",
            "processed_file": processed_name,
            "rows": int(processed_df.shape[0]),
            "columns": int(processed_df.shape[1]),
            "column_names": processed_df.columns.tolist(),
        }

    except Exception as exc:
        log_event(f"Preprocessing error: {exc}", level="ERROR")
        raise_http_exception(500, "Error preprocessing dataset", str(exc))
