"""
app/models/user.py
------------------
SQLAlchemy ORM model for the User table.

LEARNING NOTE:
  - Each class = a database TABLE.
  - Each attribute with Column() = a column in that table.
  - When you call Base.metadata.create_all(engine), SQLAlchemy
    reads these models and creates the actual tables for you.
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"  # The actual table name in the database

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Role determines which documents this user can access (RBAC)
    role = Column(String, nullable=False)  # e.g. "engineering", "finance", "hr", "admin"

    # Timestamps (auto-managed by the DB)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    def __repr__(self):
        return f"<User email={self.email} role={self.role}>"
