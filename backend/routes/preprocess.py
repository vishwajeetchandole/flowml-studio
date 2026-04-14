import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from services.data_loader import load_dataset
from services.preprocessing import preprocess_data
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()

class PreprocessRequest(BaseModel):
    file_name: str
    config: Dict[str, Any]

@router.post("/preprocess")
async def preprocess(request: PreprocessRequest):
    file_path = os.path.join("uploads", request.file_name)
    
    if not os.path.exists(file_path):
        raise_http_exception(404, "File not found")
        
    try:
        df = load_dataset(file_path)
        processed_df = preprocess_data(df, request.config)
        
        # Save processed data for downstream tasks
        processed_file_path = os.path.join("uploads", f"processed_{request.file_name}")
        if request.file_name.endswith('.csv'):
             processed_df.to_csv(processed_file_path, index=False)
        else:
             processed_df.to_excel(processed_file_path, index=False)
             
        log_event(f"Processed dataset saved to {processed_file_path}")
        
        return {
            "message": "Data preprocessed successfully",
            "processed_file": f"processed_{request.file_name}",
            "rows": processed_df.shape[0],
            "columns": processed_df.shape[1]
        }
    except Exception as e:
        log_event(f"Preprocessing error: {str(e)}", level="ERROR")
        raise_http_exception(500, "Error preprocessing dataset", str(e))
