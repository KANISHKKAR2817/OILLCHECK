import os
import io
import pytest
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.api.deps import get_db
from app.core.security import get_password_hash, create_access_token
from app.main import app
from app.models.user import User
from app.seed.seed_data import seed_database

# Use dedicated test sqlite database
TEST_DB_URL = "sqlite:///./test_pillcheck.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    # Seed references into test db
    db = TestingSessionLocal()
    from app.models.medicine import ReferenceSource, MedicineReference, MedicineBatch
    
    src = ReferenceSource(
        name="FDA NDC Test",
        code="US_FDA_NDC",
        source_type="regulatory_authority",
        is_active=True
    )
    db.add(src)
    db.commit()

    ref = MedicineReference(
        product_id="NDC-0069-4200-30",
        brand_name="Lipitor",
        generic_name="Atorvastatin Calcium",
        active_ingredient="Atorvastatin",
        strength="20 mg",
        dosage_form="Tablet",
        manufacturer="Pfizer",
        barcode="300694200305",
        regulatory_id="NDA-020702",
        source_id=src.id,
        version=1,
        is_active=True
    )
    db.add(ref)
    db.commit()

    batch = MedicineBatch(
        medicine_id=ref.id,
        batch_number="PF9842",
        manufacturing_date="01/2024",
        expiry_date="01/2027",
        status="authorized"
    )
    db.add(batch)

    # Add test user and test admin
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("ValidPass123!"),
        full_name="Test Citizen",
        role="user",
        is_active=True,
        is_verified=True
    )
    admin = User(
        email="testadmin@example.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Test Officer",
        role="admin",
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.add(admin)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_pillcheck.db"):
        os.remove("./test_pillcheck.db")

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def user_token(db_session):
    user = db_session.query(User).filter(User.email == "testuser@example.com").first()
    return create_access_token(user.id)

@pytest.fixture
def admin_token(db_session):
    admin = db_session.query(User).filter(User.email == "testadmin@example.com").first()
    return create_access_token(admin.id)

@pytest.fixture
def sample_medicine_image():
    """Generates a synthetic crisp high-contrast medicine packaging test image with clear text."""
    img = Image.new("RGB", (600, 300), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw packaging label text
    draw.rectangle([(20, 20), (580, 280)], outline=(10, 50, 100), width=3)
    draw.text((40, 40), "LIPITOR 20 mg", fill=(0, 0, 0))
    draw.text((40, 80), "Tablets - Atorvastatin Calcium", fill=(30, 30, 30))
    draw.text((40, 120), "Mfd by: Pfizer Pharmaceuticals", fill=(20, 20, 20))
    draw.text((40, 160), "Batch: PF9842", fill=(0, 0, 0))
    draw.text((40, 200), "Mfg: 01/2024   Exp: 01/2027", fill=(0, 0, 0))
    draw.text((40, 240), "Lic: NDA-020702", fill=(0, 0, 0))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    return buf.getvalue()

@pytest.fixture
def sample_blurry_image():
    """Generates a deliberately blurred image to trigger blur detection."""
    img = np.full((300, 400, 3), 200, dtype=np.uint8)
    cv2.putText(img, "Blur Test", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (20, 20, 20), 2)
    # Heavy Gaussian Blur
    blurred = cv2.GaussianBlur(img, (45, 45), 0)
    _, buf = cv2.imencode(".jpg", blurred)
    return buf.tobytes()
