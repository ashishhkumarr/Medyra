from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base

# Stored as plain strings (validated in the Pydantic schema) to avoid
# creating new Postgres enum types during create_all on deploy.
ENCOUNTER_TYPES = [
    "Office visit",
    "Telehealth",
    "Follow-up",
    "New patient",
    "Procedure",
]
ENCOUNTER_STATUSES = ["Draft", "Signed"]


class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer, ForeignKey("patients.id"), nullable=False, index=True
    )
    owner_user_id = Column(
        Integer, ForeignKey("users.id"), index=True, nullable=True
    )

    provider = Column(String, nullable=True)
    encounter_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    encounter_type = Column(String, default="Office visit", nullable=False)
    chief_complaint = Column(String, nullable=True)

    # SOAP note
    subjective = Column(Text, nullable=True)
    objective = Column(Text, nullable=True)
    assessment = Column(Text, nullable=True)
    plan = Column(Text, nullable=True)
    diagnosis = Column(String, nullable=True)

    # Vitals
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    bp_systolic = Column(Integer, nullable=True)
    bp_diastolic = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    temperature_c = Column(Float, nullable=True)
    respiratory_rate = Column(Integer, nullable=True)
    spo2 = Column(Integer, nullable=True)

    status = Column(String, default="Draft", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    signed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient")
