from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import (
    get_current_active_user,
    get_current_admin,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import PasswordChange, UserProfileUpdate, UserResponse, UserUpdate
from app.services.audit_log import log_event

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
):
    changed_fields = _apply_profile_update(payload, current_user)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    if changed_fields:
        log_event(
            db,
            current_user,
            action="profile.updated",
            entity_type="user",
            entity_id=current_user.id,
            summary="Profile updated",
            metadata={"changed_fields": changed_fields},
            request=request,
        )
    return current_user


@router.patch("/me", response_model=UserResponse)
def patch_me(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
):
    changed_fields = _apply_profile_update(payload, current_user)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    if changed_fields:
        log_event(
            db,
            current_user,
            action="profile.updated",
            entity_type="user",
            entity_id=current_user.id,
            summary="Profile updated",
            metadata={"changed_fields": changed_fields},
            request=request,
        )
    return current_user


def _apply_profile_update(payload: UserProfileUpdate, current_user: User) -> list[str]:
    changed_fields: list[str] = []

    def set_if(field: str, value: str | None) -> None:
        if value is None:
            return
        current_value = getattr(current_user, field)
        if value != current_value:
            setattr(current_user, field, value)
            changed_fields.append(field)

    set_if("first_name", payload.first_name)
    set_if("last_name", payload.last_name)
    set_if("phone", payload.phone)
    set_if("specialty", payload.specialty)
    set_if("license_number", payload.license_number)
    set_if("license_state", payload.license_state)
    set_if("license_country", payload.license_country)
    set_if("npi_number", payload.npi_number)
    set_if("taxonomy_code", payload.taxonomy_code)
    set_if("clinic_name", payload.clinic_name)
    set_if("clinic_address", payload.clinic_address)
    set_if("clinic_city", payload.clinic_city)
    set_if("clinic_state", payload.clinic_state)
    set_if("clinic_zip", payload.clinic_zip)
    set_if("clinic_country", payload.clinic_country)

    if "first_name" in changed_fields or "last_name" in changed_fields:
        full_name_parts = [
            part for part in [current_user.first_name, current_user.last_name] if part
        ]
        if full_name_parts:
            current_user.full_name = " ".join(full_name_parts)

    return changed_fields


def _apply_password_change(
    payload: PasswordChange,
    db: Session,
    current_user: User,
    request: Request,
):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password is incorrect",
        )
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    log_event(
        db,
        current_user,
        action="auth.change_password",
        entity_type="user",
        entity_id=current_user.id,
        summary="Password changed",
        request=request,
    )
    return {"detail": "Password updated successfully"}


@router.post("/change-password", operation_id="change_password_post")
def change_password_post(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
):
    return _apply_password_change(payload, db, current_user, request)


@router.put("/change-password", operation_id="change_password_put")
def change_password_put(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    request: Request = None,
):
    return _apply_password_change(payload, db, current_user, request)


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
