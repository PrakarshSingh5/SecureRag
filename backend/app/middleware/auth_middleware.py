"""
app/middleware/auth_middleware.py
---------------------------------
FastAPI Dependency for RBAC (Role-Based Access Control).

LEARNING NOTE:
  - FastAPI "Dependencies" (Depends) are re-usable functions injected into routes.
  - `get_current_user` reads the JWT from the Authorization header,
    verifies it, and returns the user. If anything fails, it raises
    a 401 HTTP error automatically.
  - `require_roles` is a *factory* — it returns a dependency that
    checks the role, allowing easy per-route role enforcement.

  Usage in a route:
    @router.get("/secret")
    def secret(user = Depends(require_roles(["admin", "engineering"]))):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

# HTTPBearer extracts the token from the "Authorization: Bearer <token>" header
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency: Decode JWT and return the authenticated User object.
    Raises 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token payload malformed")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def require_roles(allowed_roles: list[str]):
    """
    Role-gating factory. Returns a FastAPI dependency that
    only allows users whose role is in `allowed_roles`.

    Example: Depends(require_roles(["admin"]))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}",
            )
        return current_user

    return role_checker
