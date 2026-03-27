import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.session_model import Session

router = APIRouter()


class CreateSessionRequest(BaseModel):
    name: Optional[str] = None
    is_headless: bool = True
    user_agent: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    name: Optional[str]
    status: str
    current_url: Optional[str]
    page_count: int
    memory_mb: float
    requests_count: int
    is_headless: bool
    created_at: str

    class Config:
        from_attributes = True


@router.post("/", response_model=SessionResponse)
async def create_session(req: CreateSessionRequest, db: AsyncSession = Depends(get_db)):
    session = Session(
        id=str(uuid.uuid4()),
        name=req.name or f"Session {datetime.utcnow().strftime('%H:%M:%S')}",
        is_headless=req.is_headless,
        user_agent=req.user_agent,
        status="active",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return _to_response(session)


@router.get("/", response_model=list[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Session).order_by(Session.created_at.desc()).limit(50))
    sessions = result.scalars().all()
    return [_to_response(s) for s in sessions]


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _to_response(session)


@router.delete("/{session_id}")
async def close_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "closed"
    session.closed_at = datetime.utcnow()
    await db.commit()
    return {"message": "Session closed", "id": session_id}


@router.get("/stats/summary")
async def session_stats(db: AsyncSession = Depends(get_db)):
    total = await db.execute(select(func.count(Session.id)))
    active = await db.execute(select(func.count(Session.id)).where(Session.status == "active"))
    return {
        "total_sessions": total.scalar(),
        "active_sessions": active.scalar(),
    }


def _to_response(s: Session) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "status": s.status,
        "current_url": s.current_url,
        "page_count": s.page_count,
        "memory_mb": s.memory_mb,
        "requests_count": s.requests_count,
        "is_headless": s.is_headless,
        "created_at": s.created_at.isoformat(),
    }
