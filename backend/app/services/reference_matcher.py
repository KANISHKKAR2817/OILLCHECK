import difflib
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from app.models.medicine import MedicineReference, MedicineBatch

class ReferenceMatcher:
    @staticmethod
    def match_fields(
        db: Session,
        extracted_fields: Dict[str, Any]
    ) -> Tuple[str, Optional[MedicineReference], Optional[MedicineBatch], List[str]]:
        """
        Matches extracted fields against configured medicine references in the database.
        Returns:
            (match_type, matched_reference, matched_batch, conflicting_reasons)
        Match types:
            EXACT_MATCH, PARTIAL_MATCH, CONFLICTING_INFO, NO_REFERENCE_AVAILABLE
        """
        medicine_name = extracted_fields.get("medicine_name") or extracted_fields.get("brand_name")
        manufacturer = extracted_fields.get("manufacturer")
        barcode = extracted_fields.get("barcode")
        batch_number = extracted_fields.get("batch_number")
        regulatory_id = extracted_fields.get("regulatory_id")

        conflicting_reasons = []

        # 1. Exact Barcode / Product ID lookup
        matched_ref = None
        if barcode:
            matched_ref = db.query(MedicineReference).filter(
                (MedicineReference.barcode == barcode) | (MedicineReference.product_id == barcode)
            ).first()

        if not matched_ref and regulatory_id:
            matched_ref = db.query(MedicineReference).filter(
                MedicineReference.regulatory_id == regulatory_id
            ).first()

        # 2. Name search if not yet found
        all_refs = db.query(MedicineReference).filter(MedicineReference.is_active == True).all()
        if not matched_ref and medicine_name:
            med_clean = medicine_name.strip().lower()
            
            # Exact string check
            for ref in all_refs:
                if (ref.brand_name.lower() == med_clean or 
                    ref.generic_name.lower() == med_clean or 
                    med_clean in ref.brand_name.lower() or 
                    ref.brand_name.lower() in med_clean):
                    matched_ref = ref
                    break

            # Fuzzy name check if still not found
            if not matched_ref:
                best_score = 0.0
                best_ref = None
                for ref in all_refs:
                    score1 = difflib.SequenceMatcher(None, med_clean, ref.brand_name.lower()).ratio()
                    score2 = difflib.SequenceMatcher(None, med_clean, ref.generic_name.lower()).ratio()
                    max_score = max(score1, score2)
                    if max_score > best_score:
                        best_score = max_score
                        best_ref = ref
                
                if best_score >= 0.72:
                    matched_ref = best_ref

        if not matched_ref:
            return "NO_REFERENCE_AVAILABLE", None, None, []

        # 3. Check for Conflicts
        is_conflicting = False
        if manufacturer:
            mfr_clean = manufacturer.strip().lower()
            ref_mfr_clean = matched_ref.manufacturer.strip().lower()
            mfr_sim = difflib.SequenceMatcher(None, mfr_clean, ref_mfr_clean).ratio()
            # If completely disparate manufacturer names
            if mfr_sim < 0.45 and mfr_clean not in ref_mfr_clean and ref_mfr_clean not in mfr_clean:
                is_conflicting = True
                conflicting_reasons.append(
                    f"Extracted manufacturer '{manufacturer}' does not match official registered manufacturer '{matched_ref.manufacturer}'."
                )

        # 4. Check Batch Number against authoritative records if batch exists
        matched_batch = None
        if batch_number:
            matched_batch = db.query(MedicineBatch).filter(
                MedicineBatch.medicine_id == matched_ref.id,
                MedicineBatch.batch_number == batch_number
            ).first()

            if matched_batch and matched_batch.status in ["recalled", "flagged"]:
                is_conflicting = True
                conflicting_reasons.append(
                    f"Batch '{batch_number}' is marked as {matched_batch.status.upper()} in the regulatory authority batch database."
                )

        if is_conflicting:
            return "CONFLICTING_INFO", matched_ref, matched_batch, conflicting_reasons

        # Exact vs Partial
        if medicine_name and matched_ref.brand_name.lower() == medicine_name.strip().lower() and (not manufacturer or not conflicting_reasons):
            return "EXACT_MATCH", matched_ref, matched_batch, []

        return "PARTIAL_MATCH", matched_ref, matched_batch, []
