import uuid
import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File

from auth import get_current_user
from services.store import StoreBackend, get_store
from services.data_loader import load_dataset, get_dataset_metadata
from utils.helpers import allowed_file, raise_http_exception
from utils.logger import log_event

router = APIRouter()


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    uid: str = Depends(get_current_user),
    store: StoreBackend = Depends(get_store),
):
    """
    Upload a CSV or Excel file.
    Returns dataset_id + schema metadata.
    """
    if not allowed_file(file.filename):
        log_event(f"[{uid}] Rejected upload: {file.filename}", level="ERROR")
        raise_http_exception(400, "Invalid file format", "Only CSV (.csv) and Excel (.xls/.xlsx) files are allowed.")

    # Write to a temp file first, then hand off to store
    ext = file.filename.rsplit(".", 1)[-1].lower()
    safe_base = file.filename.rsplit(".", 1)[0].replace(" ", "_")
    original_name = f"{safe_base}.{ext}"

    with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        df = load_dataset(tmp_path)
        metadata = get_dataset_metadata(df, original_name)

        dataset_id = uuid.uuid4().hex
        # Rename temp file to original name so store preserves it
        import os, pathlib
        named_tmp = pathlib.Path(tmp_path).parent / original_name
        os.rename(tmp_path, named_tmp)

        store.save_dataset(uid, dataset_id, str(named_tmp))
        os.unlink(named_tmp)

        store.update_dataset_meta(uid, dataset_id, {
            "dataset_id": dataset_id,
            "original_name": original_name,
            "rows": metadata["rows"],
            "columns": metadata["columns"],
            "column_names": metadata["column_names"],
        })
        log_event(f"[{uid}] Upload OK → dataset_id={dataset_id}")
        return {**metadata, "dataset_id": dataset_id, "file_name": original_name}

    except Exception as exc:
        import os as _os
        for p in [tmp_path]:
            try:
                _os.unlink(p)
            except Exception:
                pass
        log_event(f"[{uid}] Upload error: {exc}", level="ERROR")
        raise_http_exception(500, "File processing error", str(exc))
