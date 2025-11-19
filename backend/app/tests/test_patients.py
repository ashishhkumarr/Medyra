from datetime import date

from app.core.security import get_password_hash
from app.models.patient import Patient
from app.models.user import User, UserRole

from .test_auth import get_admin_headers


def test_admin_can_create_patient(client):
    headers = get_admin_headers(client)
    response = client.post(
        "/api/v1/patients/",
        headers=headers,
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "555-1234",
            "medical_history": "Asthma",
        },
    )
    assert response.status_code == 201
    assert response.json()["full_name"] == "Jane Doe"


def test_patient_can_view_self(client, db_session):
    patient_user = User(
        email="self@test.com",
        hashed_password=get_password_hash("patientpass"),
        full_name="Self User",
        role=UserRole.patient,
    )
    db_session.add(patient_user)
    db_session.commit()
    db_session.refresh(patient_user)
    patient = Patient(
        user_id=patient_user.id,
        full_name="Self User",
        date_of_birth=date(1990, 1, 1),
        email="self@test.com",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "self@test.com", "password": "patientpass"},
    )
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}
    response = client.get(f"/api/v1/patients/{patient.id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "self@test.com"
