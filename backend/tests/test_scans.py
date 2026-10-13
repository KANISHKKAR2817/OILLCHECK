import io

def test_full_scan_pipeline_and_ocr_correction(client, user_token, sample_medicine_image):
    headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Upload scan
    response = client.post(
        "/api/v1/scans",
        headers=headers,
        data={"scan_mode": "upload"},
        files={"image": ("test_package.jpg", sample_medicine_image, "image/jpeg")}
    )
    assert response.status_code == 201
    scan_data = response.json()
    scan_id = scan_data["id"]
    assert scan_data["status"] == "completed"
    assert "overall_risk_band" in scan_data
    assert len(scan_data["images"]) >= 1
    assert scan_data["ocr_result"] is not None

    # 2. Get scan detail by ID
    get_res = client.get(f"/api/v1/scans/{scan_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == scan_id

    # 3. User OCR Field Correction Workflow
    corrections = {
        "corrections": [
            {"field_name": "medicine_name", "corrected_value": "Lipitor"},
            {"field_name": "manufacturer", "corrected_value": "Pfizer"},
            {"field_name": "batch_number", "corrected_value": "PF9842"},
            {"field_name": "expiry_date", "corrected_value": "01/2027"}
        ]
    }
    patch_res = client.patch(
        f"/api/v1/scans/{scan_id}/ocr-fields",
        headers=headers,
        json=corrections
    )
    assert patch_res.status_code == 200
    patched_scan = patch_res.json()
    assert patched_scan["overall_risk_band"] == "LOW_OBSERVED_RISK"

    # Confirm original field was NOT deleted, but marked as user-corrected
    med_field = next(f for f in patched_scan["ocr_result"]["fields"] if f["field_name"] == "medicine_name")
    assert med_field["is_user_corrected"] is True
    assert med_field["effective_value"] == "Lipitor"

def test_scan_access_boundary_rejection(client, sample_medicine_image, user_token):
    # Create scan for user 1
    res = client.post(
        "/api/v1/scans",
        headers={"Authorization": f"Bearer {user_token}"},
        data={"scan_mode": "upload"},
        files={"image": ("test_package.jpg", sample_medicine_image, "image/jpeg")}
    )
    scan_id = res.json()["id"]

    # Register user 2
    client.post("/api/v1/auth/register", json={
        "email": "intruder@domain.com",
        "password": "Password123!",
        "full_name": "Intruder"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": "intruder@domain.com",
        "password": "Password123!"
    })
    intruder_token = login_res.json()["access_token"]

    # Intruder tries to access user 1's scan
    forbidden_res = client.get(f"/api/v1/scans/{scan_id}", headers={"Authorization": f"Bearer {intruder_token}"})
    assert forbidden_res.status_code == 403
