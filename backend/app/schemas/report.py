from typing import Optional
from pydantic import BaseModel, Field

class SuspiciousReportCreate(BaseModel):
    scan_id: Optional[str] = None
    medicine_name: str = Field(..., min_length=2)
    batch_number: Optional[str] = None
    manufacturer: Optional[str] = None
    purchase_location: Optional[str] = None
    purchase_date: Optional[str] = None
    concern_description: str = Field(..., min_length=10)

class SuspiciousReportResponse(BaseModel):
    id: str
    report_number: str
    user_id: str
    scan_id: Optional[str] = None
    medicine_name: str
    batch_number: Optional[str] = None
    manufacturer: Optional[str] = None
    purchase_location: Optional[str] = None
    purchase_date: Optional[str] = None
    concern_description: str
    status: str
    admin_notes: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status: str  # submitted, under_review, more_info_required, referred_to_authority, closed
    admin_notes: Optional[str] = None
