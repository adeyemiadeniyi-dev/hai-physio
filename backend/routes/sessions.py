from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from models.session import Session as SessionModel, SessionCreate

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Database setup - PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hai_physio")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLAlchemy model
class SessionDB(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=False)
    exercise_name = Column(String, nullable=False)
    reps = Column(Integer, nullable=False)
    pain_score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    synced = Column(Boolean, default=True)
    flagged = Column(Boolean, default=False)


# Create tables
Base.metadata.create_all(bind=engine)


@contextmanager
def get_db():
    """Context manager for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=SessionModel, status_code=201)
async def create_session(session: SessionCreate):
    """Create a new physiotherapy session"""
    try:
        timestamp = session.timestamp or datetime.utcnow()
        
        with get_db() as db:
            db_session = SessionDB(
                patient_id=session.patient_id,
                exercise_name=session.exercise_name,
                reps=session.reps,
                pain_score=session.pain_score,
                timestamp=timestamp,
                synced=session.synced if session.synced is not None else True,
                flagged=False
            )
            
            db.add(db_session)
            db.commit()
            db.refresh(db_session)
            
            return SessionModel(
                id=db_session.id,
                patient_id=db_session.patient_id,
                exercise_name=db_session.exercise_name,
                reps=db_session.reps,
                pain_score=db_session.pain_score,
                timestamp=db_session.timestamp,
                synced=db_session.synced,
                flagged=db_session.flagged
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/{patient_id}", response_model=List[SessionModel])
async def get_patient_sessions(patient_id: str):
    """Get all sessions for a specific patient"""
    try:
        with get_db() as db:
            sessions = db.query(SessionDB).filter(
                SessionDB.patient_id == patient_id
            ).order_by(SessionDB.timestamp.desc()).all()
            
            return [
                SessionModel(
                    id=s.id,
                    patient_id=s.patient_id,
                    exercise_name=s.exercise_name,
                    reps=s.reps,
                    pain_score=s.pain_score,
                    timestamp=s.timestamp,
                    synced=s.synced,
                    flagged=s.flagged
                )
                for s in sessions
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")


@router.patch("/{session_id}/flag")
async def flag_session(session_id: int, flagged: bool = True):
    """Flag or unflag a session for clinician attention"""
    try:
        with get_db() as db:
            session = db.query(SessionDB).filter(SessionDB.id == session_id).first()
            
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            session.flagged = flagged
            db.commit()
            
            return {"success": True, "session_id": session_id, "flagged": flagged}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to flag session: {str(e)}")