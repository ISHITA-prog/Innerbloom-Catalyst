"""AI/RAG placeholder — NOT implemented by design."""
from fastapi import APIRouter

from app.services import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/wellness", summary="AI wellness assistant (placeholder)")
def wellness_stub():
    return ai_service.wellness_placeholder()
