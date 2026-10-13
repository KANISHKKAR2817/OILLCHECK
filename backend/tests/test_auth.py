def test_register_and_login_flow(client):
    # 1. Register new user
    reg_payload = {
        "email": "newpharmacist@hospital.org",
        "password": "SecurePassword2026!",
        "full_name": "Dr. Emily Chen",
        "role": "pharmacist"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newpharmacist@hospital.org"
    assert data["user"]["role"] == "pharmacist"

    # 2. Duplicate registration should be rejected
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Successful login
    login_payload = {
        "email": "newpharmacist@hospital.org",
        "password": "SecurePassword2026!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 4. Access /me profile
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "newpharmacist@hospital.org"

def test_login_invalid_password(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "testuser@example.com",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401

def test_unauthenticated_profile_access(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
