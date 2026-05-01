from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import sqlite3
from contextlib import contextmanager
import os

from models.session import Session, SessionCreate

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sessions.db")


@contextmanager
def get_db():
    """Context manager for database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """Initialize the database with sessions table"""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL,
                exercise_name TEXT NOT NULL,
                reps INTEGER NOT NULL,
                pain_score INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                synced BOOLEAN DEFAULT 1,
                flagged BOOLEAN DEFAULT 0
            )
        """)
        conn.commit()


# Initialize database on module load
init_db()


@router.post("", response_model=Session, status_code=201)
async def create_session(session: SessionCreate):
    """Create a new physiotherapy session"""
    try:
        timestamp = session.timestamp or datetime.utcnow()
        
        with get_db() as conn:
            cursor = conn.execute(
                """
                INSERT INTO sessions (patient_id, exercise_name, reps, pain_score, timestamp, synced)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    session.patient_id,
                    session.exercise_name,
                    session.reps,
                    session.pain_score,
                    timestamp.isoformat(),
                    session.synced if session.synced is not None else True
                )
            )
            conn.commit()
            session_id = cursor.lastrowid
            
            # Fetch the created session
            row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
            
            return Session(
                id=row["id"],
                patient_id=row["patient_id"],
                exercise_name=row["exercise_name"],
                reps=row["reps"],
                pain_score=row["pain_score"],
                timestamp=datetime.fromisoformat(row["timestamp"]),
                synced=bool(row["synced"]),
                flagged=bool(row["flagged"])
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/{patient_id}", response_model=List[Session])
async def get_patient_sessions(patient_id: str):
    """Get all sessions for a specific patient"""
    try:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM sessions WHERE patient_id = ? ORDER BY timestamp DESC",
                (patient_id,)
            ).fetchall()
            
            sessions = [
                Session(
                    id=row["id"],
                    patient_id=row["patient_id"],
                    exercise_name=row["exercise_name"],
                    reps=row["reps"],
                    pain_score=row["pain_score"],
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    synced=bool(row["synced"]),
                    flagged=bool(row["flagged"])
                )
                for row in rows
            ]
            
            return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")


@router.patch("/{session_id}/flag")
async def flag_session(session_id: int, flagged: bool = True):
    """Flag or unflag a session for clinician attention"""
    try:
        with get_db() as conn:
            cursor = conn.execute(
                "UPDATE sessions SET flagged = ? WHERE id = ?",
                (flagged, session_id)
            )
            conn.commit()
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Session not found")
            
            return {"success": True, "session_id": session_id, "flagged": flagged}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to flag session: {str(e)}")
