# SalesVision — Backend

FastAPI backend for the SalesVision analytics dashboard.

## Requirements

- Python 3.12+
- PostgreSQL 14+

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env if your DB credentials differ
```

Create the database:

```bash
createdb salesvision
```

Run migrations:

```bash
alembic upgrade head
```

Seed sample data (~1500 orders across 2 years):

```bash
python -m scripts.seed
```

Start the API:

```bash
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Async PostgreSQL connection string |
| `OPENAI_API_KEY` | No | Enables the `/api/v1/query` NL query endpoint |
| `LOG_LEVEL` | No | Python logging level (default: INFO) |
