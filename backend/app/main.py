import uuid
import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.database import Base, engine
from app.seed.seed_data import seed_database
from app.api.v1 import auth, scans, medicines, reports, dashboard, admin

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade medicine authenticity screening and packaging verification API. "
        "Provides digital screening, real OCR extraction, reference matching against public formularies, "
        "OpenCV packaging quality evaluation, and explainable risk factor scoring."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Correlation ID & Performance Middleware
@app.middleware("http")
async def add_correlation_id_and_timing(request: Request, call_next):
    correlation_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = correlation_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Startup database initialization and reference data seeding
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()

# Health & Readiness Endpoints
@app.get("/health", tags=["Infrastructure"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "engine_version": settings.ENGINE_VERSION
    }

@app.get("/ready", tags=["Infrastructure"])
def readiness_check():
    return {
        "ready": True,
        "database": "connected"
    }

# Register API v1 Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & Users"])
app.include_router(scans.router, prefix=f"{settings.API_V1_STR}/scans", tags=["Medicine Scanner & Processing"])
app.include_router(medicines.router, prefix=f"{settings.API_V1_STR}/medicines", tags=["Medicine Reference Catalog"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Suspicious Product Reporting"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard & Analytics"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Administration & Audit"])
