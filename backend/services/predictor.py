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
    features_path = os.path.join(os.path.dirname(model_path), "features.joblib")
    if os.path.exists(features_path):
        features = joblib.load(features_path)
        # Drop columns not in features (like target_column)
        df_pred = df[[col for col in features if col in df.columns]].copy()
        
        # Add missing columns requested by model initialized to 0
        for col in features:
            if col not in df_pred.columns:
                df_pred[col] = 0
                
        # Re-order columns to exact feature order
        df_pred = df_pred[features]
    else:
        df_pred = df.copy()

    # Apply identical fallback preprocessing to X so prediction doesn't crash on strings
    from sklearn.preprocessing import LabelEncoder
    cat_cols = df_pred.select_dtypes(include=['object', 'category', 'string']).columns
    for col in cat_cols:
        df_pred[col] = LabelEncoder().fit_transform(df_pred[col].astype(str))
        
    if df_pred.isnull().values.any():
        from sklearn.impute import SimpleImputer
        df_pred[:] = SimpleImputer(strategy='mean').fit_transform(df_pred)
        
    log_event(f"Model loaded from {model_path}")
    
    predictions = model.predict(df_pred)
    log_event("Prediction completed.")
    
    return predictions.tolist()
