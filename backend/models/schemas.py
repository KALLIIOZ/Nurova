from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    last_name: Optional[str] = None
    role: str = "worker"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Login schemas
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    user: UserResponse


# Patient schemas
class PatientBase(BaseModel):
    name: str
    last_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    health_issue: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    health_issue: Optional[str] = None
    observation: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    observation: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Appointment schemas
class AppointmentBase(BaseModel):
    patient_id: int
    appointment_date: datetime
    status: str = "pendiente"


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentResponse(AppointmentBase):
    id: int
    worker_id: int
    psychologist_id: Optional[int]
    notes: Optional[str]
    transcript: Optional[str]
    summary: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Medical Record schemas
class MedicalRecordBase(BaseModel):
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: str


class MedicalRecordCreate(MedicalRecordBase):
    patient_id: int


class MedicalRecordResponse(MedicalRecordBase):
    id: int
    patient_id: int
    date: datetime
    
    class Config:
        from_attributes = True


# Chat schemas
class ChatMessageBase(BaseModel):
    content: str
    sender: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str


# Survey schemas
class SurveyBase(BaseModel):
    title: str
    description: Optional[str] = None
    google_form_id: str
    google_form_url: str


class SurveyCreate(SurveyBase):
    pass


class SurveyResponse(SurveyBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class SurveyResponseCreate(BaseModel):
    survey_id: int
    response_data: dict


class SurveyResponseItem(BaseModel):
    id: int
    survey_id: int
    user_id: int
    response_data: dict
    submitted_at: datetime
    
    class Config:
        from_attributes = True


# Analytics schemas
class AnalyticsData(BaseModel):
    department: str
    total_patients: int
    completed_sessions: int
    pending_sessions: int
    average_satisfaction: Optional[float]
    date: datetime


class AnalyticsResponse(AnalyticsData):
    id: int
    
    class Config:
        from_attributes = True
