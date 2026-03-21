from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import httpx
import json
from datetime import datetime, timedelta

from database.db import get_db, init_db
from models.models import User, Analytics, Appointment
from models.schemas import AnalyticsResponse
from core.security import verify_token
from utils.redis_client import RedisClient
from core.config import get_settings

app = FastAPI(title="Manager Service", version="1.0.0")
security = HTTPBearer()
settings = get_settings()


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


# ============ ANALYTICS ROUTES ============

@app.get("/dashboard/overview")
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard overview for manager"""
    try:
        # Get from worker service
        async with httpx.AsyncClient() as client:
            # Get patients count
            patients_response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients?limit=1"
            )
            
            # Get appointments
            appointments_response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/appointments?limit=1"
            )
        
        # Calculate analytics
        stmt = select(Appointment).where(
            Appointment.status == 'completado'
        )
        result = await db.execute(stmt)
        completed_appointments = len(result.scalars().all())
        
        stmt = select(Appointment).where(
            Appointment.status == 'pendiente'
        )
        result = await db.execute(stmt)
        pending_appointments = len(result.scalars().all())
        
        # Get from cache or calculate
        analytics_key = f"analytics:{current_user.id}"
        cached_analytics = await RedisClient.get(analytics_key, json_decode=True)
        
        if cached_analytics:
            return cached_analytics
        
        overview = {
            "completed_appointments": completed_appointments,
            "pending_appointments": pending_appointments,
            "total_appointments": completed_appointments + pending_appointments,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache in Redis
        await RedisClient.set(analytics_key, overview, expire=3600)
        
        return overview
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching dashboard overview"
        )


@app.get("/analytics/departments")
async def get_department_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics by department"""
    try:
        # Get analytics from database
        stmt = select(Analytics).order_by(Analytics.date.desc()).limit(10)
        result = await db.execute(stmt)
        analytics = result.scalars().all()
        
        return [AnalyticsResponse.from_orm(a) for a in analytics]
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching department analytics"
        )


@app.post("/analytics/generate")
async def generate_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate and store analytics"""
    try:
        # Get data from worker service
        async with httpx.AsyncClient() as client:
            patients_response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients"
            )
            appointments_response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/appointments"
            )
        
        patients = patients_response.json() if patients_response.status_code == 200 else []
        appointments = appointments_response.json() if appointments_response.status_code == 200 else []
        
        # Group by department
        departments = {}
        for patient in patients:
            dept = patient.get("department", "Sin departamento")
            if dept not in departments:
                departments[dept] = {
                    "total_patients": 0,
                    "completed_sessions": 0,
                    "pending_sessions": 0
                }
            departments[dept]["total_patients"] += 1
        
        # Count appointments by department
        for appointment in appointments:
            # Get patient department
            patient_id = appointment.get("patient_id")
            patient = next((p for p in patients if p.get("id") == patient_id), None)
            
            if patient:
                dept = patient.get("department", "Sin departamento")
                if dept in departments:
                    if appointment.get("status") == "completado":
                        departments[dept]["completed_sessions"] += 1
                    elif appointment.get("status") == "pendiente":
                        departments[dept]["pending_sessions"] += 1
        
        # Save analytics
        for dept_name, dept_data in departments.items():
            analytics = Analytics(
                department=dept_name,
                total_patients=dept_data["total_patients"],
                completed_sessions=dept_data["completed_sessions"],
                pending_sessions=dept_data["pending_sessions"],
                data=json.dumps(dept_data)
            )
            db.add(analytics)
        
        await db.commit()
        
        # Publish event
        await RedisClient.publish(
            "analytics_events",
            json.dumps({"event": "analytics_generated"})
        )
        
        return {"status": "success", "departments": departments}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating analytics"
        )


# ============ GET DATA FROM OTHER SERVICES ============

@app.get("/patients")
async def get_all_patients(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all patients from worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/patients",
                params={"skip": skip, "limit": limit}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Error fetching patients"
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


@app.get("/appointments")
async def get_all_appointments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all appointments from worker service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.WORKER_SERVICE_URL}/appointments",
                params={"skip": skip, "limit": limit}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Error fetching appointments"
                )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error connecting to worker service"
        )


# ============ REAL-TIME UPDATES WITH REDIS ============

@app.websocket("/ws/analytics/{user_id}")
async def websocket_analytics(websocket, user_id: int):
    """WebSocket endpoint for real-time analytics updates"""
    await websocket.accept()
    
    try:
        # Subscribe to analytics events
        pubsub = await RedisClient.subscribe(f"analytics:{user_id}")
        
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_json(json.loads(message['data']))
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()


# ============ HEALTH CHECK ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "manager"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
