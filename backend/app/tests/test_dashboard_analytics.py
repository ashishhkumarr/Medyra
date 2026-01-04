from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User, UserRole

from .test_auth import get_admin_headers


def _create_user(db_session, email: str, password: str) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=email.split("@")[0].title(),
        role=UserRole.admin,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _login_headers(client, email: str, password: str) -> dict:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_analytics_requires_auth(client):
    response = client.get("/api/v1/dashboard/analytics")
    assert response.status_code in {401, 403}


def test_dashboard_analytics_tenant_isolation(client, db_session):
    admin = db_session.query(User).filter(User.email == "admin@test.com").first()
    other_user = _create_user(db_session, "other@test.com", "otherpass")

    patient = Patient(
        full_name="Tenant Patient",
        owner_user_id=admin.id,
        created_at=datetime.utcnow() - timedelta(days=2),
    )
    db_session.add(patient)
    db_session.commit()

    appointment = Appointment(
        patient_id=patient.id,
        owner_user_id=admin.id,
        doctor_name="Dr. Tenant",
        appointment_datetime=datetime.utcnow() + timedelta(days=1),
        status=AppointmentStatus.scheduled,
    )
    db_session.add(appointment)
    db_session.commit()

    headers_other = _login_headers(client, other_user.email, "otherpass")
    response = client.get("/api/v1/dashboard/analytics", headers=headers_other)
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["totalPatients"] == 0
    assert data["kpis"]["appointmentsToday"] == 0
    assert data["kpis"]["upcomingAppointments7d"] == 0
    assert data["kpis"]["newPatients30d"] == 0


def test_dashboard_analytics_zero_fill_buckets(client):
    headers = get_admin_headers(client)
    response = client.get("/api/v1/dashboard/analytics", headers=headers)
    assert response.status_code == 200
    payload = response.json()
    appointments_by_day = payload["trends"]["appointmentsByDay30d"]
    new_patients_by_week = payload["trends"]["newPatientsByWeek12w"]

    assert len(appointments_by_day) == 30
    assert all(item["count"] == 0 for item in appointments_by_day)
    assert len(new_patients_by_week) == 12
    assert all(item["count"] == 0 for item in new_patients_by_week)
