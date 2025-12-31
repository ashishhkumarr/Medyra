import json
import logging
from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User

logger = logging.getLogger("meditrack.audit")

MAX_STRING_LENGTH = 500
MAX_JSON_LENGTH = 8000


def _truncate_value(value: Any) -> Any:
    if isinstance(value, str):
        if len(value) > MAX_STRING_LENGTH:
            return value[: MAX_STRING_LENGTH - 3] + "..."
        return value
    if isinstance(value, dict):
        return {str(key): _truncate_value(val) for key, val in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_truncate_value(item) for item in value]
    return value


def _serialize_metadata(metadata: Any | None) -> str | None:
    if metadata is None:
        return None
    try:
        trimmed = _truncate_value(metadata)
        raw = json.dumps(trimmed, default=str)
    except Exception:
        raw = json.dumps({"error": "metadata_unserializable"})
    if len(raw) > MAX_JSON_LENGTH:
        return raw[: MAX_JSON_LENGTH - 3] + "..."
    return raw


def _get_request_ip(request: Request | None) -> str | None:
    if not request:
        return None
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def log_event(
    db: Session,
    user: User | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    summary: str = "",
    metadata: dict | None = None,
    request: Request | None = None,
) -> None:
    if not user:
        return
    try:
        audit_log = AuditLog(
            owner_user_id=user.id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            summary=summary,
            metadata_json=_serialize_metadata(metadata),
            ip_address=_get_request_ip(request),
            user_agent=request.headers.get("user-agent") if request else None,
            request_id=getattr(request.state, "request_id", None) if request else None,
        )
        db.add(audit_log)
        db.commit()
    except Exception as exc:  # pragma: no cover - best effort logging
        db.rollback()
        logger.warning("Audit log failed: %s", exc)
