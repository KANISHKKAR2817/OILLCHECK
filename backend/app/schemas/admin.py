from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class CsvImportPreviewItem(BaseModel):
    product_id: str
    brand_name: str
    generic_name: str
    active_ingredient: str
    strength: str
    dosage_form: str
    manufacturer: str
    barcode: Optional[str] = None
    is_valid: bool
    validation_error: Optional[str] = None
    is_duplicate: bool

class CsvImportPreviewResponse(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    preview_items: List[CsvImportPreviewItem]
    source_name: str

class SystemHealthResponse(BaseModel):
    status: str
    database_connected: bool
    ocr_engine_available: bool
    ocr_engine_name: str
    cv_pipeline_ready: bool
    storage_writable: bool
    total_references: int
    total_users: int
    total_scans: int
    total_reports: int
    engine_version: str
