from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    """User role enumeration"""
    WORKER = "worker"
    PSYCHOLOGIST = "psychologist"
    MANAGER = "manager"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    last_name = Column(String, nullable=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.WORKER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointments = relationship("Appointment", back_populates="worker")
    chat_messages = relationship("ChatMessage", back_populates="user")
    survey_responses = relationship("SurveyResponse", back_populates="user")
    
    documents = relationship("Document", back_populates="author")
    comments = relationship("Comment", back_populates="author")


class Patient(Base):
    """Patient/Expediente model"""
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    position = Column(String, nullable=True)
    health_issue = Column(Text, nullable=True)
    observation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointments = relationship("Appointment", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")


class Appointment(Base):
    """Appointment/Session model"""
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), index=True)
    worker_id = Column(Integer, ForeignKey("users.id"), index=True)
    psychologist_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    appointment_date = Column(DateTime, index=True)
    status = Column(String, default="pendiente")  # pendiente, completado, cancelado
    notes = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    worker = relationship("User", back_populates="appointments", foreign_keys=[worker_id])


class MedicalRecord(Base):
    """Medical record/Expediente detalles"""
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), index=True)
    diagnosis = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    notes = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="medical_records")


class ChatMessage(Base):
    """Chat message model for Gemini chatbot"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    content = Column(Text)
    sender = Column(String)  # "user" o "assistant"
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chat_messages")


class Survey(Base):
    """Survey model for Google Forms integration"""
    __tablename__ = "surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    google_form_id = Column(String, unique=True)
    google_form_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class SurveyResponse(Base):
    """Survey response model"""
    __tablename__ = "survey_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    response_data = Column(Text)  # JSON string
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="survey_responses")


class Analytics(Base):
    """Analytics data for managers"""
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    department = Column(String, index=True)
    total_patients = Column(Integer, default=0)
    completed_sessions = Column(Integer, default=0)
    pending_sessions = Column(Integer, default=0)
    average_satisfaction = Column(Float, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    data = Column(Text)  # JSON string with detailed metrics


class Document(Base):
    """Document/File model"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    file_path = Column(String)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="documents")
    comments = relationship("Comment", back_populates="document")


class Comment(Base):
    """Comment model"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    document_id = Column(Integer, ForeignKey("documents.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="comments")
    author = relationship("User", back_populates="comments")
