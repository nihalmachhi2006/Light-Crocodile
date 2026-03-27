import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.task_model import Task
from app.services.browser_engine import get_browser_engine

router = APIRouter()


class CreateTaskRequest(BaseModel):
    session_id: str
    name: str
    type: str  # scrape, navigate, extract, monitor
    target_url: str
    instructions: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    session_id: str
    name: str
    type: str
    status: str
    target_url: Optional[str]
    instructions: Optional[str]
    result: Optional[dict]
    score: Optional[float]
    duration_ms: Optional[float]
    created_at: str
    completed_at: Optional[str]


@router.post("/", response_model=TaskResponse)
async def create_task(req: CreateTaskRequest, db: AsyncSession = Depends(get_db)):
    task = Task(
        id=str(uuid.uuid4()),
        session_id=req.session_id,
        name=req.name,
        type=req.type,
        status="pending",
        target_url=req.target_url,
        instructions=req.instructions,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _to_response(task)


@router.post("/{task_id}/run", response_model=TaskResponse)
async def run_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    start = datetime.utcnow()
    task.status = "running"
    await db.commit()

    engine = await get_browser_engine()
    obs = await engine.fetch(task.target_url)

    elapsed = (datetime.utcnow() - start).total_seconds() * 1000
    score = 1.0 if not obs.error else 0.0
    if obs.error:
        score = 0.0
    elif obs.status_code and obs.status_code >= 400:
        score = 0.3
    else:
        score = min(1.0, obs.elements_count / 10) if obs.elements_count else 0.5

    task.status = "completed"
    task.result = {
        "url": obs.url,
        "title": obs.title,
        "status_code": obs.status_code,
        "elements_found": obs.elements_count,
        "links_found": obs.links_count,
        "load_time_ms": obs.load_time_ms,
        "memory_mb": obs.memory_mb,
        "error": obs.error,
    }
    task.score = round(score, 3)
    task.duration_ms = round(elapsed, 2)
    task.completed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return _to_response(task)


@router.get("/session/{session_id}", response_model=list[TaskResponse])
async def list_tasks(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Task).where(Task.session_id == session_id).order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()
    return [_to_response(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _to_response(task)


def _to_response(t: Task) -> dict:
    return {
        "id": t.id,
        "session_id": t.session_id,
        "name": t.name,
        "type": t.type,
        "status": t.status,
        "target_url": t.target_url,
        "instructions": t.instructions,
        "result": t.result,
        "score": t.score,
        "duration_ms": t.duration_ms,
        "created_at": t.created_at.isoformat(),
        "completed_at": t.completed_at.isoformat() if t.completed_at else None,
    }
