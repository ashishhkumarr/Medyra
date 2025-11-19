from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.patient import Patient
from app.models.user import User, UserRole

from .test_auth import get_admin_headers


def _create_patient(db_session):
    user = User(
        email="appt@test.com",
        hashed_password=get_password_hash("patientpass"),
        full_name="Appointment User",
        role=UserRole.patient,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    patient = Patient(
        user_id=user.id,
        full_name="Appointment User",
        email="appt@test.com",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return user, patient


def test_admin_creates_appointment(client, db_session):
    _, patient = _create_patient(db_session)
    headers = get_admin_headers(client)
    response = client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient.id,
            "doctor_name": "Dr. Adams",
            "department": "Cardiology",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "notes": "Follow-up",
            "status": "Scheduled",
        },
    )
    assert response.status_code == 201
    assert response.json()["doctor_name"] == "Dr. Adams"


def test_patient_sees_own_appointments(client, db_session):
    user, patient = _create_patient(db_session)
    headers = get_admin_headers(client)
    client.post(
        "/api/v1/appointments/",
        headers=headers,
        json={
            "patient_id": patient.id,
            "doctor_name": "Dr. Smith",
            "appointment_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "Scheduled",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": "patientpass"},
    )
    token = login_resp.json()["access_token"]
    response = client.get(
        "/api/v1/appointments/my",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
