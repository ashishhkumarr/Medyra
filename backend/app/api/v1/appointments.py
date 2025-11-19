from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user, get_current_admin
from app.db.session import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _get_appointment(db: Session, appointment_id: int) -> Appointment:
    appointment = (
        db.query(Appointment).filter(Appointment.id == appointment_id).first()
    )
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )
    return appointment


@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(Appointment).all()


@router.get("/my", response_model=list[AppointmentResponse])
def my_appointments(current_user: User = Depends(get_current_active_user)):
    if current_user.role != UserRole.patient or not current_user.patient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No patient profile found",
        )
    return current_user.patient_profile.appointments


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == UserRole.patient:
        profile = current_user.patient_profile
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient profile missing",
            )
        payload = AppointmentCreate(
            patient_id=profile.id,
            doctor_name=payload.doctor_name,
            department=payload.department,
            appointment_datetime=payload.appointment_datetime,
            notes=payload.notes,
            status=AppointmentStatus.scheduled,
        )
    else:
        _ensure_patient_exists(db, payload.patient_id)
    appointment = Appointment(**payload.dict())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    appointment = _get_appointment(db, appointment_id)
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(appointment, field, value)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    appointment = _get_appointment(db, appointment_id)
    db.delete(appointment)
    db.commit()


def _ensure_patient_exists(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    return patient
