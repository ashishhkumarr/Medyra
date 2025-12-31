from datetime import datetime, timedelta
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User
from app.schemas.appointment import AppointmentResponse
from app.schemas.patient import (
    PatientCreate,
    PatientNotesUpdate,
    PatientResponse,
    PatientUpdate,
)
from app.services.audit_log import log_event

router = APIRouter(prefix="/patients", tags=["patients"])


def _get_patient(db: Session, patient_id: int, owner_user_id: int) -> Patient:
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


def _build_full_name(
    full_name: str | None, first_name: str | None, last_name: str | None
) -> str | None:
    if full_name and full_name.strip():
        return full_name.strip()
    name_parts = [part.strip() for part in [first_name, last_name] if part and part.strip()]
    return " ".join(name_parts) if name_parts else None


def _build_update_metadata(patient: Patient, updates: dict) -> dict:
    changes = {}
    for field, new_value in updates.items():
        old_value = getattr(patient, field, None)
        if old_value != new_value:
            changes[field] = {"old": old_value, "new": new_value}
    return {"changed_fields": list(changes.keys()), "changes": changes}


@router.get("/", response_model=list[PatientResponse])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return (
        db.query(Patient)
        .filter(Patient.owner_user_id == current_user.id)
        .all()
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    patient = _get_patient(db, patient_id, current_user.id)
    return patient


@router.get("/{patient_id}/appointments", response_model=list[AppointmentResponse])
def list_patient_appointments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    patient = _get_patient(db, patient_id, current_user.id)
    return (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == patient.id,
            Appointment.owner_user_id == current_user.id,
        )
        .order_by(Appointment.appointment_datetime.desc())
        .all()
    )


def _resolve_end_time(start_time, end_time):
    if not start_time:
        return end_time
    return end_time or start_time + timedelta(
        minutes=settings.APPOINTMENT_DEFAULT_DURATION_MINUTES
    )


def _format_datetime(value: datetime) -> str:
    formatted = value.strftime("%b %d, %Y %I:%M %p")
    return formatted.replace(" 0", " ")


def _format_time_range(start_time, end_time):
    if not start_time:
        return "—"
    if not end_time:
        return _format_datetime(start_time)
    return f"{_format_datetime(start_time)} - {_format_datetime(end_time)}"


@router.get("/{patient_id}/export")
def export_patient_record(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    patient = _get_patient(db, patient_id, current_user.id)
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == patient.id,
            Appointment.owner_user_id == current_user.id,
        )
        .order_by(Appointment.appointment_datetime.asc())
        .all()
    )

    buffer = BytesIO()
    try:
        doc = SimpleDocTemplate(
            buffer,
            pagesize=LETTER,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36,
        )
        styles = getSampleStyleSheet()
        story = []

        clinic_name = settings.PROJECT_NAME
        export_time = datetime.utcnow()

        story.append(Paragraph(clinic_name, styles["Title"]))
        story.append(Paragraph("Patient Record Export", styles["Heading2"]))
        story.append(
            Paragraph(
                f"Exported {_format_datetime(export_time)} UTC", styles["Normal"]
            )
        )
        story.append(Spacer(1, 12))

        story.append(Paragraph("Patient Demographics", styles["Heading3"]))
        demographics = [
            ["Full name", patient.full_name],
            ["Date of birth", patient.date_of_birth or "—"],
            ["Sex", patient.sex or "—"],
            ["Email", patient.email or "—"],
            ["Phone", patient.phone or "—"],
            ["Address", patient.address or "—"],
        ]
        demo_table = Table(demographics, colWidths=[140, 360])
        demo_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(demo_table)
        story.append(Spacer(1, 12))

        story.append(Paragraph("Medical Notes", styles["Heading3"]))
        notes_text = patient.notes or "—"
        story.append(Paragraph(notes_text.replace("\n", "<br/>"), styles["BodyText"]))
        story.append(Spacer(1, 12))

        story.append(Paragraph("Appointment History", styles["Heading3"]))
        table_data = [
            [
                "Start / End",
                "Doctor",
                "Department",
                "Status",
                "Notes",
            ]
        ]
        for appointment in appointments:
            end_time = _resolve_end_time(
                appointment.appointment_datetime,
                appointment.appointment_end_datetime,
            )
            doctor = appointment.doctor_name or "TBD"
            table_data.append(
                [
                    Paragraph(
                        _format_time_range(appointment.appointment_datetime, end_time),
                        styles["BodyText"],
                    ),
                    Paragraph(doctor, styles["BodyText"]),
                    Paragraph(appointment.department or "—", styles["BodyText"]),
                    Paragraph(appointment.status.value, styles["BodyText"]),
                    Paragraph(appointment.notes or "—", styles["BodyText"]),
                ]
            )
        history_table = Table(table_data, colWidths=[150, 90, 90, 70, 160])
        history_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(history_table)

        doc.build(story)
    except Exception as exc:  # pragma: no cover - PDF generation guardrail
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate patient record PDF.",
        ) from exc

    pdf_bytes = buffer.getvalue()
    buffer.close()
    log_event(
        db,
        current_user,
        action="patient.export_pdf",
        entity_type="patient",
        entity_id=patient.id,
        summary="Exported patient record PDF",
        metadata={"full_name": patient.full_name},
        request=request,
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="patient_{patient.id}_record.pdf"'
        },
    )


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    payload_data = payload.dict(exclude_unset=True)
    full_name = _build_full_name(
        payload_data.get("full_name"),
        payload_data.get("first_name"),
        payload_data.get("last_name"),
    )
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Patient first and last name are required.",
        )
    payload_data["full_name"] = full_name
    payload_data["owner_user_id"] = current_user.id
    patient = Patient(**payload_data)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    log_event(
        db,
        current_user,
        action="patient.create",
        entity_type="patient",
        entity_id=patient.id,
        summary=f"Created patient {patient.full_name}",
        metadata={"full_name": patient.full_name, "email": patient.email},
        request=request,
    )
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    patient = _get_patient(db, patient_id, current_user.id)
    payload_data = payload.dict(exclude_unset=True)
    metadata = _build_update_metadata(patient, payload_data)
    if {"full_name", "first_name", "last_name"} & payload_data.keys():
        full_name = _build_full_name(
            payload_data.get("full_name"),
            payload_data.get("first_name", patient.first_name),
            payload_data.get("last_name", patient.last_name),
        )
        if full_name:
            payload_data["full_name"] = full_name
    for field, value in payload_data.items():
        setattr(patient, field, value)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    log_event(
        db,
        current_user,
        action="patient.update",
        entity_type="patient",
        entity_id=patient.id,
        summary=f"Updated patient {patient.full_name}",
        metadata=metadata,
        request=request,
    )
    return patient


@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient_notes(
    patient_id: int,
    payload: PatientNotesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    patient = _get_patient(db, patient_id, current_user.id)
    update_data = payload.dict(exclude_unset=True)
    metadata = _build_update_metadata(patient, update_data)
    if "notes" in update_data:
        patient.notes = update_data["notes"]
    db.add(patient)
    db.commit()
    db.refresh(patient)
    log_event(
        db,
        current_user,
        action="patient.update",
        entity_type="patient",
        entity_id=patient.id,
        summary=f"Updated patient {patient.full_name}",
        metadata=metadata,
        request=request,
    )
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    request: Request = None,
):
    patient = _get_patient(db, patient_id, current_user.id)
    db.delete(patient)
    db.commit()
    log_event(
        db,
        current_user,
        action="patient.delete",
        entity_type="patient",
        entity_id=patient.id,
        summary=f"Deleted patient {patient.full_name}",
        metadata={"full_name": patient.full_name, "email": patient.email},
        request=request,
    )
