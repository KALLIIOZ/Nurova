from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
import json

from database.db import get_db, init_db
from models.models import User, Patient, Appointment, MedicalRecord, UserRole
from models.schemas import (
    UserCreate, UserResponse, LoginRequest, LoginResponse,
    PatientCreate, PatientResponse, PatientUpdate,
    AppointmentCreate, AppointmentResponse,
    MedicalRecordCreate, MedicalRecordResponse
)
from core.security import get_password_hash, verify_password, create_access_token, verify_token
from utils.redis_client import RedisClient

app = FastAPI(title="Worker Service", version="1.0.0")
security = HTTPBearer()


# Startup and shutdown events
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


# ============ AUTHENTICATION ROUTES ============

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        last_name=user_data.last_name,
        hashed_password=get_password_hash(user_data.password),
        role=UserRole(user_data.role),
        is_active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Publish event to Redis
    await RedisClient.publish(
        "user_events",
        json.dumps({"event": "user_registered", "user_id": new_user.id})
    )
    
    return new_user


@app.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login user"""
    stmt = select(User).where(User.email == credentials.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    # Cache user in Redis
    await RedisClient.set(
        f"user:{user.id}",
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value
        },
        expire=86400
    )
    
    return LoginResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )


# ============ PATIENT ROUTES ============

@app.post("/patients", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new patient"""
    # Check if patient already exists
    stmt = select(Patient).where(Patient.email == patient_data.email)
    result = await db.execute(stmt)
    existing_patient = result.scalar_one_or_none()
    
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient already exists"
        )
    
    new_patient = Patient(**patient_data.dict())
    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    
    # Publish event to Redis
    await RedisClient.publish(
        "patient_events",
        json.dumps({"event": "patient_created", "patient_id": new_patient.id})
    )
    
    return new_patient


@app.get("/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get patient by ID"""
    stmt = select(Patient).where(Patient.id == patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient


@app.put("/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update patient"""
    stmt = select(Patient).where(Patient.id == patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    update_data = patient_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    patient.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(patient)
    
    # Publish event to Redis
    await RedisClient.publish(
        "patient_events",
        json.dumps({"event": "patient_updated", "patient_id": patient.id})
    )
    
    return patient


@app.get("/patients", response_model=list[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all patients"""
    stmt = select(Patient).offset(skip).limit(limit)
    result = await db.execute(stmt)
    patients = result.scalars().all()
    
    return patients


# ============ APPOINTMENT ROUTES ============

@app.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new appointment"""
    # Verify patient exists
    stmt = select(Patient).where(Patient.id == appointment_data.patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    new_appointment = Appointment(
        **appointment_data.dict(),
        worker_id=current_user.id
    )
    
    db.add(new_appointment)
    await db.commit()
    await db.refresh(new_appointment)
    
    # Publish event to Redis
    await RedisClient.publish(
        "appointment_events",
        json.dumps({"event": "appointment_created", "appointment_id": new_appointment.id})
    )
    
    return new_appointment


@app.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get appointment by ID"""
    stmt = select(Appointment).where(Appointment.id == appointment_id)
    result = await db.execute(stmt)
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    return appointment


@app.get("/appointments", response_model=list[AppointmentResponse])
async def list_appointments(
    skip: int = 0,
    limit: int = 100,
    patient_id: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List appointments"""
    stmt = select(Appointment)
    
    if patient_id:
        stmt = stmt.where(Appointment.patient_id == patient_id)
    
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    appointments = result.scalars().all()
    
    return appointments


# ============ MEDICAL RECORDS ROUTES ============

@app.post("/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a medical record"""
    # Verify patient exists
    stmt = select(Patient).where(Patient.id == record_data.patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    new_record = MedicalRecord(**record_data.dict())
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    
    # Publish event to Redis
    await RedisClient.publish(
        "medical_events",
        json.dumps({"event": "record_created", "record_id": new_record.id})
    )
    
    return new_record


@app.get("/patients/{patient_id}/medical-records", response_model=list[MedicalRecordResponse])
async def get_patient_medical_records(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get medical records for a patient"""
    stmt = select(MedicalRecord).where(MedicalRecord.patient_id == patient_id)
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    return records


# ============ HEALTH CHECK ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "worker"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
