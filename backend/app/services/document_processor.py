"""
app/services/document_processor.py
----------------------------------
Handles parsing uploaded documents and saving them into FAISS.

LEARNING NOTE:
  - Vector DBs cannot parse PDFs. We must read the text first.
  - Large documents must be "chunked" (split into smaller pieces).
  - Why? Because LLMs have token limits, and vector search works better
    on paragraphs rather than entire books.
  - After splitting, we embed each chunk and save it to FAISS.
"""

import os
from tempfile import NamedTemporaryFile

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

from loguru import logger
from fastapi import UploadFile

from app.core.config import settings

# Shared embedding model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


async def process_and_index_document(file: UploadFile, role: str) -> int:
    """
    1. Read uploaded file.
    2. Extract text (PDF for now).
    3. Split into chunks.
    4. Attach RBAC metadata.
    5. Save to FAISS index.

    Returns:
        Number of chunks indexed.
    """
    # 1. Save uploaded file to a temporary file on disk
    suffix = os.path.splitext(file.filename)[1]
    with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # 2. Extract Text
        if suffix.lower() == ".pdf":
            loader = PyPDFLoader(tmp_path)
            docs = loader.load()
        else:
            raise ValueError(f"Unsupported file type: {suffix}")

        # 3. Split Text into chunks
        # RecursiveCharacterTextSplitter tries to split by paragraphs, then sentences
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # Max 1000 characters per chunk
            chunk_overlap=100,  # 100 characters overlap so we don't cut off context
        )
        chunks = text_splitter.split_documents(docs)

        # 4. Attach RBAC Metadata (the role that can access it)
        for chunk in chunks:
            chunk.metadata["filename"] = file.filename
            chunk.metadata["role"] = role

        # 5. Save to FAISS vector store
        if os.path.exists(settings.VECTOR_STORE_PATH):
            logger.info("Loading existing FAISS index to add new documents...")
            vector_store = FAISS.load_local(
                settings.VECTOR_STORE_PATH,
                embeddings,
                allow_dangerous_deserialization=True,
            )
            vector_store.add_documents(chunks)
        else:
            logger.info("Creating new FAISS index...")
            vector_store = FAISS.from_documents(chunks, embeddings)

        # Save to disk
        vector_store.save_local(settings.VECTOR_STORE_PATH)
        logger.info(f"Successfully indexed {len(chunks)} chunks for role '{role}'.")

        return len(chunks)

    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


async def process_and_index_text(title: str, content: str, role: str) -> int:
    """
    1. Read raw text input.
    2. Split into chunks.
    3. Attach RBAC metadata.
    4. Save to FAISS index.
    """
    try:
        from langchain.schema import Document
        # 1. Create a Document from the raw string
        doc = Document(page_content=content, metadata={"filename": f"{title} (Text snippet)", "role": role})
        
        # 2. Split Text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=100, 
        )
        chunks = text_splitter.split_documents([doc])

        # 3. Save to FAISS vector store
        if os.path.exists(settings.VECTOR_STORE_PATH):
            logger.info("Loading existing FAISS index to add new text documents...")
            vector_store = FAISS.load_local(
                settings.VECTOR_STORE_PATH,
                embeddings,
                allow_dangerous_deserialization=True,
            )
            vector_store.add_documents(chunks)
        else:
            logger.info("Creating new FAISS index...")
            vector_store = FAISS.from_documents(chunks, embeddings)

        # 4. Save to disk
        vector_store.save_local(settings.VECTOR_STORE_PATH)
        logger.info(f"Successfully indexed {len(chunks)} text chunks for role '{role}'.")

        return len(chunks)

    except Exception as e:
        logger.error(f"Failed to process text: {e}")
        raise e
