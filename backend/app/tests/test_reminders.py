from datetime import datetime, timedelta

from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User
from app.services import reminder_service

BASE_TIME = datetime(2030, 1, 1, 9, 0, 0)


def _create_patient(db_session, email: str | None) -> Patient:
    admin = db_session.query(User).first()
    patient = Patient(
        full_name="Reminder Patient",
        email=email,
        phone="555-0202",
        owner_user_id=admin.id,
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient


def test_reminder_sends_once_and_sets_timestamp(db_session, monkeypatch):
    patient = _create_patient(db_session, "reminder@example.com")
    appointment = Appointment(
        patient_id=patient.id,
        doctor_name="Dr. Reminder",
        appointment_datetime=BASE_TIME + timedelta(hours=2),
        status=AppointmentStatus.scheduled,
        owner_user_id=patient.owner_user_id,
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    sent = []

    def fake_send_email(to, subject, html_body, text_body=None):
        sent.append({"to": to, "subject": subject})

    monkeypatch.setattr(reminder_service, "send_email", fake_send_email)

    result = reminder_service.dispatch_reminders(db_session, now=BASE_TIME)
    assert result["sent"] == 1
    assert len(sent) == 1

    db_session.refresh(appointment)
    assert appointment.reminder_sent_at is not None

    result_again = reminder_service.dispatch_reminders(db_session, now=BASE_TIME)
    assert result_again["sent"] == 0
    assert len(sent) == 1


def test_reminder_not_sent_if_already_sent(db_session, monkeypatch):
    patient = _create_patient(db_session, "repeat@example.com")
    appointment = Appointment(
        patient_id=patient.id,
        doctor_name="Dr. Reminder",
        appointment_datetime=BASE_TIME + timedelta(hours=3),
        status=AppointmentStatus.scheduled,
        reminder_sent_at=BASE_TIME,
        owner_user_id=patient.owner_user_id,
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    sent = []

    def fake_send_email(to, subject, html_body, text_body=None):
        sent.append({"to": to, "subject": subject})

    monkeypatch.setattr(reminder_service, "send_email", fake_send_email)

    result = reminder_service.dispatch_reminders(db_session, now=BASE_TIME)
    assert result["sent"] == 0
    assert len(sent) == 0
