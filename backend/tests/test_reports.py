def test_suspicious_report_creation_and_admin_review(client, user_token, admin_token):
    # 1. User submits report
    user_headers = {"Authorization": f"Bearer {user_token}"}
    report_payload = {
        "medicine_name": "Suspicious Augmentin 625mg",
        "batch_number": "FAKE1009",
        "manufacturer": "Disputed Pharma",
        "purchase_location": "Unauthorized street stall",
        "purchase_date": "2026-10-10",
        "concern_description": "Packaging blister had peeling foil, spelling mistake in brand name, and bitter taste."
    }
    create_res = client.post("/api/v1/reports", headers=user_headers, json=report_payload)
    assert create_res.status_code == 201
    rep_data = create_res.json()
    assert rep_data["report_number"].startswith("PC-REP-")
    assert rep_data["status"] == "submitted"
    report_id = rep_data["id"]

    # 2. Admin reviews report and changes status
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_patch = client.patch(
        f"/api/v1/admin/reports/{report_id}",
        headers=admin_headers,
        json={
            "status": "referred_to_authority",
            "admin_notes": "Referred physical packaging sample to national regulatory enforcement division."
        }
    )
    assert admin_patch.status_code == 200
    assert admin_patch.json()["status"] == "referred_to_authority"
    assert "referred physical packaging sample" in admin_patch.json()["admin_notes"].lower()

    # 3. User can see their updated report status
    user_view = client.get(f"/api/v1/reports/{report_id}", headers=user_headers)
    assert user_view.status_code == 200
    assert user_view.json()["status"] == "referred_to_authority"
