import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File
from utils.helpers import allowed_file, raise_http_exception
from services.data_loader import load_dataset, get_dataset_metadata
from utils.logger import log_event

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Upload a CSV or Excel file.

    A UUID prefix is added to the filename to prevent collisions when
    the same filename is uploaded multiple times.
    """
    if not allowed_file(file.filename):
        log_event(f"Rejected upload: {file.filename}", level="ERROR")
        raise_http_exception(400, "Invalid file format", "Only CSV (.csv) and Excel (.xls/.xlsx) files are allowed.")

    # Build a collision-safe filename
    ext = file.filename.rsplit(".", 1)[-1].lower()
    safe_base = file.filename.rsplit(".", 1)[0].replace(" ", "_")
    unique_name = f"{uuid.uuid4().hex[:8]}_{safe_base}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        log_event(f"File saved as: {unique_name}")
        df = load_dataset(file_path)
        metadata = get_dataset_metadata(df, unique_name)
        return metadata

    except Exception as exc:
        log_event(f"Upload/read error: {exc}", level="ERROR")
        # Clean up partial upload
        if os.path.exists(file_path):
            os.remove(file_path)
        raise_http_exception(500, "File processing error", str(exc))
