import os
import joblib
import pandas as pd
from utils.logger import log_event

def predict(df: pd.DataFrame, model_path: str = "models/saved_models/best_model.joblib") -> list:
    """Loads a model and generates predictions for the given dataframe."""
    log_event("Starting prediction process.")
    
    if not os.path.exists(model_path):
        log_event("Model file not found.", level="ERROR")
        raise FileNotFoundError(f"No trained model found at {model_path}")
        
    model = joblib.load(model_path)
    log_event(f"Model loaded from {model_path}")
    
    predictions = model.predict(df)
    log_event("Prediction completed.")
    
    return predictions.tolist()
