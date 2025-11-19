from app.models.user import UserRole


def get_admin_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "adminpass"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "adminpass"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_failure(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_admin_can_register_user(client):
    headers = get_admin_headers(client)
    response = client.post(
        "/api/v1/auth/register",
        headers=headers,
        json={
            "email": "patient@test.com",
            "password": "patientpass",
            "full_name": "Patient",
            "role": UserRole.patient.value,
            "phone": "555-0101",
        },
    )
    assert response.status_code == 201
    assert response.json()["email"] == "patient@test.com"
