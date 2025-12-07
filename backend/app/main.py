# PASTE THIS ENTIRE CODE IN backend/app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from backend.app.routes import providers, validation, reports, health, dashboard
from backend.app.database import engine, Base, get_db
from backend.app.agents.master_agent import MasterAgent
from backend.app.monitoring.dashboard import setup_metrics
from backend.app.logging.config import setup_logging

# Create database tables
Base.metadata.create_all(bind=engine)

# Setup logging
logger = setup_logging()

app = FastAPI(
    title="Healthcare Provider Validation API",
    description="AI-powered system for validating healthcare provider data",
    version="2.0.0",
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") == "development" else None,
    openapi_url="/api/openapi.json" if os.getenv("ENVIRONMENT") == "development" else None,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(","),
        "healthcare-provider-validator.vercel.app",
        "*.render.com",
        "*.railway.app"
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "https://healthcare-provider-validator.vercel.app",
        "https://*.vercel.app",
        "https://*.render.com",
        "https://*.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Add rate limiting middleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include routers with prefixes
app.include_router(providers.router, prefix="/api/providers", tags=["providers"])
app.include_router(validation.router, prefix="/api/validation", tags=["validation"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Setup metrics
setup_metrics(app)

# Initialize master agent (lazy loading)
master_agent = None


def get_master_agent():
    global master_agent
    if master_agent is None:
        master_agent = MasterAgent()
    return master_agent


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Healthcare Provider Validation System...")

    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    logger.info("System started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Healthcare Provider Validation System...")


@app.get("/")
async def root():
    """Root endpoint with system info"""
    return {
        "message": "Healthcare Provider Validation System API",
        "version": "2.0.0",
        "status": "operational",
        "documentation": "/api/docs",
        "health": "/api/health",
        "environment": os.getenv("ENVIRONMENT", "production")
    }


@app.get("/api/status")
@limiter.limit("60/minute")
async def system_status(request):
    """System status endpoint"""
    return {
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": time.time() - startup_time,
        "version": "2.0.0",
        "services": {
            "database": "connected",
            "redis": "connected",
            "ai_agents": "operational"
        }
    }


# File upload endpoint
@app.post("/api/upload")
@limiter.limit("10/minute")
async def upload_file(
        background_tasks: BackgroundTasks,
        file: UploadFile = File(...),
        master: MasterAgent = Depends(get_master_agent)
):
    """Upload provider data file for validation"""

    allowed_extensions = {'.csv', '.xlsx', '.xls', '.pdf'}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"
        )

    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}{file_ext}"

    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Process in background
    background_tasks.add_task(
        process_uploaded_file,
        file_path,
        file_id,
        file_ext,
        master
    )

    return JSONResponse({
        "message": "File uploaded successfully",
        "file_id": file_id,
        "status": "processing_started",
        "check_status_at": f"/api/validation/status/{file_id}"
    })


async def process_uploaded_file(file_path: str, file_id: str, file_ext: str, master: MasterAgent):
    """Background task to process uploaded file"""
    try:
        # Extract data based on file type
        if file_ext == '.pdf':
            providers = await extract_from_pdf(file_path)
        else:
            providers = await extract_from_spreadsheet(file_path)

        # Process validation
        result = await master.process_batch(providers)

        # Save result
        result_path = f"results/{file_id}.json"
        with open(result_path, 'w') as f:
            json.dump(result, f)

    except Exception as e:
        logger.error(f"Error processing file {file_id}: {str(e)}")


# Add static files for reports
@app.get("/api/reports/download/{report_id}")
async def download_report(report_id: str):
    """Download validation report"""
    report_path = f"reports/{report_id}.pdf"

    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")

    return FileResponse(
        report_path,
        media_type='application/pdf',
        filename=f"validation_report_{report_id}.pdf"
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )