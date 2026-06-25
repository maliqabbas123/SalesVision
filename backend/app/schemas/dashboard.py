from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class KPIResponse(BaseModel):
    total_revenue: Decimal
    total_orders: int
    avg_order_value: Decimal
    total_customers: int
    revenue_change_pct: Optional[float] = None
    orders_change_pct: Optional[float] = None


class RevenueDataPoint(BaseModel):
    date: str
    revenue: Decimal
    orders: int


class RevenueOverTimeResponse(BaseModel):
    data: list[RevenueDataPoint]
    granularity: str


class CategoryBreakdown(BaseModel):
    category: str
    revenue: Decimal
    percentage: float


class CategoryBreakdownResponse(BaseModel):
    data: list[CategoryBreakdown]


class TopProduct(BaseModel):
    product_id: int
    name: str
    category: str
    total_revenue: Decimal
    units_sold: int


class TopProductsResponse(BaseModel):
    data: list[TopProduct]


class RecentOrder(BaseModel):
    id: int
    customer_name: str
    status: str
    total_amount: Decimal
    items_count: int
    created_at: datetime


class RecentOrdersResponse(BaseModel):
    data: list[RecentOrder]
    total: int
    page: int
    page_size: int
