from app.core.config import settings
from app.models.appointment import Appointment
from app.models.patient import Patient


def _get_admin_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "adminpass"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_seed_demo_requires_auth(client, monkeypatch):
    monkeypatch.setattr(settings, "DEMO_MODE", True)
    response = client.post("/api/v1/admin/seed-demo")
    assert response.status_code == 401


def test_seed_demo_idempotent(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "DEMO_MODE", True)
    headers = _get_admin_headers(client)

    first = client.post("/api/v1/admin/seed-demo", headers=headers)
    assert first.status_code == 200

    patients_count = db_session.query(Patient).count()
    appointments_count = db_session.query(Appointment).count()

    second = client.post("/api/v1/admin/seed-demo", headers=headers)
    assert second.status_code == 200

    assert db_session.query(Patient).count() == patients_count
    assert db_session.query(Appointment).count() == appointments_count
