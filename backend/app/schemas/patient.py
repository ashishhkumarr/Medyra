from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class PatientBase(BaseModel):
    full_name: str
    date_of_birth: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    medical_history: str | None = None
    medications: str | None = None
    notes: str | None = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: str | None = None
    date_of_birth: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    medical_history: str | None = None
    medications: str | None = None
    notes: str | None = None


class PatientResponse(PatientBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
