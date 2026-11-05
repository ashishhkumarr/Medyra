from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.session import get_db
from app.models.encounter import Encounter
from app.models.patient import Patient
from app.models.user import User
from app.schemas.encounter import (
    EncounterCreate,
    EncounterResponse,
    EncounterUpdate,
)

router = APIRouter(prefix="/encounters", tags=["encounters"])


def _get_encounter(db: Session, encounter_id: int, owner_user_id: int) -> Encounter:
    encounter = (
        db.query(Encounter)
        .filter(
            Encounter.id == encounter_id,
            Encounter.owner_user_id == owner_user_id,
        )
        .first()
    )
    if not encounter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Encounter not found"
        )
    return encounter


def _assert_patient(db: Session, patient_id: int, owner_user_id: int) -> Patient:
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.owner_user_id == owner_user_id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    return patient


@router.get("/", response_model=list[EncounterResponse])
def list_encounters(
    patient_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    query = db.query(Encounter).filter(Encounter.owner_user_id == current_user.id)
    if patient_id is not None:
        query = query.filter(Encounter.patient_id == patient_id)
    return query.order_by(Encounter.encounter_date.desc()).all()


@router.get("/recent", response_model=list[EncounterResponse])
def recent_encounters(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    limit = max(1, min(limit, 50))
    return (
        db.query(Encounter)
        .filter(Encounter.owner_user_id == current_user.id)
        .order_by(Encounter.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/", response_model=EncounterResponse, status_code=status.HTTP_201_CREATED)
def create_encounter(
    payload: EncounterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    _assert_patient(db, payload.patient_id, current_user.id)
    data = payload.dict(exclude_unset=True)
    if not data.get("encounter_date"):
        data["encounter_date"] = datetime.utcnow()
    data["owner_user_id"] = current_user.id
    data["status"] = "Draft"
    encounter = Encounter(**data)
    db.add(encounter)
    db.commit()
    db.refresh(encounter)
    return encounter


@router.get("/{encounter_id}", response_model=EncounterResponse)
def get_encounter(
    encounter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return _get_encounter(db, encounter_id, current_user.id)


@router.put("/{encounter_id}", response_model=EncounterResponse)
def update_encounter(
    encounter_id: int,
    payload: EncounterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    encounter = _get_encounter(db, encounter_id, current_user.id)
    if encounter.status == "Signed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A signed encounter cannot be edited.",
        )
    data = payload.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(encounter, field, value)
    db.add(encounter)
    db.commit()
    db.refresh(encounter)
    return encounter


@router.post("/{encounter_id}/sign", response_model=EncounterResponse)
def sign_encounter(
    encounter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    encounter = _get_encounter(db, encounter_id, current_user.id)
    encounter.status = "Signed"
    encounter.signed_at = datetime.utcnow()
    db.add(encounter)
    db.commit()
    db.refresh(encounter)
    return encounter


@router.delete("/{encounter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_encounter(
    encounter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    encounter = _get_encounter(db, encounter_id, current_user.id)
    db.delete(encounter)
    db.commit()
