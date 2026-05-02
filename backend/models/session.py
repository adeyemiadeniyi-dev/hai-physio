from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Session(BaseModel):
    """Model for a physiotherapy session"""
    id: Optional[int] = None
    patient_id: str
    exercise_name: str
    reps: int
    pain_score: int  # 1-5 scale
    timestamp: datetime = datetime.utcnow()
    synced: bool = True
    flagged: bool = False


class CoachingRequest(BaseModel):
    """Request model for AI coaching"""
    exercise_name: str


class SessionCreate(BaseModel):
    """Model for creating a new session"""
    patient_id: str
    exercise_name: str
    reps: int
    pain_score: int
    timestamp: Optional[datetime] = None
    synced: Optional[bool] = True
