from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

EncounterType = Literal[
    "Office visit", "Telehealth", "Follow-up", "New patient", "Procedure"
]
EncounterStatus = Literal["Draft", "Signed"]


class EncounterBase(BaseModel):
    provider: Optional[str] = None
    encounter_date: Optional[datetime] = None
    encounter_type: EncounterType = "Office visit"
    chief_complaint: Optional[str] = None
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    diagnosis: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature_c: Optional[float] = None
    respiratory_rate: Optional[int] = None
    spo2: Optional[int] = None


class EncounterCreate(EncounterBase):
    patient_id: int


class EncounterUpdate(BaseModel):
    provider: Optional[str] = None
    encounter_date: Optional[datetime] = None
    encounter_type: Optional[EncounterType] = None
    chief_complaint: Optional[str] = None
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    diagnosis: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature_c: Optional[float] = None
    respiratory_rate: Optional[int] = None
    spo2: Optional[int] = None


class EncounterResponse(EncounterBase):
    id: int
    patient_id: int
    status: EncounterStatus
    created_at: datetime
    signed_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True
