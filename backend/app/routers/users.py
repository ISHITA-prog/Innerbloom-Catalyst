"""Current-user profile endpoints. Users can only read/modify their own profile."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.core.dependencies import get_current_user
from app.db import models
from app.db.database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])


def _me_response(user: models.User, profile: models.UserProfile | None) -> schemas.MeResponse:
    return schemas.MeResponse(
        id=user.id, name=user.name, email=user.email, age=user.age, phone=user.phone,
        role=user.role,
        profile=schemas.ProfileOut(
            concerns=profile.concerns if profile else "",
            interests=profile.interests if profile else "",
            bio=profile.bio if profile else "",
            location=profile.location if profile else "",
            avatar=profile.avatar if profile else "",
        ),
    )


@router.get("/me", response_model=schemas.MeResponse, summary="Get my profile")
def get_me(current: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter_by(user_id=current.id).first()
    return _me_response(current, profile)


@router.put("/me", response_model=schemas.MeResponse, summary="Update my profile")
def update_me(
    payload: schemas.UpdateMeRequest,
    current: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        current.name = payload.name.strip()
    if payload.age is not None:
        current.age = payload.age
    if payload.phone is not None:
        current.phone = payload.phone
    profile = db.query(models.UserProfile).filter_by(user_id=current.id).first()
    if profile is None:
        profile = models.UserProfile(user_id=current.id)
        db.add(profile)
    for field in ("concerns", "interests", "bio", "location", "avatar"):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value.strip())
    db.commit()
    db.refresh(current)
    db.refresh(profile)
    return _me_response(current, profile)
