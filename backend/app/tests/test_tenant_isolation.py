from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.user import User, UserRole


def _login_headers(client, email: str, password: str) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_user(db_session, email: str, password: str) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name="Secondary Admin",
        role=UserRole.admin,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_user2_cannot_access_user1_patient(client, db_session):
    _create_user(db_session, "admin2@test.com", "admin2pass")
    user1_headers = _login_headers(client, "admin@test.com", "adminpass")
    user2_headers = _login_headers(client, "admin2@test.com", "admin2pass")

    create_response = client.post(
        "/api/v1/patients/",
        headers=user1_headers,
        json={"full_name": "Tenant One", "email": "tenant1@example.com"},
    )
    assert create_response.status_code == 201
    patient_id = create_response.json()["id"]

    list_response = client.get("/api/v1/patients/", headers=user2_headers)
    assert list_response.status_code == 200
    assert list_response.json() == []

    get_response = client.get(f"/api/v1/patients/{patient_id}", headers=user2_headers)
    assert get_response.status_code == 404

    update_response = client.patch(
        f"/api/v1/patients/{patient_id}",
        headers=user2_headers,
        json={"notes": "Attempted edit"},
    )
    assert update_response.status_code == 404

    delete_response = client.delete(
        f"/api/v1/patients/{patient_id}", headers=user2_headers
    )
    assert delete_response.status_code == 404


def test_user2_cannot_access_user1_appointments(client, db_session):
    _create_user(db_session, "admin2@test.com", "admin2pass")
    user1_headers = _login_headers(client, "admin@test.com", "adminpass")
    user2_headers = _login_headers(client, "admin2@test.com", "admin2pass")

    patient_response = client.post(
        "/api/v1/patients/",
        headers=user1_headers,
        json={"full_name": "Tenant One", "email": "tenant1@example.com"},
    )
    patient_id = patient_response.json()["id"]

    create_response = client.post(
        "/api/v1/appointments/",
        headers=user1_headers,
        json={
            "patient_id": patient_id,
            "doctor_name": "Dr. Tenant",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Scheduled",
        },
    )
    assert create_response.status_code == 201
    appointment_id = create_response.json()["id"]

    list_response = client.get("/api/v1/appointments/", headers=user2_headers)
    assert list_response.status_code == 200
    assert list_response.json() == []

    update_response = client.patch(
        f"/api/v1/appointments/{appointment_id}",
        headers=user2_headers,
        json={"notes": "Attempted edit"},
    )
    assert update_response.status_code == 404

    cancel_response = client.patch(
        f"/api/v1/appointments/{appointment_id}/cancel",
        headers=user2_headers,
    )
    assert cancel_response.status_code == 404

    delete_response = client.delete(
        f"/api/v1/appointments/{appointment_id}",
        headers=user2_headers,
    )
    assert delete_response.status_code == 404


def test_cannot_create_appointment_with_other_users_patient(client, db_session):
    _create_user(db_session, "admin2@test.com", "admin2pass")
    user1_headers = _login_headers(client, "admin@test.com", "adminpass")
    user2_headers = _login_headers(client, "admin2@test.com", "admin2pass")

    patient_response = client.post(
        "/api/v1/patients/",
        headers=user1_headers,
        json={"full_name": "Tenant One", "email": "tenant1@example.com"},
    )
    patient_id = patient_response.json()["id"]

    response = client.post(
        "/api/v1/appointments/",
        headers=user2_headers,
        json={
            "patient_id": patient_id,
            "doctor_name": "Dr. Tenant",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Scheduled",
        },
    )
    assert response.status_code == 404
