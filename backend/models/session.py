from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional


class Session(BaseModel):
    id: Optional[int] = None
    patient_id: str
    exercise_name: str
    reps: int
    pain_score: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
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
