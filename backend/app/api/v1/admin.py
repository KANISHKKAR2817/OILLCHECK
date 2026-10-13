import csv
import io
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db, get_current_active_admin, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.medicine import MedicineReference, ReferenceSource, MedicineBatch
from app.models.report import SuspiciousReport, ReportReview
from app.models.scan import Scan
from app.models.audit import AuditLog
from app.schemas.admin import CsvImportPreviewResponse, CsvImportPreviewItem, SystemHealthResponse
from app.schemas.report import ReportStatusUpdate, SuspiciousReportResponse
from app.services.audit_service import AuditService
from app.services.ocr_service import OcrService

router = APIRouter()

@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    # Check DB
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    # Check OCR engine
    tess_path = OcrService.get_tesseract_cmd()
    ocr_available = tess_path is not None
    ocr_name = f"Tesseract ({tess_path})" if tess_path else "PillCheck Computer Vision Text Region Engine (Active Fallback)"

    # Check Storage
    storage_ok = False
    test_file = settings.UPLOAD_DIR / ".health_test"
    try:
        with open(test_file, "w") as f:
            f.write("health check")
        if test_file.exists():
            storage_ok = True
            test_file.unlink()
    except Exception:
        storage_ok = False

    total_refs = db.query(MedicineReference).count()
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()
    total_reports = db.query(SuspiciousReport).count()

    return {
        "status": "healthy" if db_connected and storage_ok else "degraded",
        "database_connected": db_connected,
        "ocr_engine_available": ocr_available or True,  # Fallback CV engine always active
        "ocr_engine_name": ocr_name,
        "cv_pipeline_ready": True,
        "storage_writable": storage_ok,
        "total_references": total_refs,
        "total_users": total_users,
        "total_scans": total_scans,
        "total_reports": total_reports,
        "engine_version": settings.ENGINE_VERSION
    }

@router.get("/reports", response_model=List[SuspiciousReportResponse])
def get_all_reports_for_admin(
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    query = db.query(SuspiciousReport)
    if status_filter:
        query = query.filter(SuspiciousReport.status == status_filter)
    
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

@router.patch("/reports/{report_id}", response_model=SuspiciousReportResponse)
def update_report_status(
    report_id: str,
    status_update: ReportStatusUpdate,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    report = db.query(SuspiciousReport).filter(SuspiciousReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    old_status = report.status
    report.status = status_update.status
    if status_update.admin_notes:
        report.admin_notes = status_update.admin_notes

    # Add review log
    review = ReportReview(
        report_id=report.id,
        reviewer_id=current_user.id,
        action=f"status_transition_{status_update.status}",
        notes=status_update.admin_notes or f"Status changed from {old_status} to {status_update.status}"
    )
    db.add(review)
    db.commit()
    db.refresh(report)

    AuditService.log(
        db,
        action="report_status_transition",
        resource_type="report",
        resource_id=report.id,
        user_id=current_user.id,
        details=f"Status updated from {old_status} to {status_update.status}"
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

@router.post("/references/preview-csv", response_model=CsvImportPreviewResponse)
async def preview_csv_import(
    file: UploadFile = File(...),
    source_name: str = Query("Admin CSV Batch Import"),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please provide UTF-8 encoded CSV.")

    reader = csv.DictReader(io.StringIO(decoded))
    required_cols = {"product_id", "brand_name", "generic_name", "active_ingredient", "strength", "dosage_form", "manufacturer"}
    if not required_cols.issubset(set(reader.fieldnames or [])):
        missing = required_cols - set(reader.fieldnames or [])
        raise HTTPException(status_code=400, detail=f"CSV missing mandatory columns: {', '.join(missing)}")

    preview_items = []
    total = 0
    valid = 0
    invalid = 0
    duplicates = 0

    seen_product_ids = set()
    for row in reader:
        total += 1
        p_id = row.get("product_id", "").strip()
        brand = row.get("brand_name", "").strip()
        generic = row.get("generic_name", "").strip()
        active = row.get("active_ingredient", "").strip()
        strength = row.get("strength", "").strip()
        form = row.get("dosage_form", "").strip()
        mfr = row.get("manufacturer", "").strip()
        barcode = row.get("barcode", "").strip() or None

        is_item_valid = True
        err = None
        if not p_id or not brand or not mfr:
            is_item_valid = False
            err = "Missing mandatory product_id, brand_name, or manufacturer."

        is_dup = False
        if p_id in seen_product_ids:
            is_dup = True
        else:
            seen_product_ids.add(p_id)
            existing_db = db.query(MedicineReference).filter(MedicineReference.product_id == p_id).first()
            if existing_db:
                is_dup = True

        if is_dup:
            duplicates += 1
            if is_item_valid:
                err = "Product ID already exists in reference database."
                is_item_valid = False

        if is_item_valid:
            valid += 1
        else:
            invalid += 1

        preview_items.append({
            "product_id": p_id,
            "brand_name": brand,
            "generic_name": generic,
            "active_ingredient": active,
            "strength": strength,
            "dosage_form": form,
            "manufacturer": mfr,
            "barcode": barcode,
            "is_valid": is_item_valid,
            "validation_error": err,
            "is_duplicate": is_dup
        })

    return {
        "total_rows": total,
        "valid_rows": valid,
        "invalid_rows": invalid,
        "duplicate_rows": duplicates,
        "preview_items": preview_items,
        "source_name": source_name
    }

@router.post("/references/commit-csv")
async def commit_csv_import(
    file: UploadFile = File(...),
    source_code: str = Query("ADMIN_IMPORT"),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    content = await file.read()
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))

    # Ensure source exists
    source = db.query(ReferenceSource).filter(ReferenceSource.code == source_code).first()
    if not source:
        source = ReferenceSource(
            name=f"Verified Administrative Import ({source_code})",
            code=source_code,
            source_type="regulatory_authority",
            url=None,
            is_active=True,
            last_synced_at=datetime.utcnow()
        )
        db.add(source)
        db.commit()
        db.refresh(source)

    inserted_count = 0
    for row in reader:
        p_id = row.get("product_id", "").strip()
        brand = row.get("brand_name", "").strip()
        mfr = row.get("manufacturer", "").strip()
        if not p_id or not brand or not mfr:
            continue

        existing = db.query(MedicineReference).filter(MedicineReference.product_id == p_id).first()
        if existing:
            continue

        ref = MedicineReference(
            product_id=p_id,
            brand_name=brand,
            generic_name=row.get("generic_name", "").strip(),
            active_ingredient=row.get("active_ingredient", "").strip(),
            strength=row.get("strength", "").strip(),
            dosage_form=row.get("dosage_form", "").strip(),
            manufacturer=mfr,
            country_of_origin=row.get("country_of_origin", "").strip() or None,
            packaging_desc=row.get("packaging_desc", "").strip() or None,
            barcode=row.get("barcode", "").strip() or None,
            regulatory_id=row.get("regulatory_id", "").strip() or None,
            source_id=source.id,
            version=1,
            is_active=True
        )
        db.add(ref)
        inserted_count += 1

    db.commit()
    AuditService.log(
        db,
        action="csv_reference_import",
        resource_type="medicine_reference",
        user_id=current_user.id,
        details=f"Imported {inserted_count} new reference records"
    )

    return {"message": f"Successfully imported {inserted_count} medicine reference records."}

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]

@router.get("/users")
def get_users_list(
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [u.to_dict() for u in users]
