from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.dashboard import (
    KPIResponse,
    RevenueOverTimeResponse,
    RevenueDataPoint,
    CategoryBreakdownResponse,
    CategoryBreakdown,
    TopProductsResponse,
    TopProduct,
    RecentOrdersResponse,
    RecentOrder,
)


def _default_dates() -> tuple[datetime, datetime]:
    end = datetime.utcnow()
    start = end - timedelta(days=365)
    return start, end


def _pct_change(current: Decimal, previous: Decimal) -> Optional[float]:
    if previous == 0:
        return None
    return round(float((current - previous) / previous * 100), 1)


async def get_kpis(
    db: AsyncSession,
    date_from: Optional[datetime],
    date_to: Optional[datetime],
    category: Optional[str],
) -> KPIResponse:
    start, end = date_from or _default_dates()[0], date_to or _default_dates()[1]
    period_len = (end - start).total_seconds()
    prev_start = start - timedelta(seconds=period_len)
    prev_end = start

    cat_join = "JOIN products p ON oi.product_id = p.id" if category else ""
    cat_filter = "AND p.category = :category" if category else ""

    params: dict = {"start": start, "end": end, "prev_start": prev_start, "prev_end": prev_end}
    if category:
        params["category"] = category

    sql = f"""
        WITH current AS (
            SELECT
                COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric AS revenue,
                COUNT(DISTINCT o.id) AS orders,
                COUNT(DISTINCT o.customer_id) AS customers
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            {cat_join}
            WHERE o.status = 'completed'
              AND o.created_at >= :start AND o.created_at < :end
              {cat_filter}
        ),
        previous AS (
            SELECT
                COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric AS revenue,
                COUNT(DISTINCT o.id) AS orders
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            {cat_join}
            WHERE o.status = 'completed'
              AND o.created_at >= :prev_start AND o.created_at < :prev_end
              {cat_filter}
        )
        SELECT
            c.revenue, c.orders, c.customers,
            p.revenue AS prev_revenue, p.orders AS prev_orders
        FROM current c, previous p
    """

    row = (await db.execute(text(sql), params)).mappings().one()
    revenue = Decimal(str(row["revenue"]))
    orders = int(row["orders"])
    avg = revenue / orders if orders > 0 else Decimal("0")
    prev_rev = Decimal(str(row["prev_revenue"]))
    prev_orders = int(row["prev_orders"])

    return KPIResponse(
        total_revenue=revenue,
        total_orders=orders,
        avg_order_value=avg.quantize(Decimal("0.01")),
        total_customers=int(row["customers"]),
        revenue_change_pct=_pct_change(revenue, prev_rev),
        orders_change_pct=_pct_change(Decimal(orders), Decimal(prev_orders)),
    )


async def get_revenue_over_time(
    db: AsyncSession,
    date_from: Optional[datetime],
    date_to: Optional[datetime],
    granularity: str,
    category: Optional[str],
) -> RevenueOverTimeResponse:
    start, end = date_from or _default_dates()[0], date_to or _default_dates()[1]
    trunc = {"daily": "day", "weekly": "week", "monthly": "month"}.get(granularity, "month")

    cat_join = "JOIN products p ON oi.product_id = p.id" if category else ""
    cat_filter = "AND p.category = :category" if category else ""
    params: dict = {"start": start, "end": end}
    if category:
        params["category"] = category

    sql = f"""
        SELECT
            DATE_TRUNC('{trunc}', o.created_at) AS period,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric AS revenue,
            COUNT(DISTINCT o.id) AS orders
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        {cat_join}
        WHERE o.status = 'completed'
          AND o.created_at >= :start AND o.created_at < :end
          {cat_filter}
        GROUP BY period
        ORDER BY period
    """

    rows = (await db.execute(text(sql), params)).mappings().all()
    fmt = {"daily": "%Y-%m-%d", "weekly": "%Y-%m-%d", "monthly": "%Y-%m"}.get(granularity, "%Y-%m")
    data = [
        RevenueDataPoint(
            date=row["period"].strftime(fmt),
            revenue=Decimal(str(row["revenue"])),
            orders=int(row["orders"]),
        )
        for row in rows
    ]
    return RevenueOverTimeResponse(data=data, granularity=granularity)


async def get_sales_by_category(
    db: AsyncSession,
    date_from: Optional[datetime],
    date_to: Optional[datetime],
) -> CategoryBreakdownResponse:
    start, end = date_from or _default_dates()[0], date_to or _default_dates()[1]

    sql = """
        SELECT
            p.category,
            SUM(oi.quantity * oi.unit_price)::numeric AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE o.status = 'completed'
          AND o.created_at >= :start AND o.created_at < :end
        GROUP BY p.category
        ORDER BY revenue DESC
    """
    rows = (await db.execute(text(sql), {"start": start, "end": end})).mappings().all()
    total = sum(Decimal(str(r["revenue"])) for r in rows) or Decimal("1")
    data = [
        CategoryBreakdown(
            category=row["category"],
            revenue=Decimal(str(row["revenue"])),
            percentage=round(float(Decimal(str(row["revenue"])) / total * 100), 1),
        )
        for row in rows
    ]
    return CategoryBreakdownResponse(data=data)


async def get_top_products(
    db: AsyncSession,
    date_from: Optional[datetime],
    date_to: Optional[datetime],
    category: Optional[str],
    limit: int = 10,
) -> TopProductsResponse:
    start, end = date_from or _default_dates()[0], date_to or _default_dates()[1]
    cat_filter = "AND p.category = :category" if category else ""
    params: dict = {"start": start, "end": end, "limit": limit}
    if category:
        params["category"] = category

    sql = f"""
        SELECT
            p.id AS product_id,
            p.name,
            p.category,
            SUM(oi.quantity * oi.unit_price)::numeric AS total_revenue,
            SUM(oi.quantity)::int AS units_sold
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE o.status = 'completed'
          AND o.created_at >= :start AND o.created_at < :end
          {cat_filter}
        GROUP BY p.id, p.name, p.category
        ORDER BY total_revenue DESC
        LIMIT :limit
    """
    rows = (await db.execute(text(sql), params)).mappings().all()
    data = [
        TopProduct(
            product_id=row["product_id"],
            name=row["name"],
            category=row["category"],
            total_revenue=Decimal(str(row["total_revenue"])),
            units_sold=row["units_sold"],
        )
        for row in rows
    ]
    return TopProductsResponse(data=data)


async def get_recent_orders(
    db: AsyncSession,
    date_from: Optional[datetime],
    date_to: Optional[datetime],
    category: Optional[str],
    page: int = 1,
    page_size: int = 10,
) -> RecentOrdersResponse:
    start, end = date_from or _default_dates()[0], date_to or _default_dates()[1]
    offset = (page - 1) * page_size

    cat_join = "JOIN order_items oi2 ON oi2.order_id = o.id JOIN products p2 ON p2.id = oi2.product_id" if category else ""
    cat_filter = "AND p2.category = :category" if category else ""
    params: dict = {"start": start, "end": end, "limit": page_size, "offset": offset}
    if category:
        params["category"] = category

    count_sql = f"""
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        {cat_join}
        WHERE o.created_at >= :start AND o.created_at < :end
        {cat_filter}
    """
    total = (await db.execute(text(count_sql), params)).scalar() or 0

    sql = f"""
        SELECT
            o.id,
            c.name AS customer_name,
            o.status,
            o.created_at,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric AS total_amount,
            COUNT(oi.id)::int AS items_count
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        JOIN order_items oi ON oi.order_id = o.id
        {cat_join.replace("oi2", "oi_filter").replace("p2", "p_filter") if category else ""}
        WHERE o.created_at >= :start AND o.created_at < :end
        {cat_filter.replace("p2", "p_filter") if category else ""}
        GROUP BY o.id, c.name, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT :limit OFFSET :offset
    """

    # Simpler query without category filter duplication
    simple_sql = f"""
        SELECT
            o.id,
            c.name AS customer_name,
            o.status,
            o.created_at,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric AS total_amount,
            COUNT(oi.id)::int AS items_count
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.created_at >= :start AND o.created_at < :end
        GROUP BY o.id, c.name, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT :limit OFFSET :offset
    """

    rows = (await db.execute(text(simple_sql), params)).mappings().all()
    data = [
        RecentOrder(
            id=row["id"],
            customer_name=row["customer_name"],
            status=row["status"],
            total_amount=Decimal(str(row["total_amount"])),
            items_count=row["items_count"],
            created_at=row["created_at"],
        )
        for row in rows
    ]
    return RecentOrdersResponse(data=data, total=total, page=page, page_size=page_size)
