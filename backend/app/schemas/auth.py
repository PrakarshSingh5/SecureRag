"""
app/schemas/auth.py
-------------------
Pydantic schemas for request/response validation.

LEARNING NOTE:
  - Schemas are NOT database models — they define the shape of API data.
  - FastAPI uses these to:
      1. Validate incoming request bodies
      2. Serialize (convert) outgoing responses to JSON
  - Think of it as a contract: "this is what I expect / return"

  Example flow:
    POST /login
      → FastAPI reads body → validates against LoginRequest
      → if valid, runs route logic
      → returns data → FastAPI validates against TokenResponse
"""

from pydantic import BaseModel, EmailStr


# ---- Request Schemas (what the frontend SENDS) ----

class LoginRequest(BaseModel):
    """Body for POST /auth/login"""
    email: EmailStr        # Pydantic validates this is a real email format
    password: str


class RegisterRequest(BaseModel):
    """Body for POST /auth/register"""
    email: EmailStr
    password: str
    role: str              # One of: engineering, finance, hr, admin


# ---- Response Schemas (what we SEND BACK to the frontend) ----

class TokenResponse(BaseModel):
    """Returned after a successful login"""
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str


class UserResponse(BaseModel):
    """Safe user representation — never includes the password!"""
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True  # Allows creating this from a SQLAlchemy model
