from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dateutil import parser
from app.models.medicine import MedicineReference, MedicineBatch

class RiskEngine:
    ENGINE_VERSION = "2.1.0"

    @classmethod
    def evaluate(
        cls,
        image_quality: Dict[str, Any],
        extracted_fields: Dict[str, Any],
        match_type: str,
        matched_ref: Optional[MedicineReference],
        matched_batch: Optional[MedicineBatch],
        conflicts: List[str],
        visual_similarity_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes explainable risk rules and computes overall risk status band and indicator score.
        """
        indicators = []
        indicator_points = 0.0  # Higher points = elevated screening concern

        is_blurry = image_quality.get("is_blurry", False)
        blur_score = image_quality.get("blur_score", 100.0)

        # RULE 1: Image Quality Assessment
        if is_blurry:
            indicator_points += 25.0
            indicators.append({
                "code": "WARN_IMAGE_BLURRY",
                "title": "Degraded Image Sharpness Detected",
                "severity": "warning",
                "description": "Image sharpness is below the recommended threshold (Laplacian score < 80). OCR accuracy and fine packaging details may be compromised.",
                "evidence": f"Measured sharpness score: {blur_score:.1f}. Recommended minimum: 80.0.",
                "mitigation_guidance": "Retake photo in bright, indirect light ensuring medicine text and logos are sharply focused."
            })

        # RULE 2: Reference Match Assessment
        if match_type == "CONFLICTING_INFO":
            indicator_points += 60.0
            reasons_text = "; ".join(conflicts) if conflicts else "Packaging information contradicts official regulatory registration."
            indicators.append({
                "code": "CRIT_CONFLICTING_REFERENCE",
                "title": "Material Inconsistency with Reference Registry",
                "severity": "critical",
                "description": "Information printed on packaging directly conflicts with trusted regulatory reference data.",
                "evidence": reasons_text,
                "mitigation_guidance": "Do not consume or dispense this product until verified with the manufacturer or a licensed pharmacist."
            })
        elif match_type == "NO_REFERENCE_AVAILABLE":
            indicator_points += 20.0
            indicators.append({
                "code": "INFO_NO_REFERENCE_DATA",
                "title": "No Direct Database Reference Found",
                "severity": "info",
                "description": "This medicine is not yet catalogued in PillCheck's configured reference databases.",
                "evidence": "Search query did not return an exact or fuzzy match in local regulatory tables.",
                "mitigation_guidance": "Check national drug registry or consult your local pharmacist. Unregistered in local catalog does not imply counterfeit."
            })
        elif match_type == "PARTIAL_MATCH":
            indicator_points += 10.0
            matched_name = matched_ref.brand_name if matched_ref else "Catalog Reference"
            matched_mfr = f" ({matched_ref.manufacturer})" if matched_ref else ""
            indicators.append({
                "code": "INFO_PARTIAL_REFERENCE_MATCH",
                "title": "Partial Reference Record Match",
                "severity": "info",
                "description": f"Found plausible reference match '{matched_name}'{matched_mfr}, but some secondary fields require confirmation.",
                "evidence": f"Matched product ID: {matched_ref.product_id if matched_ref else 'N/A'}.",
                "mitigation_guidance": "Review and confirm extracted dosage form and strength against packaging."
            })
        elif match_type == "EXACT_MATCH":
            matched_name = matched_ref.brand_name if matched_ref else "Verified Formulary"
            matched_mfr = f" by {matched_ref.manufacturer}" if matched_ref else ""
            indicators.append({
                "code": "INFO_EXACT_REFERENCE_MATCH",
                "title": "Exact Reference Match Verified",
                "severity": "info",
                "description": f"Product name and manufacturer align with official record '{matched_name}'{matched_mfr}.",
                "evidence": f"Regulatory ID / Product ID: {matched_ref.product_id if matched_ref else 'Verified'}. Active ingredient: {matched_ref.active_ingredient if matched_ref else 'Verified'}.",
                "mitigation_guidance": "Cross-check batch number and tamper-evident packaging seals."
            })

        # RULE 3: Expiry Date Validation
        exp_date_str = extracted_fields.get("expiry_date")
        if exp_date_str:
            try:
                # Attempt flexible date parsing
                # Normalize common formats like 05/26 to 05/2026
                cleaned_exp = exp_date_str.strip()
                if "/" in cleaned_exp:
                    parts = cleaned_exp.split("/")
                    if len(parts) == 2 and len(parts[1]) == 2:
                        cleaned_exp = f"{parts[0]}/20{parts[1]}"
                
                parsed_exp = parser.parse(cleaned_exp, fuzzy=True, default=datetime(2026, 1, 1))
                if parsed_exp < datetime.utcnow():
                    indicator_points += 35.0
                    indicators.append({
                        "code": "CRIT_EXPIRED_PRODUCT",
                        "title": "Product Past Stated Expiration Date",
                        "severity": "critical",
                        "description": "The printed expiry date indicates that this medicine has expired.",
                        "evidence": f"Extracted expiry: '{exp_date_str}' (parsed as {parsed_exp.strftime('%B %Y')}). Current date: {datetime.utcnow().strftime('%B %Y')}.",
                        "mitigation_guidance": "Do not consume expired medications. Dispose safely according to local pharmacy guidelines."
                    })
            except Exception:
                indicator_points += 10.0
                indicators.append({
                    "code": "WARN_DATE_PARSE_UNCERTAIN",
                    "title": "Non-Standard Expiry Date Format",
                    "severity": "warning",
                    "description": f"The extracted expiry date '{exp_date_str}' could not be unambiguously parsed.",
                    "evidence": f"Raw string: {exp_date_str}",
                    "mitigation_guidance": "Manually verify the printed expiry date on blister foil or carton."
                })
        else:
            indicator_points += 15.0
            indicators.append({
                "code": "WARN_MISSING_EXPIRY",
                "title": "No Legible Expiry Date Detected",
                "severity": "warning",
                "description": "Legitimate pharmaceutical packaging typically requires a legible expiration date.",
                "evidence": "OCR did not identify a clear EXP or Expiry field on the scanned surface.",
                "mitigation_guidance": "Scan the packaging flap or blister end where expiry stamps are commonly embossed."
            })

        # RULE 4: Batch Number Check
        batch_str = extracted_fields.get("batch_number")
        if not batch_str:
            indicator_points += 15.0
            indicators.append({
                "code": "WARN_MISSING_BATCH",
                "title": "Missing or Unreadable Batch Number",
                "severity": "warning",
                "description": "Batch / Lot identifier could not be extracted from the uploaded image.",
                "evidence": "No B.No or Lot # identified.",
                "mitigation_guidance": "Ensure the crimped edge or printed side panel of the blister/box is captured."
            })
        else:
            if matched_batch and matched_batch.status == "authorized":
                indicators.append({
                    "code": "INFO_AUTHORIZED_BATCH",
                    "title": "Authorized Batch Record Found",
                    "severity": "info",
                    "description": f"Batch '{batch_str}' matches an authorized manufacturing lot on record.",
                    "evidence": f"Status: {matched_batch.status}.",
                    "mitigation_guidance": "Confirm package seals remain intact."
                })

        # RULE 5: Visual Packaging Comparison
        if visual_similarity_score is not None:
            if visual_similarity_score < 40.0:
                indicator_points += 20.0
                indicators.append({
                    "code": "WARN_VISUAL_DIVERGENCE",
                    "title": "Visual Packaging Divergence Detected",
                    "severity": "warning",
                    "description": "Computer vision structural and color comparison detected observable divergence from standard reference packaging.",
                    "evidence": f"Visual correlation score: {visual_similarity_score:.1f}% (threshold: 40%).",
                    "mitigation_guidance": "Check whether this is an imported packaging variant, regional repackage, or new manufacturer carton redesign."
                })
            else:
                indicators.append({
                    "code": "INFO_VISUAL_CONSISTENT",
                    "title": "Packaging Visuals Consistent with Reference",
                    "severity": "info",
                    "description": "Packaging color distribution and structural keypoints correlate favorably with approved reference photograph.",
                    "evidence": f"Similarity score: {visual_similarity_score:.1f}%.",
                    "mitigation_guidance": "Standard inspection advice applies."
                })

        # Calculate final indicator score (0 to 100)
        final_risk_score = min(100.0, round(indicator_points, 1))

        # Assign Risk Band
        if is_blurry and not extracted_fields.get("medicine_name"):
            overall_band = "ANALYSIS_FAILED"
            summary = "Image quality was too degraded to extract essential medicine information. Please re-scan with better focus."
        elif any(i["severity"] == "critical" for i in indicators) or final_risk_score >= 45.0:
            overall_band = "ELEVATED_CONCERN"
            summary = "One or more material inconsistencies or suspicious indicators were identified. Further formal verification is strongly recommended."
        elif final_risk_score >= 20.0 or match_type in ["NO_REFERENCE_AVAILABLE", "PARTIAL_MATCH"]:
            overall_band = "NEEDS_VERIFICATION"
            summary = "Initial screening noted missing reference records or fields that require manual review before confidence can be established."
        else:
            overall_band = "LOW_OBSERVED_RISK"
            summary = "No configured warning indicators were identified in the available packaging details. (Note: Screening does not confirm absolute authenticity)."

        return {
            "overall_risk_band": overall_band,
            "risk_score": final_risk_score,
            "summary": summary,
            "indicators": indicators,
            "engine_version": cls.ENGINE_VERSION
        }
