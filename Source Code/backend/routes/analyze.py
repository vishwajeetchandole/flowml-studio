import os
from fastapi import APIRouter
from pydantic import BaseModel
from services.data_loader import load_dataset
from services.data_analyzer import analyze_dataset
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()

class AnalyzeRequest(BaseModel):
    file_name: str

@router.post("/analyze")
async def analyze_data(request: AnalyzeRequest):
    file_path = os.path.join("uploads", request.file_name)
    
    if not os.path.exists(file_path):
        log_event(f"Analyze request failed: {request.file_name} not found.", level="ERROR")
        raise_http_exception(404, "File not found", "The specified dataset could not be found.")
        
    try:
        df = load_dataset(file_path)
        insights = analyze_dataset(df)
        return insights
    except Exception as e:
        log_event(f"Analysis error: {str(e)}", level="ERROR")
        raise_http_exception(500, "Error analyzing dataset", str(e))
