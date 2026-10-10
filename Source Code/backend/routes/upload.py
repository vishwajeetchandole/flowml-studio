import os
import uuid
import shutil
import tempfile
import pathlib
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

    max_size_bytes = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50")) * 1024 * 1024
    if os.path.getsize(tmp_path) > max_size_bytes:
        os.unlink(tmp_path)
        log_event(f"[{uid}] Rejected upload due to size limit: {file.filename}", level="ERROR")
        raise_http_exception(413, "File Too Large", f"File exceeds maximum allowed size of {max_size_bytes // (1024*1024)}MB.")

    try:
        df = load_dataset(tmp_path)
        metadata = get_dataset_metadata(df, original_name)

        dataset_id = uuid.uuid4().hex
        # Rename temp file to original name so store preserves it
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


@router.get("/datasets")
async def list_user_datasets(
    uid: str = Depends(get_current_user),
    store: StoreBackend = Depends(get_store),
):
    """List all uploaded datasets for the current user."""
    return store.list_datasets(uid)


@router.get("/datasets/{dataset_id}/preview")
async def get_dataset_preview(
    dataset_id: str,
    uid: str = Depends(get_current_user),
    store: StoreBackend = Depends(get_store),
):
    """Get preview rows, column schemas, missing count, and duplicate count."""
    file_path = store.get_dataset_path(uid, dataset_id)
    df = load_dataset(file_path)
    
    meta = store.get_dataset_meta(uid, dataset_id)
    missing_counts = {col: int(cnt) for col, cnt in df.isnull().sum().to_dict().items()}
    total_missing = int(df.isnull().sum().sum())
    duplicate_count = int(df.duplicated().sum())

    # Generate head 15 rows
    head_df = df.head(15).replace({float("nan"): None})
    records = head_df.to_dict(orient="records")

    columns_info = []
    for col in df.columns:
        columns_info.append({
            "name": col,
            "type": str(df[col].dtype),
            "missing": missing_counts.get(col, 0),
            "unique": int(df[col].nunique()),
        })

    return {
        "dataset_id": dataset_id,
        "name": meta.get("original_name") or meta.get("file", dataset_id),
        "rows": len(df),
        "columns": len(df.columns),
        "total_missing": total_missing,
        "duplicate_count": duplicate_count,
        "columns_info": columns_info,
        "preview_rows": records,
    }


@router.delete("/datasets/{dataset_id}")
async def delete_user_dataset(
    dataset_id: str,
    uid: str = Depends(get_current_user),
    store: StoreBackend = Depends(get_store),
):
    """Delete a dataset owned by current user."""
    store.delete_dataset(uid, dataset_id)
    return {"status": "deleted", "dataset_id": dataset_id}

