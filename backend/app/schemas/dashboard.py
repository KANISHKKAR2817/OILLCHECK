from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StatusCount(BaseModel):
    name: str
    count: int

class ActivityPoint(BaseModel):
    date: str
    scans: int
    elevated_count: int

class DashboardSummaryResponse(BaseModel):
    total_scans: int
    processing_failures: int
    needs_verification_count: int
    elevated_concern_count: int
    low_risk_count: int
    total_reports_submitted: int

class DashboardAnalyticsResponse(BaseModel):
    summary: DashboardSummaryResponse
    risk_distribution: List[StatusCount]
    activity_timeline: List[ActivityPoint]
    recent_scans: List[Dict[str, Any]]
