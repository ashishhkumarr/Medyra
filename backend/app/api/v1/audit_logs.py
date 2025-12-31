import json
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


def _parse_metadata(raw: str | None) -> dict | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    entity_type: str | None = Query(default=None),
    action: str | None = Query(default=None),
    entity_id: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    since: datetime | None = Query(default=None),
):
    query = db.query(AuditLog).filter(AuditLog.owner_user_id == current_user.id)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_id is not None:
        query = query.filter(AuditLog.entity_id == entity_id)
    if since:
        query = query.filter(AuditLog.created_at >= since)

    logs = (
        query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        AuditLogResponse(
            id=log.id,
            created_at=log.created_at,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            summary=log.summary,
            metadata=_parse_metadata(log.metadata_json),
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            request_id=log.request_id,
        )
        for log in logs
    ]
