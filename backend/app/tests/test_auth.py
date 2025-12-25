from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.signup_otp import SignupOtp
from app.models.user import User, UserRole
from app.api.v1 import auth as auth_routes


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
            "phone": "555-0101",
        },
    )
    assert response.status_code == 201
    assert response.json()["email"] == "patient@test.com"
    assert response.json()["role"] == UserRole.admin.value


def _signup_payload(email: str, otp: str | None = None):
    return {
        "first_name": "Dana",
        "last_name": "Scully",
        "email": email,
        "phone": "555-2020",
        "specialty": "Internal Medicine",
        "license_number": "LIC-12345",
        "license_state": "CA",
        "license_country": "USA",
        "npi_number": "1234567890",
        "taxonomy_code": "207R00000X",
        "clinic_name": "MediTrack Clinic",
        "clinic_address": "123 Market St",
        "clinic_city": "San Francisco",
        "clinic_state": "CA",
        "clinic_zip": "94103",
        "clinic_country": "USA",
        "password": "DoctorPass1!",
        "confirm_password": "DoctorPass1!",
        **({"otp": otp} if otp else {}),
    }


def test_signup_request_otp_creates_record_and_sends_email(client, db_session, monkeypatch):
    sent = []

    def fake_send_email(to, subject, html_body, text_body=None):
        sent.append({"to": to, "subject": subject})

    monkeypatch.setattr(auth_routes, "send_email", fake_send_email)

    response = client.post(
        "/api/v1/auth/signup/request-otp", json={"email": "newdoc@example.com"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "OTP sent"

    record = db_session.query(SignupOtp).filter(SignupOtp.email == "newdoc@example.com").first()
    assert record is not None
    assert sent


def test_verify_otp_creates_user_and_deletes_record(client, db_session):
    otp_code = "123456"
    email = "verified@example.com"
    record = SignupOtp(
        email=email,
        otp_hash=get_password_hash(otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=5),
    )
    db_session.add(record)
    db_session.commit()

    response = client.post("/api/v1/auth/signup/verify-otp", json=_signup_payload(email, otp_code))
    assert response.status_code == 201
    assert response.json()["user"]["email"] == email

    user = db_session.query(User).filter(User.email == email).first()
    assert user is not None
    otp_record = db_session.query(SignupOtp).filter(SignupOtp.email == email).first()
    assert otp_record is None


def test_verify_otp_wrong_code_increments_attempts_and_blocks(client, db_session):
    email = "attempts@example.com"
    otp_code = "654321"
    record = SignupOtp(
        email=email,
        otp_hash=get_password_hash(otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=5),
    )
    db_session.add(record)
    db_session.commit()

    for attempt in range(4):
        response = client.post(
            "/api/v1/auth/signup/verify-otp",
            json=_signup_payload(email, "000000"),
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid verification code."
        db_session.refresh(record)
        assert record.attempts == attempt + 1

    final_response = client.post(
        "/api/v1/auth/signup/verify-otp",
        json=_signup_payload(email, "000000"),
    )
    assert final_response.status_code == 400
    assert final_response.json()["detail"] == "Too many attempts. Request a new code."

    otp_record = db_session.query(SignupOtp).filter(SignupOtp.email == email).first()
    assert otp_record is None


def test_verify_otp_rejects_expired_code(client, db_session):
    email = "expired@example.com"
    record = SignupOtp(
        email=email,
        otp_hash=get_password_hash("123456"),
        expires_at=datetime.utcnow() - timedelta(minutes=1),
    )
    db_session.add(record)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/signup/verify-otp",
        json=_signup_payload(email, "123456"),
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Verification code expired. Request a new code."

    otp_record = db_session.query(SignupOtp).filter(SignupOtp.email == email).first()
    assert otp_record is None


def test_signup_request_otp_cooldown_blocks_rapid_resend(client, monkeypatch):
    def fake_send_email(*args, **kwargs):
        return None

    monkeypatch.setattr(auth_routes, "send_email", fake_send_email)

    first = client.post(
        "/api/v1/auth/signup/request-otp", json={"email": "cooldown@example.com"}
    )
    assert first.status_code == 200

    second = client.post(
        "/api/v1/auth/signup/request-otp", json={"email": "cooldown@example.com"}
    )
    assert second.status_code == 429


def test_change_password_success(client):
    headers = get_admin_headers(client)
    resp = client.post(
        "/api/v1/users/change-password",
        headers=headers,
        json={
            "old_password": "adminpass",
            "new_password": "NewStrongPass1!",
            "confirm_new_password": "NewStrongPass1!",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["detail"] == "Password updated successfully"

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "NewStrongPass1!"},
    )
    assert login_resp.status_code == 200


def test_change_password_wrong_old_password(client):
    headers = get_admin_headers(client)
    resp = client.post(
        "/api/v1/users/change-password",
        headers=headers,
        json={
            "old_password": "wrongpass",
            "new_password": "AnotherPass1!",
            "confirm_new_password": "AnotherPass1!",
        },
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Old password is incorrect"


def test_change_password_accepts_put(client):
    headers = get_admin_headers(client)
    resp = client.put(
        "/api/v1/users/change-password",
        headers=headers,
        json={
            "old_password": "adminpass",
            "new_password": "PutPass123!",
            "confirm_new_password": "PutPass123!",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["detail"] == "Password updated successfully"
