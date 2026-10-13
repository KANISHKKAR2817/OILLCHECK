def test_admin_health_and_permissions(client, user_token, admin_token):
    # Non-admin user receives 403 Forbidden
    res_forbidden = client.get("/api/v1/admin/health", headers={"Authorization": f"Bearer {user_token}"})
    assert res_forbidden.status_code == 403

    # Admin receives 200 OK with health status
    res_ok = client.get("/api/v1/admin/health", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_ok.status_code == 200
    health_data = res_ok.json()
    assert health_data["database_connected"] is True
    assert health_data["cv_pipeline_ready"] is True
    assert health_data["storage_writable"] is True

def test_admin_csv_import_flow(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    csv_content = (
        "product_id,brand_name,generic_name,active_ingredient,strength,dosage_form,manufacturer,barcode\n"
        "TEST-NDC-101,TestAmox,Amoxicillin,Amoxicillin,500 mg,Capsule,Sandoz,890987654321\n"
        "TEST-NDC-102,TestMet,Metformin,Metformin HCl,850 mg,Tablet,Merck,890987654322\n"
    )

    # 1. Preview CSV
    preview_res = client.post(
        "/api/v1/admin/references/preview-csv",
        headers=headers,
        files={"file": ("test_import.csv", csv_content.encode("utf-8"), "text/csv")}
    )
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert preview_data["total_rows"] == 2
    assert preview_data["valid_rows"] == 2

    # 2. Commit CSV
    commit_res = client.post(
        "/api/v1/admin/references/commit-csv",
        headers=headers,
        files={"file": ("test_import.csv", csv_content.encode("utf-8"), "text/csv")}
    )
    assert commit_res.status_code == 200
    assert "Successfully imported 2 medicine reference records" in commit_res.json()["message"]
