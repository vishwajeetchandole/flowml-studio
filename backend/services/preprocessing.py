import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler, MinMaxScaler
from utils.logger import log_event

def preprocess_data(df: pd.DataFrame, config: dict) -> pd.DataFrame:
    """
    Applies preprocessing based on config.
    config format:
    {
        "missing_values": "mean" | "median" | "most_frequent" | "drop",
        "categorical_encoding": "label" | "onehot",
        "scaling": "standard" | "minmax" | "none"
    }
    """
    log_event("Starting data preprocessing...")
    processed_df = df.copy()
    
    # Handle missing values
    strategy = config.get("missing_values", "mean")
    if strategy == "drop":
        processed_df.dropna(inplace=True)
    elif strategy in ["mean", "median", "most_frequent"]:
        numeric_cols = processed_df.select_dtypes(include=['number']).columns
        cat_cols = processed_df.select_dtypes(include=['object', 'category']).columns
        
        if len(numeric_cols) > 0 and strategy in ["mean", "median"]:
            num_imputer = SimpleImputer(strategy=strategy)
            processed_df[numeric_cols] = num_imputer.fit_transform(processed_df[numeric_cols])
            
        if len(cat_cols) > 0 or strategy == "most_frequent":
            cat_imputer = SimpleImputer(strategy="most_frequent")
            if len(cat_cols) > 0:
                 processed_df[cat_cols] = cat_imputer.fit_transform(processed_df[cat_cols])
            if strategy == "most_frequent" and len(numeric_cols) > 0:
                 processed_df[numeric_cols] = cat_imputer.fit_transform(processed_df[numeric_cols])

    # Categorical Encoding
    encoding = config.get("categorical_encoding", "label")
    cat_cols = processed_df.select_dtypes(include=['object', 'category']).columns
    if len(cat_cols) > 0:
        if encoding == "label":
            le = LabelEncoder()
            for col in cat_cols:
                processed_df[col] = le.fit_transform(processed_df[col].astype(str))
        elif encoding == "onehot":
            processed_df = pd.get_dummies(processed_df, columns=cat_cols)
            
    # Scaling
    scaling = config.get("scaling", "none")
    target_col = config.get("target_column")
    if scaling != "none":
        numeric_cols = processed_df.select_dtypes(include=['number']).columns.tolist()
        if target_col in numeric_cols:
            numeric_cols.remove(target_col)
            
        if len(numeric_cols) > 0:
            if scaling == "standard":
                scaler = StandardScaler()
            elif scaling == "minmax":
                scaler = MinMaxScaler()
            processed_df[numeric_cols] = scaler.fit_transform(processed_df[numeric_cols])

    log_event("Preprocessing completed.")
    return processed_df
