from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import segment, patients, monitor, upload, analyze
from app.db.database import engine
from app.db.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cancer Patient Monitoring API",
    description="A comprehensive API for monitoring cancer patients with tumor segmentation and tracking",
    version="1.0.0"
)

# CORS (adjust frontend URL if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(segment.router, prefix="/api/v1/segment", tags=["Segmentation"])
app.include_router(monitor.router, prefix="/api/v1/monitor", tags=["Monitoring"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["Upload"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["Analysis"])

@app.get("/")
def read_root():
    return {
        "msg": "Cancer Monitoring API is running",
        "version": "1.0.0",
        "endpoints": {
            "patients": "/api/v1/patients",
            "segmentation": "/api/v1/segment", 
            "monitoring": "/api/v1/monitor",
            "upload": "/api/v1/upload",
            "analysis": "/api/v1/analyze"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "cancer-monitoring-api"}
