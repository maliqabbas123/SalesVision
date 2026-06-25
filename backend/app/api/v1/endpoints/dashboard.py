from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.dashboard import (
    KPIResponse,
    RevenueOverTimeResponse,
    CategoryBreakdownResponse,
    TopProductsResponse,
    RecentOrdersResponse,
)
from app.services import analytics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await analytics.get_kpis(db, date_from, date_to, category)


@router.get("/revenue-over-time", response_model=RevenueOverTimeResponse)
async def get_revenue_over_time(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    granularity: str = Query("monthly", pattern="^(daily|weekly|monthly)$"),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await analytics.get_revenue_over_time(db, date_from, date_to, granularity, category)


@router.get("/sales-by-category", response_model=CategoryBreakdownResponse)
async def get_sales_by_category(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await analytics.get_sales_by_category(db, date_from, date_to)


@router.get("/top-products", response_model=TopProductsResponse)
async def get_top_products(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await analytics.get_top_products(db, date_from, date_to, category, limit)


@router.get("/recent-orders", response_model=RecentOrdersResponse)
async def get_recent_orders(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await analytics.get_recent_orders(db, date_from, date_to, category, page, page_size)
