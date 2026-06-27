# SalesVision

A full-stack sales analytics dashboard built with Next.js 14, FastAPI, PostgreSQL, and shadcn/ui. Features a responsive sidebar layout, interactive charts, full CRUD management for products, customers, and orders, and an optional natural-language query interface powered by GPT-4o-mini.

## Screenshots

> Run `npm run dev` + `uvicorn app.main:app --reload` and open [http://localhost:3000](http://localhost:3000)

## Features

### Analytics Dashboard
- KPI metrics — total revenue, orders, avg order value, active customers with period-over-period % change
- Revenue over time with daily / weekly / monthly granularity toggle (area chart)
- Sales breakdown by category (donut chart)
- Top products by revenue (horizontal bar chart)
- Recent orders table with customer search and pagination
- Date range filter (30d / 90d / 6mo / 1yr / 2yr) applied across all charts

### Products
- Paginated product catalog with category color badges
- Search by name, filter by category
- Create, edit, and delete products with SKU uniqueness validation

### Customers
- Paginated customer list with colored initials avatars
- Search by name or email
- Create, edit, and delete customers with email uniqueness validation

### Orders
- Paginated order list with status filter (completed / pending / cancelled)
- Search by customer name
- Order detail modal — full line-item breakdown with unit prices and subtotals
- Inline status changes from the detail view
- Delete orders (cascades to order items)

### Settings & Support
- Tabbed settings panel — General, Notifications, Database, Security, Appearance
- Support page with FAQ accordion and quick links to API docs and GitHub

### AI Query (optional)
- Natural-language → SQL via GPT-4o-mini (requires `OPENAI_API_KEY`)
- Returns the generated SQL alongside paginated results

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3, shadcn/ui, Recharts |
| State / Data | TanStack Query v5, Axios |
| Backend | FastAPI, async SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Database | PostgreSQL (asyncpg driver) |
| AI (optional) | OpenAI GPT-4o-mini |

## Project Structure

```
SalesVision/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   └── endpoints/
│   │   │       ├── dashboard.py    # Analytics queries
│   │   │       ├── products.py     # Products CRUD
│   │   │       ├── customers.py    # Customers CRUD
│   │   │       ├── orders.py       # Orders CRUD + detail
│   │   │       └── query.py        # NL query endpoint
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic v2 schemas
│   │   ├── services/               # Analytics + NL query logic
│   │   ├── db/                     # Async engine + session factory
│   │   └── core/                   # Settings (pydantic-settings)
│   ├── alembic/                    # DB migrations
│   └── scripts/seed.py             # Generates ~1,200 realistic orders
└── frontend/
    ├── app/
    │   ├── page.tsx                # Dashboard
    │   ├── products/page.tsx
    │   ├── customers/page.tsx
    │   ├── orders/page.tsx
    │   ├── settings/page.tsx
    │   └── support/page.tsx
    ├── components/
    │   ├── layout/                 # Sidebar, TopBar
    │   ├── dashboard/              # Chart + table components
    │   ├── query/                  # NL query bar
    │   └── ui/                     # shadcn/ui component library
    ├── hooks/useDashboard.ts       # TanStack Query hooks
    ├── lib/api.ts                  # Typed Axios API client
    └── types/index.ts              # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### 1. Database setup

```bash
# Create the database and user
sudo -u postgres psql -c "CREATE DATABASE salesvision;"
sudo -u postgres createuser --superuser $USER
psql -d postgres -c "ALTER USER $USER PASSWORD 'salesvision';"
```

### 2. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env          # edit DATABASE_URL if needed
# DATABASE_URL=postgresql+asyncpg://<user>:<password>@localhost:5432/salesvision

# Run migrations
alembic upgrade head

# Seed with demo data (~30 products, 200 customers, ~1,200 orders)
python -m scripts.seed

# Start the API server
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:3000
```

### 4. Optional — AI query

Add your OpenAI key to `backend/.env`:

```env
OPENAI_API_KEY=sk-...
```

The NL query bar on the dashboard will activate automatically.

## API Reference

All endpoints are prefixed with `/api/v1`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/dashboard/kpis` | KPI metrics with period-over-period change |
| `GET` | `/dashboard/revenue-over-time` | Revenue time series (daily/weekly/monthly) |
| `GET` | `/dashboard/sales-by-category` | Revenue % breakdown by category |
| `GET` | `/dashboard/top-products` | Top N products by revenue |
| `GET` | `/dashboard/recent-orders` | Paginated recent orders |
| `POST` | `/query` | Natural-language → SQL query |
| `GET/POST` | `/products` | List (search, filter) / create |
| `GET/PUT/DELETE` | `/products/{id}` | Get / update / delete |
| `GET/POST` | `/customers` | List (search) / create |
| `GET/PUT/DELETE` | `/customers/{id}` | Get / update / delete |
| `GET/POST` | `/orders` | List (status filter, search) / create |
| `GET` | `/orders/{id}` | Order detail with line items |
| `PATCH` | `/orders/{id}/status` | Update order status |
| `DELETE` | `/orders/{id}` | Delete order (cascades to items) |

## Data Model

```
products        customers
    │               │
    └──► order_items ◄──── orders ◄──── customers
              (product_id, order_id, quantity, unit_price)
```

- **Products** — name, SKU (unique), category (enum), price
- **Customers** — name, email (unique), city, country
- **Orders** — customer FK, status enum (completed/pending/cancelled), timestamp
- **Order Items** — order FK, product FK, quantity, unit price (snapshot at order time)
