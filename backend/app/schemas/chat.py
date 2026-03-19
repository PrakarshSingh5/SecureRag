"""
app/schemas/chat.py
-------------------
Pydantic schemas for the RAG chat pipeline.
"""

from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    """Body for POST /chat"""
    query: str


class SourceDocument(BaseModel):
    """A single retrieved document chunk used as context"""
    filename: str
    page: Optional[int] = None
    score: Optional[float] = None  # Similarity score from FAISS


class ChatResponse(BaseModel):
    """Returned after RAG generates an answer"""
    answer: str
    sources: list[SourceDocument] = []
    guardrail_triggered: bool = False  # True if a guardrail blocked/modified the response
    tokens_used: Optional[int] = None  # For cost monitoring
