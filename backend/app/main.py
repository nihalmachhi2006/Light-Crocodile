import asyncio
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

import redis.asyncio as aioredis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import sessions, pages, tasks, metrics
from app.core.config import settings
from app.core.database import init_db
from app.core.redis_client import get_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Light-Crocodile Browser API",
    description="Lightweight AI-native browser environment",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(pages.router, prefix="/api/pages", tags=["pages"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "name": "Light-Crocodile Browser API",
        "version": "1.0.0",
        "description": "Lightweight AI-native browser — 10x faster, 10x less memory",
        "docs": "/docs",
    }


# WebSocket for real-time browser events
connected_clients: dict[str, WebSocket] = {}


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    connected_clients[session_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            await websocket.send_json({"type": "ack", "session_id": session_id, "data": data})
    except WebSocketDisconnect:
        connected_clients.pop(session_id, None)
