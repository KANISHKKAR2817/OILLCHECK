from typing import Optional, List
from pydantic import BaseModel

class ReferenceSourceResponse(BaseModel):
    id: str
    name: str
    code: str
    source_type: str
    url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class MedicineBatchResponse(BaseModel):
    id: str
    batch_number: str
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class MedicineReferenceBase(BaseModel):
    product_id: str
    brand_name: str
    generic_name: str
    active_ingredient: str
    strength: str
    dosage_form: str
    manufacturer: str
    country_of_origin: Optional[str] = None
    packaging_desc: Optional[str] = None
    barcode: Optional[str] = None
    regulatory_id: Optional[str] = None

class MedicineReferenceCreate(MedicineReferenceBase):
    source_code: Optional[str] = None

class MedicineReferenceResponse(MedicineReferenceBase):
    id: str
    source_id: Optional[str] = None
    source: Optional[ReferenceSourceResponse] = None
    version: int
    is_active: bool
    created_at: str
    batches: List[MedicineBatchResponse] = []

    class Config:
        from_attributes = True
