from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api.deps import get_db
from app.models.medicine import MedicineReference, ReferenceSource
from app.schemas.medicine import MedicineReferenceResponse

router = APIRouter()

@router.get("/search", response_model=List[MedicineReferenceResponse])
def search_medicines(
    q: Optional[str] = Query(None, description="Search term across brand, generic, manufacturer, or barcode"),
    manufacturer: Optional[str] = Query(None),
    dosage_form: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(MedicineReference).filter(MedicineReference.is_active == True)

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                MedicineReference.brand_name.ilike(term),
                MedicineReference.generic_name.ilike(term),
                MedicineReference.active_ingredient.ilike(term),
                MedicineReference.manufacturer.ilike(term),
                MedicineReference.product_id.ilike(term),
                MedicineReference.barcode.ilike(term)
            )
        )

    if manufacturer and manufacturer.strip():
        query = query.filter(MedicineReference.manufacturer.ilike(f"%{manufacturer.strip()}%"))

    if dosage_form and dosage_form.strip():
        query = query.filter(MedicineReference.dosage_form.ilike(f"%{dosage_form.strip()}%"))

    results = query.order_by(MedicineReference.brand_name.asc()).offset(skip).limit(limit).all()

    formatted = []
    for r in results:
        formatted.append({
            "id": r.id,
            "product_id": r.product_id,
            "brand_name": r.brand_name,
            "generic_name": r.generic_name,
            "active_ingredient": r.active_ingredient,
            "strength": r.strength,
            "dosage_form": r.dosage_form,
            "manufacturer": r.manufacturer,
            "country_of_origin": r.country_of_origin,
            "packaging_desc": r.packaging_desc,
            "barcode": r.barcode,
            "regulatory_id": r.regulatory_id,
            "source_id": r.source_id,
            "source": r.source,
            "version": r.version,
            "is_active": r.is_active,
            "created_at": r.created_at.isoformat(),
            "batches": [
                {
                    "id": b.id,
                    "batch_number": b.batch_number,
                    "manufacturing_date": b.manufacturing_date,
                    "expiry_date": b.expiry_date,
                    "status": b.status
                }
                for b in r.batches
            ]
        })
    return formatted

@router.get("/{medicine_id}", response_model=MedicineReferenceResponse)
def get_medicine_reference(
    medicine_id: str,
    db: Session = Depends(get_db)
):
    r = db.query(MedicineReference).filter(MedicineReference.id == medicine_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Medicine reference record not found")

    return {
        "id": r.id,
        "product_id": r.product_id,
        "brand_name": r.brand_name,
        "generic_name": r.generic_name,
        "active_ingredient": r.active_ingredient,
        "strength": r.strength,
        "dosage_form": r.dosage_form,
        "manufacturer": r.manufacturer,
        "country_of_origin": r.country_of_origin,
        "packaging_desc": r.packaging_desc,
        "barcode": r.barcode,
        "regulatory_id": r.regulatory_id,
        "source_id": r.source_id,
        "source": r.source,
        "version": r.version,
        "is_active": r.is_active,
        "created_at": r.created_at.isoformat(),
        "batches": [
            {
                "id": b.id,
                "batch_number": b.batch_number,
                "manufacturing_date": b.manufacturing_date,
                "expiry_date": b.expiry_date,
                "status": b.status
            }
            for b in r.batches
        ]
    }
