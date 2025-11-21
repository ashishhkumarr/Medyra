from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None


class UserRole(str, Enum):
    admin = "admin"


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    password: str | None = Field(default=None, min_length=8)


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
