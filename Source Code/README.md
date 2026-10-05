# 🚀 FlowML

# AI-Powered Visual Machine Learning Pipeline Builder

FlowML is a modern **AutoML platform** that enables users to **build, train, and deploy machine learning pipelines visually** using an intuitive drag-and-drop workflow interface.

Upload datasets, automate preprocessing, compare models, and generate insights — all in one powerful AI-driven environment.

---

# ✨ Features

## 🧠 AI-Powered AutoML

* Automatic dataset analysis
* Auto preprocessing
* Smart model selection
* Best model recommendation

## 🎯 Visual Pipeline Builder

* Drag-and-drop workflow creation
* Connect ML components visually
* Build end-to-end ML pipelines
* Real-time pipeline execution

## 📊 Dataset Intelligence

* Dataset preview
* Missing value detection
* Feature classification
* Target column suggestion

## 🤖 Automated Model Training

* Multiple models training
* Classification support
* Regression support
* Model comparison

## 📈 Smart Visualizations

* Feature importance
* Correlation heatmap
* Confusion matrix
* Model comparison charts

## 🔮 Prediction Engine

* Upload new dataset
* Generate predictions
* Export results

## 📦 Model Export

* Download trained model
* Download pipeline
* Generate reports

---

# 🖼️ UI Preview

* Drag & Drop Pipeline
* Light & Dark Theme
* Real-time Console
* Node-Based Workflow
* Modern AI SaaS UI

---

# 🏗️ Architecture

```
Frontend (React)
        ↓
Backend (FastAPI)
        ↓
ML Engine (Scikit-learn)
        ↓
Visualization Engine
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Tailwind CSS
* React Flow
* Framer Motion
* Lucide Icons

## Backend

* FastAPI
* Python
* Uvicorn

## Machine Learning

* Scikit-learn
* Pandas
* NumPy

## Visualization

* Matplotlib
* Plotly

## Model Storage

* Joblib
* Pickle

---

# 📁 Project Structure

```
flowml/
│
├── Docs/                  # Presentation slides and project documentation
├── Source Code/
│   ├── frontend/          # React + Vite + Tailwind CSS frontend
│   ├── backend/           # FastAPI + Scikit-Learn backend
│   ├── model_capabilities.yaml
│   └── README.md
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## 1. Clone or Extract Zip

```bash
git clone https://github.com/vishwajeetchandole/flowml-studio.git
cd flowml-studio
```

---

## 2. Backend Setup (FastAPI)

In a terminal, navigate to the backend directory and set up Python:

```bash
cd "Source Code/backend"

# (Optional but recommended) create a virtual environment
python -m venv venv

# Activate virtual environment:
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app:app --reload --port 8000
```

Backend will be running at:
```
http://localhost:8000
```

---

## 3. Frontend Setup (React + Vite)

In a **second terminal**, navigate to the frontend directory:

```bash
cd "Source Code/frontend"

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will be running at:
```
http://localhost:5173
```


---

# API Endpoints

## Upload Dataset

```
POST /api/upload
```

## Analyze Dataset

```
POST /api/analyze
```

## Preprocess Data

```
POST /api/preprocess
```

## Train Models

```
POST /api/train
```

## Model Comparison

```
GET /api/models
```

## Visualizations

```
GET /api/visualizations
```

## Predict

```
POST /api/predict
```

## Download Model

```
GET /api/download-model
```

---

# ⚡ Workflow

1. Upload dataset
2. Analyze dataset
3. Build pipeline
4. Train models
5. Compare performance
6. Visualize results
7. Generate predictions

---

# 🎯 Use Cases

* Data Scientists
* ML Engineers
* Students
* Hackathons
* Research Projects
* AutoML Experiments

---

# 🌙 UI Features

* Light Theme
* Dark Theme
* Drag-Drop Workflow
* Real-Time Console
* Responsive Design

---

Steps:

1. Fork repository
2. Create branch
3. Make changes
4. Submit pull request

---

# 🚀 FlowML

**Build Machine Learning Pipelines. Visually. Intelligently. Effortless**
