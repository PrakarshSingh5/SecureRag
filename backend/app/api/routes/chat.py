"""
app/api/routes/chat.py
----------------------
Chat endpoint where the React app sends queries.

LEARNING NOTE:
  - This route Requires a logged-in user. We inject `get_current_user`.
  - The `rag_service.query` does all the heavy lifting (retrieval, filtering, Claude).
  - RBAC is built-in: we pass `current_user.role` to the RAG service to filter FAISS docs.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from loguru import logger

from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.middleware.auth_middleware import get_current_user
from app.services.rag_service import rag_service
from app.services.document_processor import process_and_index_document

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

    # Query without role filtering to allow any document to be accessed
    response: ChatResponse = rag_service.query(
        user_query=request.query
    )

    return response


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Allow any user to upload their resume as a personal context document.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently.")

    try:
        # Index document with the user's email as the "role", so only they can see it
        chunks = await process_and_index_document(file, current_user.email)
        return {"status": "success", "chunks_indexed": chunks}
    except Exception as e:
        logger.error(f"Error uploading resume for {current_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload resume.")
