import os
import pandas as pd
from utils.logger import log_event

def load_dataset(file_path: str) -> pd.DataFrame:
    """Loads a dataset from CSV or Excel."""
    log_event(f"Loading dataset from {file_path}")
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file_path.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format. Only CSV and Excel are supported.")
    return df

def get_dataset_metadata(df: pd.DataFrame, file_name: str) -> dict:
    """Returns basic metadata for a given dataframe."""
    return {
        "file_name": file_name,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.tolist()
    }
