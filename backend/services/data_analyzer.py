import pandas as pd
from utils.logger import log_event

def analyze_dataset(df: pd.DataFrame) -> dict:
    """Analyzes the dataframe and returns insights."""
    log_event("Analyzing dataset...")
    
    # Missing values
    missing_values = df.isnull().sum().to_dict()
    
    # Column types
    column_types = {col: str(dtype) for col, dtype in df.dtypes.items()}
    
    # Categorical vs Numeric
    numeric_columns = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_columns = df.select_dtypes(include=['object', 'category', 'bool']).columns.tolist()
    
    # Suggested target (very basic heuristic: last column, or looking for 'target', 'label', 'class')
    suggested_target = None
    lower_cols = [c.lower() for c in df.columns]
    for candidate in ['target', 'label', 'class', 'y']:
        if candidate in lower_cols:
            idx = lower_cols.index(candidate)
            suggested_target = df.columns[idx]
            break
    
    if not suggested_target and len(df.columns) > 0:
        suggested_target = df.columns[-1]
        
    log_event("Dataset analysis completed.")
    return {
        "column_types": column_types,
        "missing_values": missing_values,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "suggested_target": suggested_target
    }
