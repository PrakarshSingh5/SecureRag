"""
app/core/security.py
--------------------
JWT token creation and verification + password hashing.

LEARNING NOTE:
  - JWT (JSON Web Token) is a compact, URL-safe token containing user info.
  - Structure: header.payload.signature  (3 parts separated by dots)
  - We sign it with SECRET_KEY so only our server can verify it.
  - passlib handles bcrypt hashing — NEVER store plain text passwords!
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# --- Password Hashing ---
# CryptContext handles bcrypt hashing (a secure one-way hash)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Convert a plain text password into a secure bcrypt hash."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain password matches a stored hash. Returns True/False."""
    return pwd_context.verify(plain_password, hashed_password)


# --- JWT Tokens ---
def create_access_token(data: dict) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: dict with user info (e.g., {"sub": "user@email.com", "role": "engineering"})

    Returns:
        A signed JWT string to send to the frontend.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    """
    Decode and verify a JWT token.

    Returns:
        The payload dict if valid, or None if expired/invalid.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
