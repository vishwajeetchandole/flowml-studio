from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

# Import routers
from routes import upload, analyze, preprocess, train, predict, visualize, pipeline
from routes import runs
from auth import get_current_user
from utils.logger import stream_logs

app = FastAPI(title="FlowML Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload.router,     prefix="/api", tags=["Upload"])
app.include_router(analyze.router,    prefix="/api", tags=["Analyze"])
app.include_router(preprocess.router, prefix="/api", tags=["Preprocess"])
app.include_router(train.router,      prefix="/api", tags=["Train"])
app.include_router(predict.router,    prefix="/api", tags=["Predict"])
app.include_router(visualize.router,  prefix="/api", tags=["Visualize"])
app.include_router(pipeline.router,   prefix="/api", tags=["Pipeline"])
app.include_router(runs.router,       prefix="/api", tags=["Runs"])


@app.get("/api/health")
async def health_check():
    return {"status": "running"}


@app.get("/api/logs")
async def get_logs(request: Request):
    """Real-time console logs streaming via Server-Sent Events."""
    return EventSourceResponse(stream_logs())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
