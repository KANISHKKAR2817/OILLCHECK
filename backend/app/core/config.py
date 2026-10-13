import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PillCheck"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENGINE_VERSION: str = "2.1.0"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pillcheck-production-grade-secure-signing-key-random-seed-9824")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pillcheck.db")
    
    # File Storage
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/webp"]
    
    # OCR & CV
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "")
    BLUR_THRESHOLD: float = 80.0  # Laplacian variance threshold
    
    # Rate Limiting & Safety
    RATE_LIMIT_PER_MINUTE: int = 120

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(settings.UPLOAD_DIR / "scans").mkdir(parents=True, exist_ok=True)
(settings.UPLOAD_DIR / "references").mkdir(parents=True, exist_ok=True)
(settings.UPLOAD_DIR / "reports").mkdir(parents=True, exist_ok=True)
