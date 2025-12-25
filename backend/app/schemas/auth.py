from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserSignup


class SignupOtpRequest(BaseModel):
    email: EmailStr


class SignupOtpVerify(UserSignup):
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
