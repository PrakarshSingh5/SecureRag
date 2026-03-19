"""
app/main.py
-----------
The entrypoint for the FastAPI backend application.

LEARNING NOTE:
  - This file ties everything together.
  - We create the `app` instance.
  - We configure CORS (Cross-Origin Resource Sharing) so React can call us.
  - We register all our "routers" (endpoints) here.
  - We trigger SQLAlchemy to create default tables on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.db.database import Base, engine
from app.api.routes import auth, chat, admin

# Create database tables if they don't exist
# (In production, you'd use Alembic migrations instead of create_all)
logger.info("Initializing database tables...")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="A secure internal AI assistant powered by RAG and RBAC.",
    version="1.0.0",
)

# ---- CORS Settings ----
# Crucial for allowing a frontend on localhost:5173 to talk to backend localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# ---- Register Routers ----
# Think of this as snapping lego blocks onto the main base plate
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(admin.router)


@app.get("/", tags=["Health"])
def root():
    """
    Simple health check endpoint.
    """
    return {"message": f"Welcome to {settings.APP_NAME} API. System is running.", "status": "ok"}
