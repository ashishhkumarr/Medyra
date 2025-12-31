from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    created_at: datetime
    action: str
    entity_type: str
    entity_id: int | None = None
    summary: str | None = None
    metadata: dict | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    request_id: str | None = None
