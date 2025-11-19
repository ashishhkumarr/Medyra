from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class AppointmentStatus(str, Enum):
    scheduled = "Scheduled"
    completed = "Completed"
    cancelled = "Cancelled"


class AppointmentBase(BaseModel):
    patient_id: int
    doctor_name: str
    department: str | None = None
    appointment_datetime: datetime
    notes: str | None = None
    status: AppointmentStatus = AppointmentStatus.scheduled


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    doctor_name: str | None = None
    department: str | None = None
    appointment_datetime: datetime | None = None
    notes: str | None = None
    status: AppointmentStatus | None = None


class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
