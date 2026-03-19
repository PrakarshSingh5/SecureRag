"""
app/api/routes/auth.py
----------------------
Authentication routes (login, register).

LEARNING NOTE:
  - APIRouter is a mini-FastAPI instance. It groups routes together.
  - POST requests take a Pydantic body and return JSON.
  - Dependencies (Depends) ensure db sessions exist cleanly.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.config import settings
from app.core.security import verify_password, hash_password, create_access_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user with a hashed password and role.
    """
    # 1. Check if email already exists
    user_db = db.query(User).filter(User.email == user_in.email).first()
    if user_db:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists."
        )

    # 2. Hash password and save
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role.lower(),
    )
    db.add(new_user)
    db.commit()      # Execute SQL insert
    db.refresh(new_user) # Load generated ID
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """
    Check password and return a JWT access token.
    """
    # 1. Find user by email
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # 2. Verify hashed password
    if not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # 3. Create JWT token
    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        role=user.role,
        email=user.email
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Verify the token is valid and return my user info.
    `get_current_user` extracts JWT and finds the user automatically!
    """
    return current_user
