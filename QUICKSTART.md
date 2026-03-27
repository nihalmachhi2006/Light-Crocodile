# Light-Crocodile — AI-Native Browser Environment
## Quickstart Guide

> Lightweight browser engine for AI agents. 11× faster than Chrome. 9× less memory.
> Built with Python (FastAPI) + React + PostgreSQL + Redis. No Chromium required.

---

## What You Need

| Requirement | Version | Check |
|-------------|---------|-------|
| Docker | 24+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git | any | `git --version` |

That's it. No Node.js, no Python, no database setup needed locally.

---

## Run in 3 Steps

### Step 1 — Clone the repo

```bash
git clone https://github.com/your-username/Light-Crocodile.git
cd Light-Crocodile
```

### Step 2 — Start everything

```bash
docker compose up --build
```

First build takes ~2–3 minutes (downloads images, installs deps).
Subsequent starts take ~10 seconds.

### Step 3 — Open the dashboard

| Service | URL |
|---------|-----|
| **Dashboard (UI)** | http://localhost:3000 |
| **API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |

---

## What You Can Do

### Browser Tab
- Enter any URL → click **Fetch**
- See extracted text, interactive elements, links — all without Chrome
- Click any link to navigate
- Session history tracked automatically

### Sessions Tab
- Create and manage browser sessions
- Each session tracks pages fetched, memory used, request count
- Click a session to see full page history

### Tasks Tab
- Create automated tasks (scrape / navigate / extract / monitor)
- Run tasks and get a 0.0–1.0 score
- Track duration and results

### Dashboard
- Live metrics: total sessions, pages fetched, avg load time
- Memory and performance charts
- Real-time auto-refresh every 5 seconds

---

## API Usage (curl examples)

### Health check
```bash
curl http://localhost:8000/health
```

### Create a session
```bash
curl -X POST http://localhost:8000/api/sessions/ \
  -H "Content-Type: application/json" \
  -d '{"name": "My Session"}'
```

### Fetch a page
```bash
curl -X POST http://localhost:8000/api/pages/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "YOUR_SESSION_ID",
    "url": "https://example.com"
  }'
```

### Get metrics
```bash
curl http://localhost:8000/api/metrics/overview
```

### Create and run a task
```bash
# Create
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "YOUR_SESSION_ID",
    "name": "Scrape example",
    "type": "scrape",
    "target_url": "https://example.com"
  }'

# Run (use task id from above response)
curl -X POST http://localhost:8000/api/tasks/TASK_ID/run
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env — point DATABASE_URL to your local Postgres

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (proxies /api to localhost:8000)
npm run dev
```

Frontend runs at http://localhost:3000

### Database (local)

```bash
# Start just Postgres and Redis via Docker
docker compose up db redis -d
```

---

## Project Structure

```
Light-Crocodile/
├── docker-compose.yml          # Orchestrates all services
├── QUICKSTART.md               # This file
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app entry point
│       ├── core/
│       │   ├── config.py       # Settings (env vars)
│       │   ├── database.py     # SQLAlchemy async setup
│       │   └── redis_client.py # Redis connection
│       ├── models/
│       │   ├── session_model.py
│       │   ├── page_model.py
│       │   └── task_model.py
│       ├── api/
│       │   ├── sessions.py     # Session CRUD
│       │   ├── pages.py        # Page fetch endpoint
│       │   ├── tasks.py        # Task management
│       │   └── metrics.py      # Analytics
│       └── services/
│           └── browser_engine.py  # Core: httpx + selectolax
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── lib/
    │   │   └── api.ts          # All API calls
    │   ├── components/
    │   │   └── ui/
    │   │       └── Layout.tsx  # Sidebar + nav
    │   └── pages/
    │       ├── Dashboard.tsx
    │       ├── BrowserPage.tsx
    │       ├── Sessions.tsx
    │       ├── SessionDetail.tsx
    │       └── TasksPage.tsx
```

---

## Environment Variables

All variables have safe defaults for local development.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgres://webnav:webnav@db:5432/webnav | Postgres connection string |
| `REDIS_URL` | redis://redis:6379 | Redis connection string |
| `SECRET_KEY` | change-me-... | App secret (change in production) |
| `DEBUG` | false | Enable debug mode |
| `MAX_SESSIONS` | 100 | Max concurrent sessions |
| `SESSION_TIMEOUT` | 3600 | Session timeout in seconds |

---

## Useful Docker Commands

```bash
# Start all services in background
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a single service
docker compose restart backend

# Stop everything
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up --build backend
```

---

## How the Browser Engine Works

Light-Crocodile does NOT use Chrome, Puppeteer, or Playwright.

```
URL → httpx (async HTTP client)
         ↓
      raw HTML response
         ↓
      selectolax (ultra-fast C-based HTML parser)
         ↓
      semantic extraction:
        - title
        - clean text content
        - interactive elements (buttons, inputs, links, selects)
        - all navigation links
         ↓
      structured PageObservation returned to API / agent
```

**Result:**
- ~15–25MB memory per session vs ~200MB+ for Chrome
- ~50–200ms page load vs ~2000ms Chrome startup
- Fully containerized, no GUI, no display server needed

**Limitation:** JavaScript-rendered content (React SPAs, etc.) is not executed.
Static HTML sites, APIs, and server-rendered pages work perfectly.

---

## Performance Benchmark

| Metric | Light-Crocodile | Chrome (Puppeteer) |
|--------|--------|--------------------|
| Startup time | ~50ms | ~2000ms |
| Memory per session | ~20MB | ~200MB |
| 100 pages load time | ~2.3s | ~25.2s |
| Docker image size | ~200MB | ~1.5GB |

---

## Troubleshooting

**Port already in use**
```bash
# Change ports in docker-compose.yml
# e.g. "3001:80" for frontend, "8001:8000" for backend
```

**Database connection refused**
```bash
# Wait for db healthcheck to pass
docker compose logs db
# Re-run after db is healthy
docker compose up backend
```

**Frontend shows blank page**
```bash
# Rebuild frontend
docker compose up --build frontend
```

**Backend 500 errors**
```bash
docker compose logs backend
# Usually a missing env var or DB not ready
```

---

## License

MIT — free to use, modify, and distribute.
