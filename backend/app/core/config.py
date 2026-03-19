"""
app/core/config.py
------------------
Centralized settings management using Pydantic BaseSettings.
All values are read from the .env file automatically.

LEARNING NOTE:
  - pydantic-settings reads environment variables case-insensitively.
  - Accessing settings: from app.core.config import settings
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "SecureRAG"
    DEBUG: bool = False
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # --- Claude API ---
    ANTHROPIC_API_KEY: str

    # --- JWT ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./securerag.db"

    # --- Vector Store ---
    VECTOR_STORE_PATH: str = "./data/vectorstore"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton instance — import this everywhere
settings = Settings()
