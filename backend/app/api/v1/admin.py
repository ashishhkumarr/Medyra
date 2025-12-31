from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


DEMO_PATIENTS = [
    {
        "key": "skylar",
        "first_name": "Skylar",
        "last_name": "Nguyen",
        "email": "demo.skylar@meditrack.local",
        "phone": "555-0101",
        "notes": "Prefers morning appointments.",
    },
    {
        "key": "milo",
        "first_name": "Milo",
        "last_name": "Patel",
        "email": "demo.milo@meditrack.local",
        "phone": "555-0112",
        "notes": "Follow-up for wellness plan.",
    },
    {
        "key": "ava",
        "first_name": "Ava",
        "last_name": "Chen",
        "email": "demo.ava@meditrack.local",
        "phone": "555-0148",
        "notes": "Allergic to pollen (demo data).",
    },
]

DEMO_APPOINTMENTS = [
    {
        "patient_key": "skylar",
        "start": datetime(2025, 1, 15, 9, 0),
        "end": datetime(2025, 1, 15, 9, 30),
        "doctor": "Dr. Rivera",
        "department": "Primary Care",
        "status": AppointmentStatus.scheduled,
        "notes": "Routine check-in.",
    },
    {
        "patient_key": "milo",
        "start": datetime(2025, 1, 15, 11, 0),
        "end": datetime(2025, 1, 15, 11, 30),
        "doctor": "Dr. Albright",
        "department": "Family Medicine",
        "status": AppointmentStatus.completed,
        "notes": "Annual wellness visit.",
    },
    {
        "patient_key": "ava",
        "start": datetime(2025, 1, 16, 14, 0),
        "end": datetime(2025, 1, 16, 14, 45),
        "doctor": "Dr. Singh",
        "department": "Pediatrics",
        "status": AppointmentStatus.cancelled,
        "notes": "Reschedule requested.",
    },
]


@router.post("/seed-demo", response_model=dict)
def seed_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    if not settings.DEMO_MODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo mode disabled.",
        )

    created_patients = 0
    created_appointments = 0
    patient_lookup: dict[str, Patient] = {}

    for entry in DEMO_PATIENTS:
        email = entry["email"]
        patient = (
            db.query(Patient)
            .filter(
                Patient.email == email,
                Patient.owner_user_id == current_user.id,
            )
            .first()
        )
        if not patient:
            full_name = f"{entry['first_name']} {entry['last_name']}"
            patient = Patient(
                first_name=entry["first_name"],
                last_name=entry["last_name"],
                full_name=full_name,
                email=email,
                phone=entry["phone"],
                notes=entry["notes"],
                address="123 Demo Street",
                owner_user_id=current_user.id,
            )
            db.add(patient)
            created_patients += 1
        patient_lookup[entry["key"]] = patient

    db.flush()

    for entry in DEMO_APPOINTMENTS:
        patient = patient_lookup.get(entry["patient_key"])
        if not patient:
            continue
        existing = (
            db.query(Appointment)
            .filter(
                Appointment.patient_id == patient.id,
                Appointment.appointment_datetime == entry["start"],
                Appointment.doctor_name == entry["doctor"],
                Appointment.owner_user_id == current_user.id,
            )
            .first()
        )
        if existing:
            continue
        appointment = Appointment(
            patient_id=patient.id,
            appointment_datetime=entry["start"],
            appointment_end_datetime=entry["end"],
            doctor_name=entry["doctor"],
            department=entry["department"],
            status=entry["status"],
            notes=entry["notes"],
            owner_user_id=current_user.id,
        )
        db.add(appointment)
        created_appointments += 1

    db.commit()

    return {
        "patients_created": created_patients,
        "appointments_created": created_appointments,
    }
