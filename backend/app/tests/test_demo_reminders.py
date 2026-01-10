from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.audit_log import AuditLog
from app.models.patient import Patient
from app.models.user import User, UserRole

from .test_auth import get_admin_headers


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


def _login_headers(client, email: str, password: str) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_patient(db_session) -> Patient:
    admin = db_session.query(User).first()
    patient = Patient(
        full_name="Reminder Patient",
        email="demo-reminder@example.com",
        phone="555-0202",
        owner_user_id=admin.id,
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient


def test_reminder_fields_only_allowed_for_confirmed_future(client, db_session):
    patient = _create_patient(db_session)
    headers = get_admin_headers(client)
    response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient.id,
            "doctor_name": "Dr. Reminder",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "status": "Unconfirmed",
            "reminder_email_enabled": True,
            "reminder_sms_enabled": True,
            "reminder_email_minutes_before": 720,
            "reminder_sms_minutes_before": 120,
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["reminder_email_enabled"] is False
    assert payload["reminder_sms_enabled"] is False
    assert payload["reminder_next_run_at"] is None


def test_reminder_fields_saved_for_confirmed_future(client, db_session):
    patient = _create_patient(db_session)
    headers = get_admin_headers(client)
    response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient.id,
            "doctor_name": "Dr. Reminder",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "status": "Confirmed",
            "reminder_email_enabled": True,
            "reminder_sms_enabled": True,
            "reminder_email_minutes_before": 720,
            "reminder_sms_minutes_before": 120,
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["reminder_email_enabled"] is True
    assert payload["reminder_sms_enabled"] is True
    assert payload["reminder_next_run_at"] is not None


def test_simulate_reminder_requires_enabled_channels(client, db_session):
    patient = _create_patient(db_session)
    headers = get_admin_headers(client)
    create_response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient.id,
            "doctor_name": "Dr. Reminder",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Confirmed",
        },
    )
    appointment_id = create_response.json()["id"]
    response = client.post(
        f"/api/v1/appointments/{appointment_id}/reminders/simulate", headers=headers
    )
    assert response.status_code == 400


def test_simulate_reminder_logs_audit_entry(client, db_session):
    patient = _create_patient(db_session)
    headers = get_admin_headers(client)
    create_response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient.id,
            "doctor_name": "Dr. Reminder",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Confirmed",
            "reminder_email_enabled": True,
            "reminder_email_minutes_before": 1440,
        },
    )
    appointment_id = create_response.json()["id"]
    response = client.post(
        f"/api/v1/appointments/{appointment_id}/reminders/simulate", headers=headers
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["simulated"] is True

    audit_log = (
        db_session.query(AuditLog)
        .filter(
            AuditLog.action == "appointment.reminder_simulated",
            AuditLog.entity_id == appointment_id,
        )
        .first()
    )
    assert audit_log is not None


def test_simulate_reminder_tenant_isolation(client, db_session):
    _create_user(db_session, "admin2@test.com", "admin2pass")
    user1_headers = _login_headers(client, "admin@test.com", "adminpass")
    user2_headers = _login_headers(client, "admin2@test.com", "admin2pass")

    patient_response = client.post(
        "/api/v1/patients/",
        headers=user1_headers,
        json={"full_name": "Tenant One", "email": "tenant1@example.com"},
    )
    appointment_response = client.post(
        "/api/v1/appointments/",
        headers=user1_headers,
        json={
            "patient_id": patient_response.json()["id"],
            "doctor_name": "Dr. Tenant",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Confirmed",
            "reminder_email_enabled": True,
        },
    )
    appointment_id = appointment_response.json()["id"]

    response = client.post(
        f"/api/v1/appointments/{appointment_id}/reminders/simulate",
        headers=user2_headers,
    )
    assert response.status_code == 404
