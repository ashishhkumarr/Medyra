import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_current_admin, get_password_hash, verify_password
from app.models.signup_otp import SignupOtp
from app.models.user import User, UserRole
from app.schemas.auth import SignupOtpRequest, SignupOtpVerify
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserSignup
from app.db.session import get_db
from app.services.email import build_signup_otp_email, send_email

router = APIRouter(prefix="/auth", tags=["auth"])

OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10
OTP_COOLDOWN_SECONDS = 60
OTP_MAX_SENDS_PER_HOUR = 5
OTP_MAX_ATTEMPTS = 5


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _generate_otp() -> str:
    return f"{secrets.randbelow(10**OTP_LENGTH):0{OTP_LENGTH}d}"


@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clinic staff can access MediTrack",
        )
    token = create_access_token(
        {"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.from_orm(user)}


@router.post("/signup", response_model=dict, status_code=status.HTTP_410_GONE)
def signup(_: UserSignup, __: Session = Depends(get_db)):
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Signup now requires email verification. Use /auth/signup/request-otp.",
    )


@router.post("/signup/request-otp", response_model=dict)
def request_signup_otp(payload: SignupOtpRequest, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    now = datetime.utcnow()
    otp_record = db.query(SignupOtp).filter(SignupOtp.email == email).first()

    if otp_record and otp_record.last_sent_at:
        elapsed = (now - otp_record.last_sent_at).total_seconds()
        if elapsed < OTP_COOLDOWN_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before requesting another code.",
            )
        if now - otp_record.last_sent_at > timedelta(hours=1):
            otp_record.send_count = 0

        if otp_record.send_count >= OTP_MAX_SENDS_PER_HOUR:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many OTP requests. Please try again later.",
            )

    if not otp_record:
        otp_record = SignupOtp(email=email, send_count=0, attempts=0)
        db.add(otp_record)

    otp_code = _generate_otp()
    otp_record.otp_hash = get_password_hash(otp_code)
    otp_record.expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp_record.attempts = 0
    otp_record.last_sent_at = now
    otp_record.send_count = (otp_record.send_count or 0) + 1
    db.commit()

    subject, html_body, text_body = build_signup_otp_email(
        otp_code, OTP_EXPIRY_MINUTES
    )
    print(f"EMAIL_TRIGGER event=signup_otp email={email}")
    send_email(email, subject, html_body, text_body)

    return {"message": "OTP sent"}


@router.post("/signup/verify-otp", response_model=dict, status_code=status.HTTP_201_CREATED)
def verify_signup_otp(payload: SignupOtpVerify, db: Session = Depends(get_db)):
    email = _normalize_email(payload.email)
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    otp_record = db.query(SignupOtp).filter(SignupOtp.email == email).first()
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code found. Request a new code.",
        )

    now = datetime.utcnow()
    if otp_record.expires_at < now:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code expired. Request a new code.",
        )

    if otp_record.attempts >= OTP_MAX_ATTEMPTS:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many attempts. Request a new code.",
        )

    if not verify_password(payload.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        db.commit()
        if otp_record.attempts >= OTP_MAX_ATTEMPTS:
            db.delete(otp_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many attempts. Request a new code.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    user = User(
        email=email,
        hashed_password=get_password_hash(payload.password),
        full_name=f"{payload.first_name} {payload.last_name}".strip(),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        specialty=payload.specialty,
        license_number=payload.license_number,
        license_state=payload.license_state,
        license_country=payload.license_country,
        npi_number=payload.npi_number,
        taxonomy_code=payload.taxonomy_code,
        clinic_name=payload.clinic_name,
        clinic_address=payload.clinic_address,
        clinic_city=payload.clinic_city,
        clinic_state=payload.clinic_state,
        clinic_zip=payload.clinic_zip,
        clinic_country=payload.clinic_country,
        role=UserRole.admin,
    )
    db.add(user)
    db.delete(otp_record)
    db.commit()
    db.refresh(user)
    token = create_access_token(
        {"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user),
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
