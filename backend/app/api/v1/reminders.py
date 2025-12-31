from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.user import User
from app.services.audit_log import log_event
from app.services.reminder_service import dispatch_reminders

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.post("/run")
def run_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    result = dispatch_reminders(db)
    log_event(
        db,
        current_user,
        action="reminder.run",
        entity_type="reminder",
        summary="Reminder dispatch run",
        metadata=result,
        request=request,
    )
    return result
