import os
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration"""
    
    # API
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/app.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    
    # Google APIs
    GOOGLE_FORMS_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:19006",
        "http://localhost:19007",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:8003",
    ]
    
    # Service Ports
    WORKER_SERVICE_PORT: int = 8001
    PSYCHOLOGIST_SERVICE_PORT: int = 8002
    MANAGER_SERVICE_PORT: int = 8003
    API_GATEWAY_PORT: int = 8000
    
    # Service URLs
    WORKER_SERVICE_URL: str = "http://localhost:8001"
    PSYCHOLOGIST_SERVICE_URL: str = "http://localhost:8002"
    MANAGER_SERVICE_URL: str = "http://localhost:8003"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
