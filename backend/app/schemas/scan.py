from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class OcrFieldResponse(BaseModel):
    id: str
    field_name: str
    extracted_value: Optional[str] = None
    confidence: float
    corrected_value: Optional[str] = None
    is_user_corrected: bool
    effective_value: Optional[str] = None
    validation_status: str
    needs_review: bool

    class Config:
        from_attributes = True

class OcrFieldUpdate(BaseModel):
    field_name: str
    corrected_value: str

class OcrFieldsBatchUpdate(BaseModel):
    corrections: List[OcrFieldUpdate]

class OcrResultResponse(BaseModel):
    id: str
    raw_text: str
    language: str
    engine_used: str
    avg_confidence: float
    fields: List[OcrFieldResponse] = []

    class Config:
        from_attributes = True

class RiskIndicatorResponse(BaseModel):
    id: str
    code: str
    title: str
    severity: str  # info, warning, critical
    description: str
    evidence: Optional[str] = None
    mitigation_guidance: Optional[str] = None

    class Config:
        from_attributes = True

class AnalysisResultResponse(BaseModel):
    id: str
    engine_version: str
    reference_match_type: str  # EXACT_MATCH, PARTIAL_MATCH, CONFLICTING_INFO, NO_REFERENCE_AVAILABLE, VERIFICATION_UNAVAILABLE
    matched_reference_id: Optional[str] = None
    matched_reference: Optional[Dict[str, Any]] = None
    visual_similarity_score: Optional[float] = None
    packaging_notes: Optional[str] = None
    indicators: List[RiskIndicatorResponse] = []

    class Config:
        from_attributes = True

class ScanImageResponse(BaseModel):
    id: str
    image_role: str
    file_size: int
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    blur_score: Optional[float] = None
    is_blurry: bool
    exposure_score: Optional[float] = None
    url: str

    class Config:
        from_attributes = True

class ScanDetailResponse(BaseModel):
    id: str
    user_id: str
    status: str
    scan_mode: str
    overall_risk_band: str  # LOW_OBSERVED_RISK, NEEDS_VERIFICATION, ELEVATED_CONCERN, ANALYSIS_FAILED
    risk_score: float
    summary: Optional[str] = None
    created_at: str
    updated_at: str
    disclaimer: str = (
        "PillCheck provides preliminary screening and verification guidance. "
        "An AI result cannot confirm whether a medicine is genuine or counterfeit. "
        "Consult a pharmacist, manufacturer, or appropriate regulatory authority if you suspect a problem. "
        "Do not consume a medicine solely because it receives a low-risk result."
    )
    images: List[ScanImageResponse] = []
    ocr_result: Optional[OcrResultResponse] = None
    analysis_result: Optional[AnalysisResultResponse] = None

    class Config:
        from_attributes = True

class ScanSummaryResponse(BaseModel):
    id: str
    user_id: str
    status: str
    scan_mode: str
    overall_risk_band: str
    risk_score: float
    medicine_name: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
