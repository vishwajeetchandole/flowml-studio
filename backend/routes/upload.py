import os
import shutil
from fastapi import APIRouter, UploadFile, File
from utils.helpers import allowed_file, raise_http_exception
from services.data_loader import load_dataset, get_dataset_metadata
from utils.logger import log_event

router = APIRouter()
UPLOAD_DIR = "uploads"

# Ensure uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        log_event(f"Invalid file upload attempt: {file.filename}", level="ERROR")
        raise_http_exception(400, "Invalid file format", "Only CSV and Excel files are allowed.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        log_event(f"File uploaded successfully: {file.filename}")
        
        df = load_dataset(file_path)
        metadata = get_dataset_metadata(df, file.filename)
        
        return metadata
    except Exception as e:
        log_event(f"Error saving/reading file: {str(e)}", level="ERROR")
        raise_http_exception(500, "File processing error", str(e))
