import json

from app.core.security import get_password_hash
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole

from .test_auth import get_admin_headers


def test_profile_update_requires_auth(client):
    response = client.patch("/api/v1/users/me", json={"phone": "555-0100"})
    assert response.status_code in {401, 403}


def test_profile_update_scoped_to_current_user(client, db_session):
    other = User(
        email="other@example.com",
        hashed_password=get_password_hash("otherpass"),
        full_name="Other User",
        role=UserRole.admin,
        clinic_name="Other Clinic",
    )
    db_session.add(other)
    db_session.commit()

    headers = get_admin_headers(client)
    response = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"clinic_name": "Updated Clinic"},
    )
    assert response.status_code == 200
    assert response.json()["clinic_name"] == "Updated Clinic"

    db_session.refresh(other)
    assert other.clinic_name == "Other Clinic"


def test_profile_update_rejects_email_change(client):
    headers = get_admin_headers(client)
    response = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"email": "new@example.com"},
    )
    assert response.status_code == 422


def test_profile_update_creates_audit_log(client, db_session):
    headers = get_admin_headers(client)
    response = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"phone": "555-0100"},
    )
    assert response.status_code == 200

    audit = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "profile.updated")
        .order_by(AuditLog.id.desc())
        .first()
    )
    assert audit is not None
    payload = json.loads(audit.metadata_json or "{}")
    assert "changed_fields" in payload
    assert "phone" in payload["changed_fields"]
