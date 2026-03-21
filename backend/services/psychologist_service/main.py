from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
import json
from datetime import datetime

from database.db import get_db, init_db
from models.models import User, ChatMessage
from models.schemas import ChatMessageCreate, ChatMessageResponse, ChatRequest
from core.security import verify_token
from utils.redis_client import RedisClient
from utils.gemini_client import GeminiClient, PsychologistSystemPrompt
from core.config import get_settings

app = FastAPI(title="Psychologist Service", version="1.0.0")
security = HTTPBearer()
settings = get_settings()
gemini_client = GeminiClient()


@app.on_event("startup")
async def startup():
    """Initialize database and Redis connection"""
    await init_db()
    await RedisClient.connect()


@app.on_event("shutdown")
async def shutdown():
    """Close Redis connection"""
    await RedisClient.disconnect()


# Dependency for getting current user
async def get_current_user(
    credentials: HTTPAuthCredential = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    stmt = select(User).where(User.id == int(user_id))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


# ============ CHAT ROUTES WITH GEMINI ============

@app.post("/chat/message")
async def send_chat_message(
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send message to chatbot and get response"""
    try:
        # Get conversation history from Redis
        history_key = f"chat_history:{current_user.id}"
        history_data = await RedisClient.get(history_key, json_decode=True)
        conversation_history = history_data if history_data else []
        
        # Get response from Gemini with system prompt
        response_text = await gemini_client.get_response_with_system_prompt(
            chat_request.message,
            PsychologistSystemPrompt.PROMPT
        )
        
        # Save user message to database
        user_message = ChatMessage(
            user_id=current_user.id,
            content=chat_request.message,
            sender="user"
        )
        db.add(user_message)
        await db.commit()
        
        # Save assistant message to database
        assistant_message = ChatMessage(
            user_id=current_user.id,
            content=response_text,
            sender="assistant"
        )
        db.add(assistant_message)
        await db.commit()
        
        # Update conversation history in Redis
        conversation_history.append({
            "role": "user",
            "parts": [chat_request.message]
        })
        conversation_history.append({
            "role": "model",
            "parts": [response_text]
        })
        
        await RedisClient.set(history_key, conversation_history, expire=86400)
        
        # Publish event
        await RedisClient.publish(
            "chat_events",
            json.dumps({
                "event": "message_sent",
                "user_id": current_user.id,
                "message": response_text
            })
        )
        
        return {
            "status": "success",
            "message": response_text,
            "user_id": current_user.id
        }
    
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing chat message"
        )


@app.get("/chat/history")
async def get_chat_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get chat history for current user"""
    stmt = select(ChatMessage).where(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.timestamp.desc()).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    return [ChatMessageResponse.from_orm(m) for m in messages]


@app.delete("/chat/history")
async def clear_chat_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear chat history for current user"""
    stmt = select(ChatMessage).where(ChatMessage.user_id == current_user.id)
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    for message in messages:
        await db.delete(message)
    
    await db.commit()
    
    # Clear Redis history
    await RedisClient.delete(f"chat_history:{current_user.id}")
    
    return {"status": "success", "message": "Chat history cleared"}


# ============ GET PATIENT DATA FROM WORKER SERVICE ============

@app.get("/patients")
async def get_psychologist_patients(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get patients from worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients",
                params={"skip": skip, "limit": limit},
                headers={"Authorization": f"Bearer {current_user.id}"}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Error fetching patients from worker service"
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


@app.get("/patients/{patient_id}")
async def get_patient_details(
    patient_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get patient details from worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients/{patient_id}"
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Patient not found"
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


@app.get("/patients/{patient_id}/medical-records")
async def get_patient_records(
    patient_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get patient medical records from worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients/{patient_id}/medical-records"
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Medical records not found"
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


# ============ HEALTH CHECK ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "psychologist"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
