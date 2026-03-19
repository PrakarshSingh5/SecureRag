"""
app/api/routes/admin.py
-----------------------
Routes limited to admin users for document indexing.

LEARNING NOTE:
  - We use `Depends(require_roles(["admin"]))` globally on this router.
  - If a logged-in engineer or HR tries to hit this endpoint, they get a 403 Forbidden.
  - Documents are processed async (`await file.read()`) to scale better.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from loguru import logger

from pydantic import BaseModel
from app.middleware.auth_middleware import require_roles
from app.services.document_processor import process_and_index_document, process_and_index_text

class TextUploadRequest(BaseModel):
    title: str
    content: str
    role: str

# Important: This entire router requires the user to be an 'admin'
router = APIRouter(
    prefix="/admin",
    tags=["Admin Tools"],
    dependencies=[Depends(require_roles(["admin"]))]
)


@router.post("/upload")
async def upload_document(
    role: str = Form(...),          # The role allowed to see this document
    file: UploadFile = File(...)    # The actual PDF file bytes
):
    """
    1. Check if user is an admin + read JWT (handled by dependency).
    2. Upload file.
    3. Extract, chunk, embed, and store in FAISS.
    """
    logger.info(f"Admin uploading file: {file.filename} for role: {role}")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently.")

    if not role:
        raise HTTPException(status_code=400, detail="A role must be assigned to the document.")

    # Await the async background processing function
    try:
        chunks_indexed = await process_and_index_document(file, role.lower())
    except Exception as e:
        logger.error(f"Error processing file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process document.")

    return {
        "status": "success",
        "file": file.filename,
        "role_assigned": role.lower(),
        "chunks_indexed": chunks_indexed
    }

@router.post("/add-text")
async def add_text_knowledge(
    request: TextUploadRequest
):
    """
    1. Check if user is an admin + read JWT (handled by dependency).
    2. Upload manual text blocks for RAG DB.
    3. Extract, chunk, embed, and store in FAISS.
    """
    logger.info(f"Admin adding text block: '{request.title}' for role: {request.role}")

    if not request.title or not request.content:
        raise HTTPException(status_code=400, detail="Title and content cannot be empty.")

    if not request.role:
        raise HTTPException(status_code=400, detail="A role must be assigned to the text chunk.")

    try:
        chunks_indexed = await process_and_index_text(request.title, request.content, request.role.lower())
    except Exception as e:
        logger.error(f"Error processing text '{request.title}': {e}")
        raise HTTPException(status_code=500, detail="Failed to embed text knowledge.")

    return {
        "status": "success",
        "title": request.title,
        "role_assigned": request.role.lower(),
        "chunks_indexed": chunks_indexed
    }
