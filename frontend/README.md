# SalesVision — Frontend

Next.js 14 App Router frontend for the SalesVision analytics dashboard.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:8000/api/v1`) |
