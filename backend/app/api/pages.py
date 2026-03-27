import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.page_model import Page
from app.models.session_model import Session
from app.services.browser_engine import get_browser_engine

router = APIRouter()


class FetchPageRequest(BaseModel):
    session_id: str
    url: str


class PageResponse(BaseModel):
    id: str
    session_id: str
    url: str
    title: Optional[str]
    status_code: Optional[int]
    load_time_ms: Optional[float]
    memory_mb: Optional[float]
    content_length: Optional[int]
    elements_count: Optional[int]
    links_count: Optional[int]
    error: Optional[str]
    created_at: str
    observation: Optional[dict] = None


@router.post("/fetch", response_model=PageResponse)
async def fetch_page(req: FetchPageRequest, db: AsyncSession = Depends(get_db)):
    # Validate session
    result = await db.execute(select(Session).where(Session.id == req.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "closed":
        raise HTTPException(status_code=400, detail="Session is closed")

    # Fetch via browser engine
    engine = await get_browser_engine()
    obs = await engine.fetch(req.url)

    # Store page record
    page = Page(
        id=str(uuid.uuid4()),
        session_id=req.session_id,
        url=obs.url,
        title=obs.title,
        status_code=obs.status_code,
        load_time_ms=obs.load_time_ms,
        memory_mb=obs.memory_mb,
        content_length=obs.content_length,
        elements_count=len(obs.interactive_elements),
        links_count=len(obs.links),
        error=obs.error,
        created_at=datetime.utcnow(),
    )
    db.add(page)

    # Update session stats
    session.current_url = obs.url
    session.page_count += 1
    session.requests_count += 1
    session.memory_mb = obs.memory_mb
    session.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(page)

    return {
        "id": page.id,
        "session_id": page.session_id,
        "url": page.url,
        "title": page.title,
        "status_code": page.status_code,
        "load_time_ms": page.load_time_ms,
        "memory_mb": page.memory_mb,
        "content_length": page.content_length,
        "elements_count": page.elements_count,
        "links_count": page.links_count,
        "error": page.error,
        "created_at": page.created_at.isoformat(),
        "observation": {
            "text_content": obs.text_content[:2000],
            "interactive_elements": [
                {
                    "id": e.id,
                    "type": e.type,
                    "text": e.text,
                    "href": e.href,
                    "placeholder": e.placeholder,
                }
                for e in obs.interactive_elements
            ],
            "links": obs.links[:20],
        },
    }


@router.get("/session/{session_id}", response_model=list[PageResponse])
async def list_pages(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Page).where(Page.session_id == session_id).order_by(Page.created_at.desc()).limit(100)
    )
    pages = result.scalars().all()
    return [
        {
            "id": p.id,
            "session_id": p.session_id,
            "url": p.url,
            "title": p.title,
            "status_code": p.status_code,
            "load_time_ms": p.load_time_ms,
            "memory_mb": p.memory_mb,
            "content_length": p.content_length,
            "elements_count": p.elements_count,
            "links_count": p.links_count,
            "error": p.error,
            "created_at": p.created_at.isoformat(),
        }
        for p in pages
    ]
