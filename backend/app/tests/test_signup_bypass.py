import pytest

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole


def _payload(email: str):
    return {
        "first_name": "Bypass",
        "last_name": "User",
        "email": email,
        "phone": "555-0100",
        "specialty": "Internal Medicine",
        "license_number": "LIC-99999",
        "license_state": "CA",
        "license_country": "USA",
        "npi_number": "1234567890",
        "taxonomy_code": "207R00000X",
        "clinic_name": "Demo Clinic",
        "clinic_address": "1 Demo Street",
        "clinic_city": "San Francisco",
        "clinic_state": "CA",
        "clinic_zip": "94103",
        "clinic_country": "USA",
        "password": "DoctorPass1!",
        "confirm_password": "DoctorPass1!",
    }


def test_signup_bypass_disabled_returns_404(client):
    response = client.post("/api/v1/auth/signup-bypass", json=_payload("off@example.com"))
    assert response.status_code == 404


def test_signup_bypass_creates_user_and_allows_login(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_DEV_AUTH_BYPASS", True)

    response = client.post("/api/v1/auth/signup-bypass", json=_payload("dev@example.com"))
    assert response.status_code == 201
    assert response.json()["user"]["email"] == "dev@example.com"

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "dev@example.com", "password": "DoctorPass1!"},
    )
    assert login.status_code == 200


def test_signup_bypass_enforces_unique_email(client, db_session, monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_DEV_AUTH_BYPASS", True)
    existing = User(
        email="duplicate@example.com",
        hashed_password=get_password_hash("DoctorPass1!"),
        full_name="Duplicate User",
        role=UserRole.admin,
    )
    db_session.add(existing)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/signup-bypass",
        json=_payload("duplicate@example.com"),
    )
    assert response.status_code == 409
