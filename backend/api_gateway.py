from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
import json
from datetime import datetime

from database.db import get_db, init_db
from models.models import User, Survey, SurveyResponse
from models.schemas import (
    LoginRequest, LoginResponse, UserResponse,
    SurveyCreate, SurveyResponse as SurveyResponseSchema
)
from core.config import get_settings
from core.security import verify_token
from utils.redis_client import RedisClient
from utils.google_forms_client import GoogleFormsClient, extract_form_id_from_url

app = FastAPI(title="API Gateway", version="1.0.0")
security = HTTPBearer()
settings = get_settings()
google_forms_client = GoogleFormsClient()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# ============ AUTHENTICATION ROUTES (delegate to worker service) ============

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data):
    """Register a new user - delegates to worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.WORKER_SERVICE_URL}/auth/register",
                json=user_data.dict()
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("detail", "Error registering user")
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


@app.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login user - delegates to worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.WORKER_SERVICE_URL}/auth/login",
                json=credentials.dict()
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("detail", "Invalid credentials")
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


# ============ SURVEY ROUTES ============

@app.post("/surveys", response_model=SurveyResponseSchema)
async def create_survey(
    survey_data: SurveyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or add a new survey"""
    try:
        # Extract form ID from URL if needed
        form_id = extract_form_id_from_url(survey_data.google_form_url)
        if not form_id:
            form_id = survey_data.google_form_id
        
        # Get form details from Google Forms API
        form_details = await google_forms_client.get_form_info(form_id)
        
        # Check if survey already exists
        stmt = select(Survey).where(Survey.google_form_id == form_id)
        result = await db.execute(stmt)
        existing_survey = result.scalar_one_or_none()
        
        if existing_survey:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Survey already exists"
            )
        
        # Create survey
        new_survey = Survey(
            title=survey_data.title or form_details.get("title", "Encuesta"),
            description=survey_data.description or form_details.get("description", ""),
            google_form_id=form_id,
            google_form_url=survey_data.google_form_url
        )
        
        db.add(new_survey)
        await db.commit()
        await db.refresh(new_survey)
        
        # Publish event
        await RedisClient.publish(
            "survey_events",
            json.dumps({"event": "survey_created", "survey_id": new_survey.id})
        )
        
        return new_survey
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating survey"
        )


@app.get("/surveys/{survey_id}")
async def get_survey(
    survey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get survey details"""
    try:
        stmt = select(Survey).where(Survey.id == survey_id)
        result = await db.execute(stmt)
        survey = result.scalar_one_or_none()
        
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Survey not found"
            )
        
        # Get form details
        form_details = await google_forms_client.get_form_info(survey.google_form_id)
        
        return {
            "id": survey.id,
            "title": survey.title,
            "description": survey.description,
            "google_form_url": survey.google_form_url,
            "form_items": form_details.get("items", [])
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching survey"
        )


@app.get("/surveys")
async def list_surveys(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all surveys"""
    try:
        stmt = select(Survey).offset(skip).limit(limit)
        result = await db.execute(stmt)
        surveys = result.scalars().all()
        
        return surveys
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching surveys"
        )


@app.post("/surveys/{survey_id}/responses")
async def submit_survey_response(
    survey_id: int,
    response_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit survey response"""
    try:
        # Verify survey exists
        stmt = select(Survey).where(Survey.id == survey_id)
        result = await db.execute(stmt)
        survey = result.scalar_one_or_none()
        
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Survey not found"
            )
        
        # Check if user already responded
        stmt = select(SurveyResponse).where(
            (SurveyResponse.survey_id == survey_id) &
            (SurveyResponse.user_id == current_user.id)
        )
        result = await db.execute(stmt)
        existing_response = result.scalar_one_or_none()
        
        if existing_response:
            # Update existing response
            existing_response.response_data = json.dumps(response_data)
            existing_response.submitted_at = datetime.utcnow()
        else:
            # Create new response
            new_response = SurveyResponse(
                survey_id=survey_id,
                user_id=current_user.id,
                response_data=json.dumps(response_data)
            )
            db.add(new_response)
        
        await db.commit()
        
        # Publish event
        await RedisClient.publish(
            "survey_events",
            json.dumps({
                "event": "survey_response_submitted",
                "survey_id": survey_id,
                "user_id": current_user.id
            })
        )
        
        return {"status": "success", "message": "Survey response submitted"}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error submitting survey response"
        )


@app.get("/surveys/{survey_id}/responses")
async def get_survey_responses(
    survey_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get survey responses (for survey creator/manager only)"""
    try:
        stmt = select(SurveyResponse).where(SurveyResponse.survey_id == survey_id)
        result = await db.execute(stmt)
        responses = result.scalars().all()
        
        return [
            {
                "user_id": r.user_id,
                "response_data": json.loads(r.response_data),
                "submitted_at": r.submitted_at
            }
            for r in responses
        ]
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching survey responses"
        )


# ============ PROXY ROUTES TO SERVICES ============

@app.get("/patients")
async def get_patients(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Proxy request to worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients",
                params={"skip": skip, "limit": limit},
                headers={"Authorization": f"Bearer {current_user.id}"}
            )
            return response.json()
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


@app.get("/chat/message")
async def send_message(
    message: str,
    current_user: User = Depends(get_current_user)
):
    """Proxy chat request to psychologist service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.PSYCHOLOGIST_SERVICE_URL}/chat/message",
                json={"message": message},
                headers={"Authorization": f"Bearer {current_user.id}"}
            )
            return response.json()
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to psychologist service"
        )


@app.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user)
):
    """Proxy dashboard request to manager service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.MANAGER_SERVICE_URL}/dashboard/overview",
                headers={"Authorization": f"Bearer {current_user.id}"}
            )
            return response.json()
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to manager service"
        )


# ============ HEALTH CHECK ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "api-gateway",
        "services": {
            "worker": "http://localhost:8001/health",
            "psychologist": "http://localhost:8002/health",
            "manager": "http://localhost:8003/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
