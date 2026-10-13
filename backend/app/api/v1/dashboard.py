from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.report import SuspiciousReport
from app.schemas.dashboard import DashboardSummaryResponse, DashboardAnalyticsResponse

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan_query = db.query(Scan)
    report_query = db.query(SuspiciousReport)

    if current_user.role not in ["admin", "pharmacist"]:
        scan_query = scan_query.filter(Scan.user_id == current_user.id)
        report_query = report_query.filter(SuspiciousReport.user_id == current_user.id)

    total_scans = scan_query.count()
    failures = scan_query.filter(
        (Scan.status == "failed") | (Scan.overall_risk_band == "ANALYSIS_FAILED")
    ).count()
    needs_verif = scan_query.filter(Scan.overall_risk_band == "NEEDS_VERIFICATION").count()
    elevated = scan_query.filter(Scan.overall_risk_band == "ELEVATED_CONCERN").count()
    low_risk = scan_query.filter(Scan.overall_risk_band == "LOW_OBSERVED_RISK").count()
    total_reports = report_query.count()

    return {
        "total_scans": total_scans,
        "processing_failures": failures,
        "needs_verification_count": needs_verif,
        "elevated_concern_count": elevated,
        "low_risk_count": low_risk,
        "total_reports_submitted": total_reports
    }

@router.get("/analytics", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan_query = db.query(Scan)
    report_query = db.query(SuspiciousReport)

    if current_user.role not in ["admin", "pharmacist"]:
        scan_query = scan_query.filter(Scan.user_id == current_user.id)
        report_query = report_query.filter(SuspiciousReport.user_id == current_user.id)

    total_scans = scan_query.count()
    failures = scan_query.filter(
        (Scan.status == "failed") | (Scan.overall_risk_band == "ANALYSIS_FAILED")
    ).count()
    needs_verif = scan_query.filter(Scan.overall_risk_band == "NEEDS_VERIFICATION").count()
    elevated = scan_query.filter(Scan.overall_risk_band == "ELEVATED_CONCERN").count()
    low_risk = scan_query.filter(Scan.overall_risk_band == "LOW_OBSERVED_RISK").count()
    total_reports = report_query.count()

    summary = {
        "total_scans": total_scans,
        "processing_failures": failures,
        "needs_verification_count": needs_verif,
        "elevated_concern_count": elevated,
        "low_risk_count": low_risk,
        "total_reports_submitted": total_reports
    }

    # 1. Risk distribution for Recharts
    risk_distribution = [
        {"name": "Low Observed Risk", "count": low_risk},
        {"name": "Needs Verification", "count": needs_verif},
        {"name": "Elevated Concern", "count": elevated},
        {"name": "Failed / Inconclusive", "count": failures},
    ]

    # 2. Activity timeline over the past 7 days (or days with data)
    timeline_dict: Dict[str, Dict[str, int]] = {}
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        d_str = (today - timedelta(days=i)).strftime("%b %d")
        timeline_dict[d_str] = {"scans": 0, "elevated_count": 0}

    scans = scan_query.order_by(Scan.created_at.asc()).all()
    for s in scans:
        if s.created_at:
            d_key = s.created_at.strftime("%b %d")
            if d_key in timeline_dict:
                timeline_dict[d_key]["scans"] += 1
                if s.overall_risk_band == "ELEVATED_CONCERN":
                    timeline_dict[d_key]["elevated_count"] += 1

    activity_timeline = [
        {"date": d_k, "scans": data["scans"], "elevated_count": data["elevated_count"]}
        for d_k, data in timeline_dict.items()
    ]

    # 3. Recent 5 scans
    recent = scan_query.order_by(Scan.created_at.desc()).limit(5).all()
    recent_list = []
    for s in recent:
        med_name = None
        if s.ocr_result and s.ocr_result.fields:
            name_f = next((f for f in s.ocr_result.fields if f.field_name == "medicine_name"), None)
            if name_f:
                med_name = name_f.effective_value

        recent_list.append({
            "id": s.id,
            "overall_risk_band": s.overall_risk_band,
            "risk_score": s.risk_score,
            "medicine_name": med_name or "Packaging Scan",
            "created_at": s.created_at.isoformat()
        })

    return {
        "summary": summary,
        "risk_distribution": risk_distribution,
        "activity_timeline": activity_timeline,
        "recent_scans": recent_list
    }
