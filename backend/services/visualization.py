import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import io
import base64
from utils.logger import log_event

def get_base64_image(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return image_base64

def generate_correlation_heatmap(df: pd.DataFrame) -> str:
    log_event("Generating correlation heatmap...")
    numeric_df = df.select_dtypes(include=['number'])
    if numeric_df.empty:
        return ""
    
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', ax=ax, fmt=".2f")
    ax.set_title("Correlation Heatmap")
    
    return get_base64_image(fig)

def generate_feature_importance(model, feature_names: list) -> str:
    log_event("Generating feature importance chart...")
    if not hasattr(model, 'feature_importances_'):
        return ""
        
    importances = model.feature_importances_
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(x=importances, y=feature_names, ax=ax)
    ax.set_title("Feature Importance")
    
    return get_base64_image(fig)

# More charts e.g. confusion matrix can be added similarly
