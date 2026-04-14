from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from services.pipeline_executor import execute_pipeline
from utils.helpers import raise_http_exception
from utils.logger import log_event

router = APIRouter()

class PipelineRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    workflow: Dict[str, Any] = None

@router.post("/pipeline")
async def run_pipeline(request: PipelineRequest):
    try:
        results = execute_pipeline(request.dict())
        return results
    except Exception as e:
        log_event(f"Pipeline execution error: {str(e)}", level="ERROR")
        raise_http_exception(500, "Error running pipeline", str(e))
