import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.report import SuspiciousReport, ReportReview
from app.schemas.report import SuspiciousReportCreate, SuspiciousReportResponse
from app.services.audit_service import AuditService

router = APIRouter()

@router.post("", response_model=SuspiciousReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: SuspiciousReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate human-readable report number
    year = datetime.utcnow().year
    rand_suffix = random.randint(1000, 9999)
    report_num = f"PC-REP-{year}-{rand_suffix}"

    report = SuspiciousReport(
        report_number=report_num,
        user_id=current_user.id,
        scan_id=report_in.scan_id,
        medicine_name=report_in.medicine_name.strip(),
        batch_number=report_in.batch_number.strip() if report_in.batch_number else None,
        manufacturer=report_in.manufacturer.strip() if report_in.manufacturer else None,
        purchase_location=report_in.purchase_location.strip() if report_in.purchase_location else None,
        purchase_date=report_in.purchase_date,
        concern_description=report_in.concern_description.strip(),
        status="submitted"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    AuditService.log(
        db,
        action="suspicious_report_submitted",
        resource_type="report",
        resource_id=report.id,
        user_id=current_user.id,
        details=f"Report {report.report_number} filed for {report.medicine_name}"
    )

    return {
        "id": report.id,
        "report_number": report.report_number,
        "user_id": report.user_id,
        "scan_id": report.scan_id,
        "medicine_name": report.medicine_name,
        "batch_number": report.batch_number,
        "manufacturer": report.manufacturer,
        "purchase_location": report.purchase_location,
        "purchase_date": report.purchase_date,
        "concern_description": report.concern_description,
        "status": report.status,
        "admin_notes": report.admin_notes,
        "created_at": report.created_at.isoformat(),
        "updated_at": report.updated_at.isoformat()
    }

@router.get("", response_model=List[SuspiciousReportResponse])
def get_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SuspiciousReport)
    if current_user.role not in ["admin", "pharmacist"]:
        query = query.filter(SuspiciousReport.user_id == current_user.id)
    
    reports = query.order_by(SuspiciousReport.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "report_number": r.report_number,
            "user_id": r.user_id,
            "scan_id": r.scan_id,
            "medicine_name": r.medicine_name,
            "batch_number": r.batch_number,
            "manufacturer": r.manufacturer,
            "purchase_location": r.purchase_location,
            "purchase_date": r.purchase_date,
            "concern_description": r.concern_description,
            "status": r.status,
            "admin_notes": r.admin_notes,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat()
        }
        for r in reports
    ]

@router.get("/{report_id}", response_model=SuspiciousReportResponse)
def get_report_detail(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    r = db.query(SuspiciousReport).filter(SuspiciousReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role not in ["admin", "pharmacist"] and r.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "id": r.id,
        "report_number": r.report_number,
        "user_id": r.user_id,
        "scan_id": r.scan_id,
        "medicine_name": r.medicine_name,
        "batch_number": r.batch_number,
        "manufacturer": r.manufacturer,
        "purchase_location": r.purchase_location,
        "purchase_date": r.purchase_date,
        "concern_description": r.concern_description,
        "status": r.status,
        "admin_notes": r.admin_notes,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat()
    }
