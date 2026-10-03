"""Authentication: register + login with bcrypt hashing and JWT."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core import security
from app.db import models
from app.db.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_out(user: models.User) -> schemas.UserOut:
    return schemas.UserOut(
        id=user.id, name=user.name, email=user.email,
        age=user.age, phone=user.phone, role=user.role,
    )


@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED,
             summary="Register a new user")
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    weak = security.validate_password_strength(payload.password)
    if weak:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=weak)
    user = models.User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        password_hash=security.hash_password(payload.password),
        age=payload.age,
        phone=payload.phone,
        role="user",
    )
    db.add(user)
    db.flush()
    db.add(models.UserProfile(
        user_id=user.id, concerns=payload.concerns.strip(),
        interests=payload.interests.strip(), bio=payload.description.strip(),
    ))
    db.commit()
    db.refresh(user)
    token = security.create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer", "user": _user_out(user)}


@router.post("/login", response_model=schemas.AuthResponse, summary="Log in with email and password")
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if user is None or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    token = security.create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer", "user": _user_out(user)}
