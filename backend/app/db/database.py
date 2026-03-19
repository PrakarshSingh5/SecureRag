"""
app/db/database.py
------------------
SQLAlchemy database connection and session management.

LEARNING NOTE:
  - SQLAlchemy is an ORM (Object-Relational Mapper).
  - Instead of writing raw SQL, you work with Python classes (models).
  - SessionLocal is a "factory" that creates a new DB session per request.
  - The `get_db` function is a FastAPI dependency — it gives each route
    a fresh DB session and closes it cleanly after the request finishes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

# Create the SQLAlchemy engine (the connection to the actual DB file/server)
# connect_args={"check_same_thread": False} is required for SQLite only
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

# SessionLocal is a class — each call creates a new database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class that all SQLAlchemy models will inherit from
class Base(DeclarativeBase):
    pass


# ----- FastAPI Dependency -----
def get_db():
    """
    Yields a DB session for a single request, then closes it.
    Usage in routes: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
