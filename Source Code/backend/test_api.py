import os
import requests
import json
import pandas as pd
from sklearn.datasets import load_iris

# 1. Create dataset
print("Generating sample dataset...")
iris = load_iris()
df = pd.DataFrame(data=iris.data, columns=iris.feature_names)
df['target'] = iris.target
df.to_csv("iris.csv", index=False)
print("Saved iris.csv")

BASE_URL = "http://127.0.0.1:8000/api"

print("\n--- Uploading Dataset ---")
with open("iris.csv", "rb") as f:
    files = {"file": ("iris.csv", f, "text/csv")}
    try:
        r = requests.post(f"{BASE_URL}/upload", files=files)
        print("Status Code:", r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Backend is likely not running or requests isn't working:", e)
        exit(1)

print("\n--- Analyzing Dataset ---")
r = requests.post(f"{BASE_URL}/analyze", json={"file_name": "iris.csv"})
print("Status Code:", r.status_code)
print(json.dumps(r.json(), indent=2))

print("\n--- Preprocessing Dataset ---")
r = requests.post(f"{BASE_URL}/preprocess", json={
    "file_name": "iris.csv",
    "config": {
        "missing_values": "mean",
        "categorical_encoding": "label",
        "scaling": "standard",
        "target_column": "target"
    }
})
print("Status Code:", r.status_code)
print(json.dumps(r.json(), indent=2))

print("\n--- Training Model ---")
r = requests.post(f"{BASE_URL}/train", json={
    "file_name": "processed_iris.csv",  # using the processed dataset
    "target_column": "target",
    "task_type": "classification"
})
print("Status Code:", r.status_code)
print(json.dumps(r.json(), indent=2))

print("\n--- Visualizations ---")
r = requests.get(f"{BASE_URL}/visualizations", params={"file_name": "iris.csv"})
print("Status Code:", r.status_code)
if r.status_code == 200:
    res = r.json()
    print("Received viewing dict with keys:", list(res.keys()))
    print("Base64 string snippet:", res["correlation_heatmap"][:50])
else:
    print(r.text)

print("\n--- Predictions ---")
# prepare prediction dataset by dropping target
pred_df = pd.read_csv("backend/uploads/processed_iris.csv")
pred_df.drop(columns=["target"], inplace=True)
pred_df.to_csv("backend/uploads/pred_iris.csv", index=False)

r = requests.post(f"{BASE_URL}/predict", json={"file_name": "pred_iris.csv"})
print("Status Code:", r.status_code)
if r.status_code == 200:
    preds = r.json()["predictions"]
    print("Predictions output snippet:", preds[:10])
else:
    print(r.text)

print("\n--- Testing Completed Successfully ---")
