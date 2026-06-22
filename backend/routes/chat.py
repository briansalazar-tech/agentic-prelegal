"""Chat API routes — AI-powered legal document creation."""

import asyncio
from fastapi import APIRouter, HTTPException
from models.chat import ChatRequest, ChatResponse
from services.ai_service import get_greeting, process_message

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/greeting", response_model=ChatResponse)
async def greeting():
    """Return the opening AI greeting to kick off a document conversation."""
    return get_greeting()


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Process the next user message and return an AI reply with extracted fields.

    The full conversation history must be included so the AI can track what
    information has already been gathered.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages list cannot be empty")

    try:
        # Run in a thread pool so the blocking LiteLLM call doesn't stall the event loop
        return await asyncio.to_thread(process_message, request.messages)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI service error: {exc}") from exc
