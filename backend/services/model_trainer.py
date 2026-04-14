import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder
from utils.logger import log_event

# Classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Regression
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR

def train_models(X, y, task_type: str, test_size: float = 0.2):
    """
    Trains multiple models based on task_type ('classification' or 'regression')
    and returns a comparison and the best model.
    """
    log_event(f"Starting model training for {task_type} tasks.")
    
    if task_type == 'classification':
        y = LabelEncoder().fit_transform(y.astype(str))
        
    # Auto-encode any string/object columns in X so models don't crash
    # if the user skipped the preprocessing node.
    X = X.copy()
    cat_cols = X.select_dtypes(include=['object', 'category', 'string']).columns
    for col in cat_cols:
        X[col] = LabelEncoder().fit_transform(X[col].astype(str))
        
    # Auto-impute missing values so training doesn't crash
    if X.isnull().values.any():
        from sklearn.impute import SimpleImputer
        X[:] = SimpleImputer(strategy='mean').fit_transform(X)
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    
    models = {}
    if task_type == 'classification':
        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000),
            "Random Forest": RandomForestClassifier(),
            "Decision Tree": DecisionTreeClassifier(),
            "SVM": SVC(probability=True),
            "KNN": KNeighborsClassifier(),
            "Gradient Boosting": GradientBoostingClassifier()
        }
    elif task_type == 'regression':
        models = {
            "Linear Regression": LinearRegression(),
            "Random Forest Regressor": RandomForestRegressor(),
            "Decision Tree Regressor": DecisionTreeRegressor(),
            "SVR": SVR(),
            "Ridge": Ridge(),
            "Lasso": Lasso()
        }
    else:
        raise ValueError("Invalid task type. Choose 'classification' or 'regression'.")

    results = []
    best_model_name = None
    best_model = None
    best_score = -float('inf') if task_type == 'classification' else float('inf')
    
    for name, model in models.items():
        log_event(f"Training {name}...")
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        
        if task_type == 'classification':
            acc = accuracy_score(y_test, predictions)
            score = acc
            # Calculate additional metrics with a generic average to handle multi-class gracefully
            precision = precision_score(y_test, predictions, average='macro', zero_division=0)
            recall = recall_score(y_test, predictions, average='macro', zero_division=0)
            f1 = f1_score(y_test, predictions, average='macro', zero_division=0)
            
            res_dict = {
                "model_name": name, 
                "accuracy": acc,
                "precision": precision,
                "recall": recall,
                "f1_score": f1
            }
            results.append(res_dict)
            if score > best_score:
                best_score = score
                best_model_name = name
                best_model = model
                
        else: # regression
            mse = mean_squared_error(y_test, predictions)
            score = mse
            res_dict = {
                "model_name": name, 
                "mse": mse
            }
            results.append(res_dict)
            if score < best_score:
                best_score = score
                best_model_name = name
                best_model = model
                
    log_event(f"Training completed. Best model: {best_model_name}")
    
    # Save the best model
    save_dir = "models/saved_models"
    os.makedirs(save_dir, exist_ok=True)
    model_path = os.path.join(save_dir, "best_model.joblib")
    joblib.dump(best_model, model_path)
    
    # Save the feature names so predictor knows what to keep
    features_path = os.path.join(save_dir, "features.joblib")
    joblib.dump(X.columns.tolist(), features_path)
    
    log_event(f"Best model saved to {model_path}.")
    
    return {
        "models": results,
        "best_model": best_model_name
    }
