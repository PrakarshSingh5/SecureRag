"""
app/api/routes/chat.py
----------------------
Chat endpoint where the React app sends queries.

LEARNING NOTE:
  - This route Requires a logged-in user. We inject `get_current_user`.
  - The `rag_service.query` does all the heavy lifting (retrieval, filtering, Claude).
  - RBAC is built-in: we pass `current_user.role` to the RAG service to filter FAISS docs.
"""

from fastapi import APIRouter, Depends
from loguru import logger

from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.middleware.auth_middleware import get_current_user
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("/", response_model=ChatResponse)
def ask_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    1. Receive a query.
    2. Read the user's role from their JWT.
    3. Ask the RAG service for an answer (filtered by role).
    """
    logger.info(f"User '{current_user.email}' (Role: {current_user.role}) asked: {request.query}")

    # Pass the role so RAG can filter out non-allowed documents
    response: ChatResponse = rag_service.query(
        user_query=request.query,
        user_role=current_user.role
    )

    return response
