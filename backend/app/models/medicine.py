import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class ReferenceSource(Base):
    __tablename__ = "reference_sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)  # e.g., "FDA National Drug Code Directory", "EMA Registry", "CDSCO Portal"
    code = Column(String(50), unique=True, index=True, nullable=False)
    source_type = Column(String(50), nullable=False)  # regulatory_authority, manufacturer_registry, pharmacopeia
    url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    medicines = relationship("MedicineReference", back_populates="source")

class MedicineReference(Base):
    __tablename__ = "medicine_references"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(100), unique=True, index=True, nullable=False)  # e.g., NDC 0069-4200-30 or CDSCO-REG-492
    brand_name = Column(String(255), index=True, nullable=False)
    generic_name = Column(String(255), index=True, nullable=False)
    active_ingredient = Column(String(255), nullable=False)
    strength = Column(String(100), nullable=False)  # e.g., "500 mg", "10 mg/5ml"
    dosage_form = Column(String(100), nullable=False)  # Tablet, Capsule, Syrup, Injection
    manufacturer = Column(String(255), index=True, nullable=False)
    country_of_origin = Column(String(100), nullable=True)
    packaging_desc = Column(Text, nullable=True)  # Blister pack with tamper-evident seal, holographic foil
    barcode = Column(String(100), index=True, nullable=True)
    regulatory_id = Column(String(100), index=True, nullable=True)
    source_id = Column(String(36), ForeignKey("reference_sources.id"), nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    source = relationship("ReferenceSource", back_populates="medicines")
    batches = relationship("MedicineBatch", back_populates="medicine", cascade="all, delete-orphan")
    reference_images = relationship("ReferenceImage", back_populates="medicine", cascade="all, delete-orphan")

class ReferenceImage(Base):
    __tablename__ = "reference_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medicine_id = Column(String(36), ForeignKey("medicine_references.id"), nullable=False)
    image_type = Column(String(50), default="front")  # front, back, hologram, blister
    file_path = Column(String(500), nullable=False)
    checksum = Column(String(64), nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    medicine = relationship("MedicineReference", back_populates="reference_images")

class MedicineBatch(Base):
    __tablename__ = "medicine_batches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medicine_id = Column(String(36), ForeignKey("medicine_references.id"), nullable=False)
    batch_number = Column(String(100), index=True, nullable=False)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    status = Column(String(50), default="authorized")  # authorized, recalled, expired, flagged
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    medicine = relationship("MedicineReference", back_populates="batches")
