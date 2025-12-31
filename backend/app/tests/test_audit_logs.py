from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.user import User, UserRole

from .test_auth import get_admin_headers


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


def test_audit_logs_created_for_patient_and_appointment_actions(client):
    headers = get_admin_headers(client)
    patient_response = client.post(
        "/api/v1/patients/",
        headers=headers,
        json={"full_name": "Audit Patient", "email": "audit@example.com"},
    )
    patient_id = patient_response.json()["id"]

    appointment_response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient_id,
            "doctor_name": "Dr. Audit",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Scheduled",
        },
    )
    appointment_id = appointment_response.json()["id"]

    client.patch(
        f"/api/v1/appointments/{appointment_id}/cancel", headers=headers
    )

    patient_logs = client.get(
        "/api/v1/audit-logs/?action=patient.create", headers=headers
    )
    assert patient_logs.status_code == 200
    assert len(patient_logs.json()) >= 1

    appointment_logs = client.get(
        "/api/v1/audit-logs/?action=appointment.create", headers=headers
    )
    assert appointment_logs.status_code == 200
    assert len(appointment_logs.json()) >= 1

    cancel_logs = client.get(
        "/api/v1/audit-logs/?action=appointment.cancel", headers=headers
    )
    assert cancel_logs.status_code == 200
    assert len(cancel_logs.json()) >= 1


def test_audit_logs_are_tenant_isolated(client, db_session):
    _create_user(db_session, "admin2@test.com", "admin2pass")
    user1_headers = get_admin_headers(client)
    user2_headers = _login_headers(client, "admin2@test.com", "admin2pass")

    patient_response = client.post(
        "/api/v1/patients/",
        headers=user1_headers,
        json={"full_name": "Tenant Patient", "email": "tenant@example.com"},
    )
    assert patient_response.status_code == 201

    user2_logs = client.get(
        "/api/v1/audit-logs/?action=patient.create", headers=user2_headers
    )
    assert user2_logs.status_code == 200
    assert user2_logs.json() == []


def test_audit_logs_filtering(client):
    headers = get_admin_headers(client)
    patient_response = client.post(
        "/api/v1/patients/",
        headers=headers,
        json={"full_name": "Filter Patient", "email": "filter@example.com"},
    )
    patient_id = patient_response.json()["id"]

    appointment_response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient_id,
            "doctor_name": "Dr. Filter",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "status": "Scheduled",
        },
    )
    assert appointment_response.status_code == 201

    filtered = client.get(
        "/api/v1/audit-logs/?entity_type=patient&action=patient.create",
        headers=headers,
    )
    assert filtered.status_code == 200
    assert all(log["entity_type"] == "patient" for log in filtered.json())
