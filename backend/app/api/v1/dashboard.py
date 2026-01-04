from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _to_date_key(value: date | str) -> str:
    if isinstance(value, date):
        return value.isoformat()
    return str(value)


def _week_start(value: date) -> date:
    return value - timedelta(days=value.weekday())


def _normalize_status(status) -> str:
    if isinstance(status, AppointmentStatus):
        status = status.value
    return str(status).lower()


@router.get("/analytics")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    today = datetime.now().date()
    start_30d = today - timedelta(days=29)
    start_30d_dt = datetime.combine(start_30d, time.min)
    end_today_dt = datetime.combine(today, time.max)
    upcoming_end_dt = datetime.combine(today + timedelta(days=6), time.max)

    total_patients = (
        db.query(func.count(Patient.id))
        .filter(Patient.owner_user_id == current_user.id)
        .scalar()
        or 0
    )
    appointments_today = (
        db.query(func.count(Appointment.id))
        .filter(
            Appointment.owner_user_id == current_user.id,
            Appointment.appointment_datetime >= datetime.combine(today, time.min),
            Appointment.appointment_datetime <= end_today_dt,
        )
        .scalar()
        or 0
    )
    upcoming_appointments_7d = (
        db.query(func.count(Appointment.id))
        .filter(
            Appointment.owner_user_id == current_user.id,
            Appointment.appointment_datetime >= datetime.combine(today, time.min),
            Appointment.appointment_datetime <= upcoming_end_dt,
        )
        .scalar()
        or 0
    )
    new_patients_30d = (
        db.query(func.count(Patient.id))
        .filter(
            Patient.owner_user_id == current_user.id,
            Patient.created_at >= start_30d_dt,
            Patient.created_at <= end_today_dt,
        )
        .scalar()
        or 0
    )

    appointment_rows = (
        db.query(
            func.date(Appointment.appointment_datetime).label("day"),
            func.count(Appointment.id),
        )
        .filter(
            Appointment.owner_user_id == current_user.id,
            Appointment.appointment_datetime >= start_30d_dt,
            Appointment.appointment_datetime <= end_today_dt,
        )
        .group_by(func.date(Appointment.appointment_datetime))
        .all()
    )
    appointment_counts = {
        _to_date_key(row[0]): int(row[1]) for row in appointment_rows
    }
    appointments_by_day = []
    for offset in range(30):
        current_day = start_30d + timedelta(days=offset)
        key = current_day.isoformat()
        appointments_by_day.append(
            {"date": key, "count": appointment_counts.get(key, 0)}
        )

    week_end = _week_start(today)
    week_start = week_end - timedelta(weeks=11)
    patient_rows = (
        db.query(Patient.created_at)
        .filter(
            Patient.owner_user_id == current_user.id,
            Patient.created_at
            >= datetime.combine(week_start, time.min),
            Patient.created_at <= end_today_dt,
        )
        .all()
    )
    weekly_counts: dict[str, int] = {}
    for (created_at,) in patient_rows:
        created_date = created_at.date()
        bucket = _week_start(created_date).isoformat()
        weekly_counts[bucket] = weekly_counts.get(bucket, 0) + 1

    new_patients_by_week = []
    for offset in range(12):
        current_week = week_start + timedelta(weeks=offset)
        key = current_week.isoformat()
        new_patients_by_week.append(
            {"weekStart": key, "count": weekly_counts.get(key, 0)}
        )

    status_rows = (
        db.query(Appointment.status, func.count(Appointment.id))
        .filter(
            Appointment.owner_user_id == current_user.id,
            Appointment.appointment_datetime >= start_30d_dt,
            Appointment.appointment_datetime <= end_today_dt,
        )
        .group_by(Appointment.status)
        .all()
    )
    status_counts: dict[str, int] = {}
    other_count = 0
    for status, count in status_rows:
        normalized = _normalize_status(status)
        if normalized in {"scheduled", "completed", "cancelled", "no_show"}:
            status_counts[normalized] = int(count)
        else:
            other_count += int(count)

    status_buckets = ["scheduled", "completed", "cancelled", "no_show"]
    appointments_by_status = [
        {"status": status, "count": status_counts.get(status, 0)}
        for status in status_buckets
    ]
    if other_count:
        appointments_by_status.append({"status": "other", "count": other_count})

    return {
        "kpis": {
            "totalPatients": total_patients,
            "upcomingAppointments7d": upcoming_appointments_7d,
            "appointmentsToday": appointments_today,
            "newPatients30d": new_patients_30d,
        },
        "trends": {
            "appointmentsByDay30d": appointments_by_day,
            "newPatientsByWeek12w": new_patients_by_week,
        },
        "breakdowns": {"appointmentsByStatus30d": appointments_by_status},
        "meta": {
            "range": {"from": start_30d.isoformat(), "to": today.isoformat()},
            "generatedAt": datetime.utcnow().isoformat(),
        },
    }
