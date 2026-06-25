# SalesVision

Full-stack sales analytics dashboard built with Next.js 14, FastAPI, PostgreSQL, and shadcn/ui.

## Features

- KPI cards — total revenue, orders, avg order value, active customers (with period-over-period change)
- Revenue over time with daily / weekly / monthly granularity toggle
- Sales breakdown by category (donut chart)
- Top 10 products by revenue (horizontal bar chart)
- Recent orders table with pagination
- Date range and category filters applied across all charts
- Optional natural-language query bar (requires `OPENAI_API_KEY`)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Data Fetching | TanStack Query v5 |
| Backend | FastAPI, async SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL |
| AI (optional) | OpenAI GPT-4o-mini |

## Project Structure

```
SalesVision/
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic & analytics queries
│   │   ├── db/        # Async engine + session
│   │   └── core/      # Settings / config
│   ├── alembic/       # DB migrations
│   └── scripts/       # Seed data
└── frontend/          # Next.js 14 App Router
    ├── app/           # Pages
    ├── components/    # UI components
    ├── hooks/         # TanStack Query hooks
    └── lib/           # API client + utilities
```

## Getting Started

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for setup instructions.
