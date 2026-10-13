import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, processing, completed, failed
    scan_mode = Column(String(50), default="upload", nullable=False)  # upload, camera
    overall_risk_band = Column(String(50), default="NEEDS_VERIFICATION", nullable=False)  # LOW_OBSERVED_RISK, NEEDS_VERIFICATION, ELEVATED_CONCERN, ANALYSIS_FAILED
    risk_score = Column(Float, default=0.0, nullable=False)  # 0 to 100 indicator score
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    images = relationship("ScanImage", back_populates="scan", cascade="all, delete-orphan")
    ocr_result = relationship("OcrResult", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    analysis_result = relationship("AnalysisResult", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    reports = relationship("SuspiciousReport", back_populates="scan")

class ScanImage(Base):
    __tablename__ = "scan_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    image_role = Column(String(50), default="front", nullable=False)  # front, back, detail
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    blur_score = Column(Float, nullable=True)  # Laplacian variance
    is_blurry = Column(Boolean, default=False, nullable=False)
    exposure_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    scan = relationship("Scan", back_populates="images")

class OcrResult(Base):
    __tablename__ = "ocr_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    language = Column(String(50), default="eng", nullable=False)
    engine_used = Column(String(100), default="Tesseract OCR + Computer Vision", nullable=False)
    avg_confidence = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    scan = relationship("Scan", back_populates="ocr_result")
    fields = relationship("OcrField", back_populates="ocr_result", cascade="all, delete-orphan")

class OcrField(Base):
    __tablename__ = "ocr_fields"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ocr_result_id = Column(String(36), ForeignKey("ocr_results.id"), nullable=False)
    field_name = Column(String(100), nullable=False)  # medicine_name, manufacturer, batch_number, expiry_date, mfg_date, dosage, barcode
    extracted_value = Column(String(500), nullable=True)
    confidence = Column(Float, default=0.0, nullable=False)
    corrected_value = Column(String(500), nullable=True)
    is_user_corrected = Column(Boolean, default=False, nullable=False)
    validation_status = Column(String(50), default="unverified", nullable=False)  # valid, invalid_format, uncertain, missing, confirmed
    needs_review = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    ocr_result = relationship("OcrResult", back_populates="fields")

    @property
    def effective_value(self):
        return self.corrected_value if self.is_user_corrected else self.extracted_value

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    engine_version = Column(String(50), default="2.1.0", nullable=False)
    reference_match_type = Column(String(50), default="NO_REFERENCE_AVAILABLE", nullable=False)  # EXACT_MATCH, PARTIAL_MATCH, CONFLICTING_INFO, NO_REFERENCE_AVAILABLE, VERIFICATION_UNAVAILABLE
    matched_reference_id = Column(String(36), ForeignKey("medicine_references.id"), nullable=True)
    visual_similarity_score = Column(Float, nullable=True)  # 0 to 100, if reference image existed
    packaging_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    scan = relationship("Scan", back_populates="analysis_result")
    matched_reference = relationship("MedicineReference")
    indicators = relationship("RiskIndicator", back_populates="analysis", cascade="all, delete-orphan")

class RiskIndicator(Base):
    __tablename__ = "risk_indicators"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_results.id"), nullable=False)
    code = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(50), default="info", nullable=False)  # info, warning, critical
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    mitigation_guidance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    analysis = relationship("AnalysisResult", back_populates="indicators")
