from datetime import datetime
from enum import Enum

import re

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from pydantic.config import ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    specialty: str | None = None
    license_number: str | None = None
    license_state: str | None = None
    license_country: str | None = None
    npi_number: str | None = None
    taxonomy_code: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    clinic_city: str | None = None
    clinic_state: str | None = None
    clinic_zip: str | None = None
    clinic_country: str | None = None


class UserRole(str, Enum):
    admin = "admin"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None
    password: str = Field(min_length=8)


class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    specialty: str | None = None
    license_number: str
    license_state: str | None = None
    license_country: str | None = None
    npi_number: str | None = None
    taxonomy_code: str | None = None
    clinic_name: str
    clinic_address: str
    clinic_city: str
    clinic_state: str
    clinic_zip: str
    clinic_country: str
    password: str = Field(min_length=8)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    password: str | None = Field(default=None, min_length=8)
    first_name: str | None = None
    last_name: str | None = None
    specialty: str | None = None
    license_number: str | None = None
    license_state: str | None = None
    license_country: str | None = None
    npi_number: str | None = None
    taxonomy_code: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    clinic_city: str | None = None
    clinic_state: str | None = None
    clinic_zip: str | None = None
    clinic_country: str | None = None


class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    specialty: str | None = None
    license_number: str | None = None
    license_state: str | None = None
    license_country: str | None = None
    npi_number: str | None = None
    taxonomy_code: str | None = None
    clinic_name: str | None = None
    clinic_address: str | None = None
    clinic_city: str | None = None
    clinic_state: str | None = None
    clinic_zip: str | None = None
    clinic_country: str | None = None

    @field_validator(
        "first_name",
        "last_name",
        "phone",
        "specialty",
        "license_number",
        "license_state",
        "license_country",
        "npi_number",
        "taxonomy_code",
        "clinic_name",
        "clinic_address",
        "clinic_city",
        "clinic_state",
        "clinic_zip",
        "clinic_country",
        mode="before",
    )
    @classmethod
    def _strip_strings(cls, value: str | None):
        if value is None:
            return value
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, value: str | None):
        if value is None or value == "":
            return value
        digits = re.sub(r"\D", "", value)
        if len(digits) < 7:
            raise ValueError("Phone number looks too short.")
        return value

    @field_validator("npi_number")
    @classmethod
    def _validate_npi_number(cls, value: str | None):
        if value is None or value == "":
            return value
        if not value.isdigit() or len(value) != 10:
            raise ValueError("NPI must be 10 digits.")
        return value

    @field_validator("taxonomy_code")
    @classmethod
    def _validate_taxonomy_code(cls, value: str | None):
        if value is None or value == "":
            return value
        if not re.fullmatch(r"[A-Za-z0-9.]+", value):
            raise ValueError("Taxonomy code must be alphanumeric.")
        return value


class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8)
    confirm_new_password: str

    @model_validator(mode="after")
    def passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole = UserRole.admin
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
