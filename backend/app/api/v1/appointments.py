from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)
from app.services.audit_log import log_event
from app.services.email import (
    build_cancellation_email,
    build_confirmation_email,
    build_update_email,
    send_email,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])
DEFAULT_DOCTOR_NAME = "TBD"


def _get_appointment(
    db: Session, appointment_id: int, owner_user_id: int
) -> Appointment:
    appointment = (
        db.query(Appointment)
        .options(selectinload(Appointment.patient))
        .filter(
            Appointment.id == appointment_id,
            Appointment.owner_user_id == owner_user_id,
        )
        .first()
    )
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )
    return appointment


def _normalize_doctor_name(name: str | None) -> str:
    if name and name.strip():
        return name.strip()
    return DEFAULT_DOCTOR_NAME


def _get_clinic_name(db: Session) -> str:
    clinic = (
        db.query(User)
        .filter(User.role == UserRole.admin, User.clinic_name.isnot(None))
        .first()
    )
    return clinic.clinic_name if clinic and clinic.clinic_name else settings.PROJECT_NAME


def _validate_time_range(start_time, end_time):
    if end_time and start_time and end_time <= start_time:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Appointment end time must be after start time.",
        )


def _resolve_end_time(start_time, end_time):
    if not start_time:
        return end_time
    return end_time or start_time + timedelta(
        minutes=settings.APPOINTMENT_DEFAULT_DURATION_MINUTES
    )


def _assert_no_overlapping_appointments(
    db: Session,
    start_time,
    end_time,
    owner_user_id: int,
    appointment_id: int | None = None,
):
    effective_end_time = _resolve_end_time(start_time, end_time)
    if not start_time or not effective_end_time:
        return

    query = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.scheduled,
        Appointment.owner_user_id == owner_user_id,
    )
    if appointment_id is not None:
        query = query.filter(Appointment.id != appointment_id)

    for existing in query.all():
        existing_start = existing.appointment_datetime
        existing_end = _resolve_end_time(
            existing_start, existing.appointment_end_datetime
        )
        if existing_start and existing_end:
            if start_time < existing_end and effective_end_time > existing_start:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Appointment time overlaps with an existing appointment.",
                )


def _prepare_update_data(payload: AppointmentUpdate) -> dict:
    update_data = payload.dict(exclude_unset=True)
    if "doctor_name" in update_data:
        update_data["doctor_name"] = _normalize_doctor_name(
            update_data.get("doctor_name")
        )
    return update_data


def _snapshot_appointment(appointment: Appointment) -> dict:
    return {
        "appointment_datetime": appointment.appointment_datetime,
        "appointment_end_datetime": appointment.appointment_end_datetime,
        "doctor_name": appointment.doctor_name,
        "department": appointment.department,
        "notes": appointment.notes,
        "status": appointment.status,
    }


def _has_update_changes(old: dict, appointment: Appointment) -> bool:
    return any(
        [
            old["appointment_datetime"] != appointment.appointment_datetime,
            old["appointment_end_datetime"] != appointment.appointment_end_datetime,
            old["doctor_name"] != appointment.doctor_name,
            old["department"] != appointment.department,
            old["notes"] != appointment.notes,
            old["status"] != appointment.status,
        ]
    )


def _build_update_metadata(old: dict, appointment: Appointment) -> dict:
    changes = {}
    for field, old_value in old.items():
        new_value = getattr(appointment, field)
        if old_value != new_value:
            changes[field] = {"old": old_value, "new": new_value}
    return {"changed_fields": list(changes.keys()), "changes": changes}


def _patient_email(patient: Patient) -> str | None:
    if not patient.email:
        return None
    email = patient.email.strip()
    return email or None


def _send_confirmation_email(db: Session, appointment: Appointment, patient: Patient) -> None:
    recipient = _patient_email(patient)
    if not recipient or appointment.status != AppointmentStatus.scheduled:
        return
    print(
        f"EMAIL_TRIGGER event=create appointment_id={appointment.id} patient_email={recipient}"
    )
    clinic_name = _get_clinic_name(db)
    start_time = appointment.appointment_datetime
    end_time = _resolve_end_time(
        appointment.appointment_datetime, appointment.appointment_end_datetime
    )
    subject, html_body, text_body = build_confirmation_email(
        patient.full_name,
        clinic_name,
        start_time,
        end_time,
        appointment.doctor_name,
        appointment.department,
        appointment.notes,
    )
    send_email(recipient, subject, html_body, text_body)


def _send_update_email(
    db: Session, appointment: Appointment, patient: Patient, old_snapshot: dict
) -> None:
    recipient = _patient_email(patient)
    if not recipient:
        return
    print(
        f"EMAIL_TRIGGER event=update appointment_id={appointment.id} patient_email={recipient}"
    )
    clinic_name = _get_clinic_name(db)
    subject, html_body, text_body = build_update_email(
        patient.full_name,
        clinic_name,
        old_snapshot["appointment_datetime"],
        _resolve_end_time(
            old_snapshot["appointment_datetime"],
            old_snapshot["appointment_end_datetime"],
        ),
        old_snapshot["doctor_name"],
        old_snapshot["department"],
        old_snapshot["notes"],
        appointment.appointment_datetime,
        _resolve_end_time(
            appointment.appointment_datetime, appointment.appointment_end_datetime
        ),
        appointment.doctor_name,
        appointment.department,
        appointment.notes,
    )
    send_email(recipient, subject, html_body, text_body)


def _send_cancellation_email(
    db: Session, appointment: Appointment, patient: Patient, old_snapshot: dict | None = None
) -> None:
    recipient = _patient_email(patient)
    if not recipient:
        return
    print(
        f"EMAIL_TRIGGER event=cancel appointment_id={appointment.id} patient_email={recipient}"
    )
    clinic_name = _get_clinic_name(db)
    snapshot = old_snapshot or _snapshot_appointment(appointment)
    subject, html_body, text_body = build_cancellation_email(
        patient.full_name,
        clinic_name,
        snapshot["appointment_datetime"],
        _resolve_end_time(
            snapshot["appointment_datetime"],
            snapshot["appointment_end_datetime"],
        ),
        snapshot["doctor_name"],
        snapshot["department"],
        snapshot["notes"],
    )
    send_email(recipient, subject, html_body, text_body)


def _apply_appointment_update(appointment: Appointment, update_data: dict) -> Appointment:
    for field, value in update_data.items():
        setattr(appointment, field, value)
    return appointment


@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return (
        db.query(Appointment)
        .options(selectinload(Appointment.patient))
        .filter(Appointment.owner_user_id == current_user.id)
        .all()
    )


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    patient = _ensure_patient_exists(db, payload.patient_id, current_user.id)
    payload_data = payload.dict(exclude_unset=True)
    payload_data["doctor_name"] = _normalize_doctor_name(payload_data.get("doctor_name"))
    payload_data["owner_user_id"] = current_user.id
    _validate_time_range(
        payload_data.get("appointment_datetime"),
        payload_data.get("appointment_end_datetime"),
    )
    status_value = payload_data.get("status", AppointmentStatus.scheduled)
    if status_value == AppointmentStatus.scheduled:
        _assert_no_overlapping_appointments(
            db,
            payload_data.get("appointment_datetime"),
            payload_data.get("appointment_end_datetime"),
            current_user.id,
        )
    appointment = Appointment(**payload_data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    appointment.patient = patient
    _send_confirmation_email(db, appointment, patient)
    log_event(
        db,
        current_user,
        action="appointment.create",
        entity_type="appointment",
        entity_id=appointment.id,
        summary="Created appointment",
        metadata={
            "patient_id": appointment.patient_id,
            "appointment_datetime": appointment.appointment_datetime,
            "appointment_end_datetime": appointment.appointment_end_datetime,
            "status": appointment.status,
        },
        request=request,
    )
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    appointment = _get_appointment(db, appointment_id, current_user.id)
    old_snapshot = _snapshot_appointment(appointment)
    update_data = _prepare_update_data(payload)
    start_time = update_data.get("appointment_datetime", appointment.appointment_datetime)
    end_time = (
        update_data["appointment_end_datetime"]
        if "appointment_end_datetime" in update_data
        else appointment.appointment_end_datetime
    )
    status_value = update_data.get("status", appointment.status)
    _validate_time_range(start_time, end_time)
    if status_value == AppointmentStatus.scheduled:
        _assert_no_overlapping_appointments(
            db,
            start_time,
            end_time,
            current_user.id,
            appointment_id=appointment.id,
        )
    _apply_appointment_update(appointment, update_data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    metadata = _build_update_metadata(old_snapshot, appointment)
    action = "appointment.update"
    if old_snapshot["status"] != appointment.status:
        if appointment.status == AppointmentStatus.cancelled:
            action = "appointment.cancel"
        elif appointment.status == AppointmentStatus.completed:
            action = "appointment.complete"
    elif old_snapshot["appointment_datetime"] != appointment.appointment_datetime or (
        old_snapshot["appointment_end_datetime"] != appointment.appointment_end_datetime
    ):
        action = "appointment.reschedule"
    summary = "Updated appointment"
    if action == "appointment.reschedule":
        summary = "Rescheduled appointment"
    if action == "appointment.cancel":
        summary = "Cancelled appointment"
    if action == "appointment.complete":
        summary = "Completed appointment"
    log_event(
        db,
        current_user,
        action=action,
        entity_type="appointment",
        entity_id=appointment.id,
        summary=summary,
        metadata=metadata,
        request=request,
    )
    if appointment.status == AppointmentStatus.cancelled:
        if old_snapshot["status"] != AppointmentStatus.cancelled:
            _send_cancellation_email(db, appointment, appointment.patient, old_snapshot)
    elif appointment.status == AppointmentStatus.scheduled and _has_update_changes(
        old_snapshot, appointment
    ):
        _send_update_email(db, appointment, appointment.patient, old_snapshot)
    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def patch_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    appointment = _get_appointment(db, appointment_id, current_user.id)
    old_snapshot = _snapshot_appointment(appointment)
    update_data = _prepare_update_data(payload)
    start_time = update_data.get("appointment_datetime", appointment.appointment_datetime)
    end_time = (
        update_data["appointment_end_datetime"]
        if "appointment_end_datetime" in update_data
        else appointment.appointment_end_datetime
    )
    status_value = update_data.get("status", appointment.status)
    _validate_time_range(start_time, end_time)
    if status_value == AppointmentStatus.scheduled:
        _assert_no_overlapping_appointments(
            db,
            start_time,
            end_time,
            current_user.id,
            appointment_id=appointment.id,
        )
    _apply_appointment_update(appointment, update_data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    metadata = _build_update_metadata(old_snapshot, appointment)
    action = "appointment.update"
    if old_snapshot["status"] != appointment.status:
        if appointment.status == AppointmentStatus.cancelled:
            action = "appointment.cancel"
        elif appointment.status == AppointmentStatus.completed:
            action = "appointment.complete"
    elif old_snapshot["appointment_datetime"] != appointment.appointment_datetime or (
        old_snapshot["appointment_end_datetime"] != appointment.appointment_end_datetime
    ):
        action = "appointment.reschedule"
    summary = "Updated appointment"
    if action == "appointment.reschedule":
        summary = "Rescheduled appointment"
    if action == "appointment.cancel":
        summary = "Cancelled appointment"
    if action == "appointment.complete":
        summary = "Completed appointment"
    log_event(
        db,
        current_user,
        action=action,
        entity_type="appointment",
        entity_id=appointment.id,
        summary=summary,
        metadata=metadata,
        request=request,
    )
    if appointment.status == AppointmentStatus.cancelled:
        if old_snapshot["status"] != AppointmentStatus.cancelled:
            _send_cancellation_email(db, appointment, appointment.patient, old_snapshot)
    elif appointment.status == AppointmentStatus.scheduled and _has_update_changes(
        old_snapshot, appointment
    ):
        _send_update_email(db, appointment, appointment.patient, old_snapshot)
    return appointment


@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    appointment = _get_appointment(db, appointment_id, current_user.id)
    if appointment.status != AppointmentStatus.cancelled:
        old_snapshot = _snapshot_appointment(appointment)
        appointment.status = AppointmentStatus.cancelled
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        log_event(
            db,
            current_user,
            action="appointment.cancel",
            entity_type="appointment",
            entity_id=appointment.id,
            summary="Cancelled appointment",
            metadata={"status": appointment.status},
            request=request,
        )
        _send_cancellation_email(db, appointment, appointment.patient, old_snapshot)
    return appointment


@router.patch("/{appointment_id}/complete", response_model=AppointmentResponse)
def complete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    appointment = _get_appointment(db, appointment_id, current_user.id)
    if appointment.status != AppointmentStatus.completed:
        appointment.status = AppointmentStatus.completed
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        log_event(
            db,
            current_user,
            action="appointment.complete",
            entity_type="appointment",
            entity_id=appointment.id,
            summary="Completed appointment",
            metadata={"status": appointment.status},
            request=request,
        )
    return appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    appointment = _get_appointment(db, appointment_id, current_user.id)
    db.delete(appointment)
    db.commit()
    log_event(
        db,
        current_user,
        action="appointment.delete",
        entity_type="appointment",
        entity_id=appointment.id,
        summary="Deleted appointment",
        request=request,
    )

def _ensure_patient_exists(
    db: Session, patient_id: int, owner_user_id: int
) -> Patient:
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.owner_user_id == owner_user_id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    return patient
