from app.services.risk_engine import RiskEngine

def test_risk_engine_low_risk():
    image_quality = {"is_blurry": False, "blur_score": 150.0}
    extracted = {
        "medicine_name": "Lipitor",
        "batch_number": "PF9842",
        "expiry_date": "01/2028"
    }
    eval_res = RiskEngine.evaluate(
        image_quality=image_quality,
        extracted_fields=extracted,
        match_type="EXACT_MATCH",
        matched_ref=None,
        matched_batch=None,
        conflicts=[]
    )
    assert eval_res["overall_risk_band"] == "LOW_OBSERVED_RISK"
    assert eval_res["risk_score"] < 25.0

def test_risk_engine_conflicting_critical():
    image_quality = {"is_blurry": False, "blur_score": 120.0}
    extracted = {
        "medicine_name": "Lipitor",
        "batch_number": "PF9842",
        "expiry_date": "01/2028"
    }
    eval_res = RiskEngine.evaluate(
        image_quality=image_quality,
        extracted_fields=extracted,
        match_type="CONFLICTING_INFO",
        matched_ref=None,
        matched_batch=None,
        conflicts=["Manufacturer mismatch between package and FDA registry"]
    )
    assert eval_res["overall_risk_band"] == "ELEVATED_CONCERN"
    assert any(i["severity"] == "critical" for i in eval_res["indicators"])

def test_risk_engine_blurry_analysis_failed():
    image_quality = {"is_blurry": True, "blur_score": 25.0}
    extracted = {}
    eval_res = RiskEngine.evaluate(
        image_quality=image_quality,
        extracted_fields=extracted,
        match_type="NO_REFERENCE_AVAILABLE",
        matched_ref=None,
        matched_batch=None,
        conflicts=[]
    )
    assert eval_res["overall_risk_band"] == "ANALYSIS_FAILED"
