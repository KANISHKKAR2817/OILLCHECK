import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.medicine import MedicineReference, ReferenceImage
from app.models.scan import Scan, ScanImage, OcrResult, OcrField, AnalysisResult, RiskIndicator
from app.schemas.scan import (
    ScanDetailResponse, ScanSummaryResponse, OcrFieldsBatchUpdate,
    ScanImageResponse, OcrResultResponse, OcrFieldResponse,
    AnalysisResultResponse, RiskIndicatorResponse
)
from app.services.image_service import ImageService
from app.services.ocr_service import OcrService
from app.services.reference_matcher import ReferenceMatcher
from app.services.cv_analysis_service import CvAnalysisService
from app.services.risk_engine import RiskEngine
from app.services.audit_service import AuditService

router = APIRouter()

def serialize_scan(scan: Scan) -> dict:
    images_res = []
    for img in scan.images:
        images_res.append({
            "id": img.id,
            "image_role": img.image_role,
            "file_size": img.file_size,
            "mime_type": img.mime_type,
            "width": img.width,
            "height": img.height,
            "blur_score": img.blur_score,
            "is_blurry": img.is_blurry,
            "exposure_score": img.exposure_score,
            "url": f"/api/v1/scans/images/{img.id}"
        })

    ocr_res = None
    if scan.ocr_result:
        fields_res = []
        for f in scan.ocr_result.fields:
            fields_res.append({
                "id": f.id,
                "field_name": f.field_name,
                "extracted_value": f.extracted_value,
                "confidence": f.confidence,
                "corrected_value": f.corrected_value,
                "is_user_corrected": f.is_user_corrected,
                "effective_value": f.effective_value,
                "validation_status": f.validation_status,
                "needs_review": f.needs_review
            })
        ocr_res = {
            "id": scan.ocr_result.id,
            "raw_text": scan.ocr_result.raw_text,
            "language": scan.ocr_result.language,
            "engine_used": scan.ocr_result.engine_used,
            "avg_confidence": scan.ocr_result.avg_confidence,
            "fields": fields_res
        }

    analysis_res = None
    if scan.analysis_result:
        matched_ref_dict = None
        if scan.analysis_result.matched_reference:
            ref = scan.analysis_result.matched_reference
            matched_ref_dict = {
                "id": ref.id,
                "product_id": ref.product_id,
                "brand_name": ref.brand_name,
                "generic_name": ref.generic_name,
                "active_ingredient": ref.active_ingredient,
                "strength": ref.strength,
                "dosage_form": ref.dosage_form,
                "manufacturer": ref.manufacturer,
                "country_of_origin": ref.country_of_origin,
                "packaging_desc": ref.packaging_desc,
                "regulatory_id": ref.regulatory_id,
                "source_name": ref.source.name if ref.source else "Local Registry",
                "source_url": ref.source.url if ref.source else None,
                "version": ref.version
            }

        indicators_res = []
        for ind in scan.analysis_result.indicators:
            indicators_res.append({
                "id": ind.id,
                "code": ind.code,
                "title": ind.title,
                "severity": ind.severity,
                "description": ind.description,
                "evidence": ind.evidence,
                "mitigation_guidance": ind.mitigation_guidance
            })

        analysis_res = {
            "id": scan.analysis_result.id,
            "engine_version": scan.analysis_result.engine_version,
            "reference_match_type": scan.analysis_result.reference_match_type,
            "matched_reference_id": scan.analysis_result.matched_reference_id,
            "matched_reference": matched_ref_dict,
            "visual_similarity_score": scan.analysis_result.visual_similarity_score,
            "packaging_notes": scan.analysis_result.packaging_notes,
            "indicators": indicators_res
        }

    return {
        "id": scan.id,
        "user_id": scan.user_id,
        "status": scan.status,
        "scan_mode": scan.scan_mode,
        "overall_risk_band": scan.overall_risk_band,
        "risk_score": scan.risk_score,
        "summary": scan.summary,
        "created_at": scan.created_at.isoformat(),
        "updated_at": scan.updated_at.isoformat(),
        "disclaimer": (
            "PillCheck provides preliminary screening and verification guidance. "
            "An AI result cannot confirm whether a medicine is genuine or counterfeit. "
            "Consult a pharmacist, manufacturer, or appropriate regulatory authority if you suspect a problem. "
            "Do not consume a medicine solely because it receives a low-risk result."
        ),
        "images": images_res,
        "ocr_result": ocr_res,
        "analysis_result": analysis_res
    }

@router.post("", response_model=ScanDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    image: UploadFile = File(...),
    secondary_image: Optional[UploadFile] = File(None),
    scan_mode: str = Form("upload"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Read and validate primary image
    image_bytes = await image.read()
    try:
        rel_path, width, height, mime_type = ImageService.validate_and_save_upload(
            image_bytes, image.filename or "scan.jpg", subfolder="scans"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    full_image_path = settings.UPLOAD_DIR / rel_path
    blur_score, is_blurry, exp_score = ImageService.assess_image_quality(full_image_path)

    # Create Initial Scan record
    scan = Scan(
        user_id=current_user.id,
        status="processing",
        scan_mode=scan_mode,
        overall_risk_band="NEEDS_VERIFICATION",
        risk_score=0.0
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Create ScanImage record
    scan_image = ScanImage(
        scan_id=scan.id,
        image_role="front",
        file_path=rel_path,
        file_size=len(image_bytes),
        mime_type=mime_type,
        width=width,
        height=height,
        blur_score=blur_score,
        is_blurry=is_blurry,
        exposure_score=exp_score
    )
    db.add(scan_image)

    # Optional secondary image (e.g. back of blister)
    if secondary_image:
        sec_bytes = await secondary_image.read()
        try:
            sec_rel, s_w, s_h, s_mime = ImageService.validate_and_save_upload(
                sec_bytes, secondary_image.filename or "scan_back.jpg", subfolder="scans"
            )
            sec_blur, sec_is_blurry, sec_exp = ImageService.assess_image_quality(settings.UPLOAD_DIR / sec_rel)
            sec_scan_img = ScanImage(
                scan_id=scan.id,
                image_role="back",
                file_path=sec_rel,
                file_size=len(sec_bytes),
                mime_type=s_mime,
                width=s_w,
                height=s_h,
                blur_score=sec_blur,
                is_blurry=sec_is_blurry,
                exposure_score=sec_exp
            )
            db.add(sec_scan_img)
        except Exception:
            pass

    db.commit()

    # 2. Run Real OCR
    raw_text, engine_used, avg_conf = OcrService.extract_text(full_image_path)
    ocr_result = OcrResult(
        scan_id=scan.id,
        raw_text=raw_text,
        language="eng",
        engine_used=engine_used,
        avg_confidence=avg_conf
    )
    db.add(ocr_result)
    db.commit()
    db.refresh(ocr_result)

    # 3. Parse Structured Fields
    parsed_fields = OcrService.parse_structured_fields(raw_text)
    extracted_dict = {}
    for fname, fdata in parsed_fields.items():
        ocr_field = OcrField(
            ocr_result_id=ocr_result.id,
            field_name=fname,
            extracted_value=fdata["value"],
            confidence=fdata["confidence"],
            validation_status=fdata["status"],
            needs_review=fdata["needs_review"]
        )
        db.add(ocr_field)
        if fdata["value"]:
            extracted_dict[fname] = fdata["value"]

    db.commit()

    # 4. Reference Matching
    match_type, matched_ref, matched_batch, conflicts = ReferenceMatcher.match_fields(
        db, extracted_dict
    )

    # 5. Computer Vision packaging comparison if reference image available
    visual_sim_score = None
    cv_notes = None
    if matched_ref:
        ref_img_record = db.query(ReferenceImage).filter(
            ReferenceImage.medicine_id == matched_ref.id,
            ReferenceImage.image_type == "front"
        ).first()
        if ref_img_record:
            ref_path = settings.UPLOAD_DIR / ref_img_record.file_path
            visual_sim_score, cv_notes = CvAnalysisService.compare_packaging_images(
                full_image_path, ref_path
            )

    # 6. Risk Engine Evaluation
    eval_result = RiskEngine.evaluate(
        image_quality={"blur_score": blur_score, "is_blurry": is_blurry},
        extracted_fields=extracted_dict,
        match_type=match_type,
        matched_ref=matched_ref,
        matched_batch=matched_batch,
        conflicts=conflicts,
        visual_similarity_score=visual_sim_score
    )

    # 7. Persist Analysis and Indicators
    analysis = AnalysisResult(
        scan_id=scan.id,
        engine_version=eval_result["engine_version"],
        reference_match_type=match_type,
        matched_reference_id=matched_ref.id if matched_ref else None,
        visual_similarity_score=visual_sim_score,
        packaging_notes=cv_notes
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    for ind in eval_result["indicators"]:
        indicator_model = RiskIndicator(
            analysis_id=analysis.id,
            code=ind["code"],
            title=ind["title"],
            severity=ind["severity"],
            description=ind["description"],
            evidence=ind.get("evidence"),
            mitigation_guidance=ind.get("mitigation_guidance")
        )
        db.add(indicator_model)

    # 8. Update Scan status
    scan.status = "completed"
    scan.overall_risk_band = eval_result["overall_risk_band"]
    scan.risk_score = eval_result["risk_score"]
    scan.summary = eval_result["summary"]
    db.commit()
    db.refresh(scan)

    AuditService.log(
        db,
        action="scan_completed",
        resource_type="scan",
        resource_id=scan.id,
        user_id=current_user.id,
        details=f"Risk Band: {scan.overall_risk_band}, Score: {scan.risk_score}"
    )

    return serialize_scan(scan)

@router.get("/{scan_id}", response_model=ScanDetailResponse)
def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    # Ownership boundary: normal users only view their own scans
    if current_user.role not in ["admin", "pharmacist"] and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this scan record")

    return serialize_scan(scan)

@router.get("/{scan_id}/status")
def get_scan_status(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if current_user.role not in ["admin", "pharmacist"] and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return {
        "scan_id": scan.id,
        "status": scan.status,
        "overall_risk_band": scan.overall_risk_band,
        "risk_score": scan.risk_score
    }

@router.patch("/{scan_id}/ocr-fields", response_model=ScanDetailResponse)
def update_ocr_fields(
    scan_id: str,
    corrections_in: OcrFieldsBatchUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Review and Correct workflow:
    Allows user to correct misread fields. Does NOT overwrite original OCR extraction;
    records correction, triggers re-validation and re-runs risk assessment.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if current_user.role not in ["admin", "pharmacist"] and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if not scan.ocr_result:
        raise HTTPException(status_code=400, detail="Scan has no OCR results to correct")

    # Update fields with user corrections
    for corr in corrections_in.corrections:
        field = db.query(OcrField).filter(
            OcrField.ocr_result_id == scan.ocr_result.id,
            OcrField.field_name == corr.field_name
        ).first()

        if field:
            field.corrected_value = corr.corrected_value.strip() if corr.corrected_value else None
            field.is_user_corrected = True
            field.validation_status = "confirmed"
            field.needs_review = False
        else:
            # Create field if it wasn't extracted
            new_f = OcrField(
                ocr_result_id=scan.ocr_result.id,
                field_name=corr.field_name,
                extracted_value=None,
                confidence=100.0,
                corrected_value=corr.corrected_value.strip() if corr.corrected_value else None,
                is_user_corrected=True,
                validation_status="confirmed",
                needs_review=False
            )
            db.add(new_f)

    db.commit()

    # Gather effective fields
    effective_fields = {}
    for f in scan.ocr_result.fields:
        val = f.effective_value
        if val:
            effective_fields[f.field_name] = val

    # Re-run Reference Matching
    match_type, matched_ref, matched_batch, conflicts = ReferenceMatcher.match_fields(
        db, effective_fields
    )

    # Check primary image for quality
    primary_img = scan.images[0] if scan.images else None
    blur_score = primary_img.blur_score if primary_img else 100.0
    is_blurry = primary_img.is_blurry if primary_img else False
    visual_sim = scan.analysis_result.visual_similarity_score if scan.analysis_result else None

    # Re-evaluate Risk Engine
    eval_result = RiskEngine.evaluate(
        image_quality={"blur_score": blur_score, "is_blurry": is_blurry},
        extracted_fields=effective_fields,
        match_type=match_type,
        matched_ref=matched_ref,
        matched_batch=matched_batch,
        conflicts=conflicts,
        visual_similarity_score=visual_sim
    )

    # Update Analysis & Indicators
    if scan.analysis_result:
        scan.analysis_result.reference_match_type = match_type
        scan.analysis_result.matched_reference_id = matched_ref.id if matched_ref else None
        
        # Clear old indicators and add updated ones
        db.query(RiskIndicator).filter(RiskIndicator.analysis_id == scan.analysis_result.id).delete()
        for ind in eval_result["indicators"]:
            indicator_model = RiskIndicator(
                analysis_id=scan.analysis_result.id,
                code=ind["code"],
                title=ind["title"],
                severity=ind["severity"],
                description=ind["description"],
                evidence=ind.get("evidence"),
                mitigation_guidance=ind.get("mitigation_guidance")
            )
            db.add(indicator_model)

    scan.overall_risk_band = eval_result["overall_risk_band"]
    scan.risk_score = eval_result["risk_score"]
    scan.summary = eval_result["summary"]
    db.commit()
    db.refresh(scan)

    AuditService.log(
        db,
        action="ocr_fields_corrected",
        resource_type="scan",
        resource_id=scan.id,
        user_id=current_user.id,
        details=f"User verified/corrected {len(corrections_in.corrections)} fields"
    )

    return serialize_scan(scan)

@router.get("", response_model=List[ScanSummaryResponse])
def list_scans(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    risk_band: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Scan)
    if current_user.role not in ["admin", "pharmacist"]:
        query = query.filter(Scan.user_id == current_user.id)
    
    if risk_band:
        query = query.filter(Scan.overall_risk_band == risk_band)

    scans = query.order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()

    summary_list = []
    for s in scans:
        med_name = None
        if s.ocr_result and s.ocr_result.fields:
            name_f = next((f for f in s.ocr_result.fields if f.field_name == "medicine_name"), None)
            if name_f:
                med_name = name_f.effective_value

        summary_list.append({
            "id": s.id,
            "user_id": s.user_id,
            "status": s.status,
            "scan_mode": s.scan_mode,
            "overall_risk_band": s.overall_risk_band,
            "risk_score": s.risk_score,
            "medicine_name": med_name or "Packaging Scan",
            "created_at": s.created_at.isoformat()
        })
    return summary_list

@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if current_user.role not in ["admin"] and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    AuditService.log(
        db,
        action="scan_deleted",
        resource_type="scan",
        resource_id=scan.id,
        user_id=current_user.id
    )

    db.delete(scan)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/images/{image_id}")
def get_scan_image(
    image_id: str,
    token: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Secure image serving. Only allows image owner or admin.
    """
    img_record = db.query(ScanImage).filter(ScanImage.id == image_id).first()
    if not img_record:
        raise HTTPException(status_code=404, detail="Image record not found")

    scan = db.query(Scan).filter(Scan.id == img_record.scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Associated scan not found")

    # Authorize
    user = current_user
    if not user and token:
        from app.core.security import decode_access_token
        uid = decode_access_token(token)
        if uid:
            user = db.query(User).filter(User.id == uid).first()

    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to view scan images")

    if user.role not in ["admin", "pharmacist"] and scan.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied to this image asset")

    file_path = settings.UPLOAD_DIR / img_record.file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on storage disk")

    return FileResponse(path=file_path, media_type=img_record.mime_type)
