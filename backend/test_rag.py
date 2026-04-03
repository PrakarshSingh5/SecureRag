from app.services.rag_service import rag_service
from app.schemas.chat import ChatRequest

try:
    response = rag_service.query("Hello")
    print(response)
except Exception as e:
    import traceback
    traceback.print_exc()
