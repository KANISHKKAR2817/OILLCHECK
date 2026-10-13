from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.medicine import ReferenceSource, MedicineReference, MedicineBatch

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Seed Default Administrator & Pharmacist
        admin_email = "admin@pillcheck.internal"
        if not db.query(User).filter(User.email == admin_email).first():
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("AdminPillCheck2026!"),
                full_name="Lead Regulatory Admin",
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)

        pharmacist_email = "pharmacist@pillcheck.internal"
        if not db.query(User).filter(User.email == pharmacist_email).first():
            pharmacist_user = User(
                email=pharmacist_email,
                hashed_password=get_password_hash("PharmPillCheck2026!"),
                full_name="Dr. Sarah Jenkins, PharmD",
                role="pharmacist",
                is_active=True,
                is_verified=True
            )
            db.add(pharmacist_user)

        user_email = "demo@pillcheck.internal"
        if not db.query(User).filter(User.email == user_email).first():
            demo_user = User(
                email=user_email,
                hashed_password=get_password_hash("UserPillCheck2026!"),
                full_name="Alex Rivera",
                role="user",
                is_active=True,
                is_verified=True
            )
            db.add(demo_user)

        db.commit()

        # 2. Seed Official Reference Sources with clear Provenance
        fda_source = db.query(ReferenceSource).filter(ReferenceSource.code == "US_FDA_NDC").first()
        if not fda_source:
            fda_source = ReferenceSource(
                name="U.S. FDA National Drug Code (NDC) Directory",
                code="US_FDA_NDC",
                source_type="regulatory_authority",
                url="https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory",
                is_active=True,
                last_synced_at=datetime.utcnow()
            )
            db.add(fda_source)
            db.commit()
            db.refresh(fda_source)

        who_source = db.query(ReferenceSource).filter(ReferenceSource.code == "WHO_EML").first()
        if not who_source:
            who_source = ReferenceSource(
                name="WHO Model Lists of Essential Medicines & Quality Assurance",
                code="WHO_EML",
                source_type="pharmacopeia",
                url="https://www.who.gov/groups/expert-committee-on-selection-and-use-of-essential-medicines",
                is_active=True,
                last_synced_at=datetime.utcnow()
            )
            db.add(who_source)
            db.commit()
            db.refresh(who_source)

        cdsco_source = db.query(ReferenceSource).filter(ReferenceSource.code == "CDSCO_INDIA").first()
        if not cdsco_source:
            cdsco_source = ReferenceSource(
                name="CDSCO Central Drugs Standard Control Organization",
                code="CDSCO_INDIA",
                source_type="regulatory_authority",
                url="https://cdsco.gov.in/",
                is_active=True,
                last_synced_at=datetime.utcnow()
            )
            db.add(cdsco_source)
            db.commit()
            db.refresh(cdsco_source)

        # 3. Seed Verified Medicine References with Provenance
        catalog = [
            {
                "product_id": "NDC-0069-4200-30",
                "brand_name": "Lipitor",
                "generic_name": "Atorvastatin Calcium",
                "active_ingredient": "Atorvastatin Calcium",
                "strength": "20 mg",
                "dosage_form": "Tablet",
                "manufacturer": "Pfizer",
                "country_of_origin": "USA",
                "packaging_desc": "White elliptical film-coated tablets embossed with '20' and 'PD 156'. 30-tablet HDPE bottle with induction-sealed closure.",
                "barcode": "300694200305",
                "regulatory_id": "NDA-020702",
                "source_id": fda_source.id,
                "batches": [
                    {"batch_number": "PF9842", "manufacturing_date": "01/2024", "expiry_date": "01/2027", "status": "authorized"},
                    {"batch_number": "PF1023", "manufacturing_date": "06/2023", "expiry_date": "06/2026", "status": "authorized"},
                    {"batch_number": "PF9999", "manufacturing_date": "01/2022", "expiry_date": "01/2024", "status": "expired"}
                ]
            },
            {
                "product_id": "NDC-0029-6085-12",
                "brand_name": "Augmentin",
                "generic_name": "Amoxicillin and Clavulanate Potassium",
                "active_ingredient": "Amoxicillin / Clavulanate",
                "strength": "625 mg",
                "dosage_form": "Tablet",
                "manufacturer": "GlaxoSmithKline",
                "country_of_origin": "United Kingdom",
                "packaging_desc": "Aluminium/aluminium blister strips of 10 tablets with moisture desiccant foil and printed GSK logo.",
                "barcode": "300296085121",
                "regulatory_id": "NDA-050564",
                "source_id": fda_source.id,
                "batches": [
                    {"batch_number": "GSK4012", "manufacturing_date": "03/2024", "expiry_date": "03/2026", "status": "authorized"},
                    {"batch_number": "GSK8810", "manufacturing_date": "09/2023", "expiry_date": "09/2025", "status": "authorized"},
                    {"batch_number": "BAD8890", "manufacturing_date": "01/2024", "expiry_date": "01/2026", "status": "recalled"}
                ]
            },
            {
                "product_id": "CDSCO-MFG-CIP-500",
                "brand_name": "Ciplox",
                "generic_name": "Ciprofloxacin Hydrochloride",
                "active_ingredient": "Ciprofloxacin",
                "strength": "500 mg",
                "dosage_form": "Tablet",
                "manufacturer": "Cipla",
                "country_of_origin": "India",
                "packaging_desc": "PVC/PVDC aluminum blister foil pack of 10 scored tablets with security hologram on carton.",
                "barcode": "890111700201",
                "regulatory_id": "MFG/DL/2019/8821",
                "source_id": cdsco_source.id,
                "batches": [
                    {"batch_number": "CP5001", "manufacturing_date": "02/2024", "expiry_date": "01/2027", "status": "authorized"},
                    {"batch_number": "CP5002", "manufacturing_date": "05/2024", "expiry_date": "04/2027", "status": "authorized"}
                ]
            },
            {
                "product_id": "NDC-0069-4210-66",
                "brand_name": "Zithromax",
                "generic_name": "Azithromycin",
                "active_ingredient": "Azithromycin Dihydrate",
                "strength": "250 mg",
                "dosage_form": "Capsule",
                "manufacturer": "Pfizer",
                "country_of_origin": "USA",
                "packaging_desc": "Z-Pak 6-tablet unit dose blister pack with custom daily dosing schedule card.",
                "barcode": "300694210664",
                "regulatory_id": "NDA-050670",
                "source_id": fda_source.id,
                "batches": [
                    {"batch_number": "ZT9021", "manufacturing_date": "04/2024", "expiry_date": "04/2027", "status": "authorized"}
                ]
            },
            {
                "product_id": "CDSCO-SUN-PAN40",
                "brand_name": "Pan 40",
                "generic_name": "Pantoprazole Sodium Gastro-resistant",
                "active_ingredient": "Pantoprazole",
                "strength": "40 mg",
                "dosage_form": "Tablet",
                "manufacturer": "Sun Pharma",
                "country_of_origin": "India",
                "packaging_desc": "Golden aluminum-aluminum blister strip with 15 enteric-coated tablets.",
                "barcode": "890123456789",
                "regulatory_id": "MFG/2021/SP40",
                "source_id": cdsco_source.id,
                "batches": [
                    {"batch_number": "PN4088", "manufacturing_date": "01/2024", "expiry_date": "12/2026", "status": "authorized"}
                ]
            },
            {
                "product_id": "WHO-PARA-500",
                "brand_name": "Dolo 650",
                "generic_name": "Paracetamol Tablets IP",
                "active_ingredient": "Paracetamol",
                "strength": "650 mg",
                "dosage_form": "Tablet",
                "manufacturer": "Micro Labs",
                "country_of_origin": "India",
                "packaging_desc": "White and orange blister strip containing 15 caplet-shaped tablets.",
                "barcode": "890114820102",
                "regulatory_id": "MFG/ML/PAR-650",
                "source_id": who_source.id,
                "batches": [
                    {"batch_number": "DL6501", "manufacturing_date": "06/2024", "expiry_date": "05/2027", "status": "authorized"}
                ]
            }
        ]

        for item in catalog:
            existing = db.query(MedicineReference).filter(MedicineReference.product_id == item["product_id"]).first()
            if not existing:
                batches_data = item.pop("batches")
                med = MedicineReference(**item)
                db.add(med)
                db.commit()
                db.refresh(med)

                for b in batches_data:
                    batch_record = MedicineBatch(
                        medicine_id=med.id,
                        batch_number=b["batch_number"],
                        manufacturing_date=b["manufacturing_date"],
                        expiry_date=b["expiry_date"],
                        status=b["status"]
                    )
                    db.add(batch_record)
                db.commit()

        print("PillCheck database successfully initialized with verified regulatory reference records and admin users.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
