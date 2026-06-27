from decimal import Decimal
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.customer import Customer
from app.models.product import Product
from app.schemas.orders import (
    OrderCreate,
    OrderStatusUpdate,
    OrderOut,
    OrderDetailOut,
    OrderItemOut,
    OrderListResponse,
)

router = APIRouter(prefix="/orders", tags=["orders"])


def _order_to_out(order: Order) -> OrderOut:
    total = sum(item.unit_price * item.quantity for item in order.items)
    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.name,
        status=order.status.value,
        total_amount=total,
        items_count=len(order.items),
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


def _order_to_detail(order: Order) -> OrderDetailOut:
    items_out = [
        OrderItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name,
            product_sku=item.product.sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.unit_price * item.quantity,
        )
        for item in order.items
    ]
    total = sum(i.subtotal for i in items_out)
    return OrderDetailOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.name,
        status=order.status.value,
        total_amount=total,
        items_count=len(order.items),
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items_out,
    )


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Order)
        .join(Order.customer)
        .options(selectinload(Order.customer), selectinload(Order.items))
    )
    if status:
        q = q.where(Order.status == status)
    if customer_id:
        q = q.where(Order.customer_id == customer_id)
    if search:
        q = q.where(Customer.name.ilike(f"%{search}%"))

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(q)).scalars().all()

    return OrderListResponse(
        data=[_order_to_out(o) for o in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderDetailOut)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")
    return _order_to_detail(order)


@router.post("", response_model=OrderDetailOut, status_code=201)
async def create_order(body: OrderCreate, db: AsyncSession = Depends(get_db)):
    customer = await db.get(Customer, body.customer_id)
    if not customer:
        raise HTTPException(404, f"Customer {body.customer_id} not found")

    product_ids = [item.product_id for item in body.items]
    products_result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in products_result.scalars().all()}

    missing = set(product_ids) - set(products.keys())
    if missing:
        raise HTTPException(404, f"Products not found: {sorted(missing)}")

    order = Order(
        customer_id=body.customer_id,
        status=OrderStatus(body.status),
        created_at=datetime.utcnow(),
    )
    db.add(order)
    await db.flush()

    for item in body.items:
        product = products[item.product_id]
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price,
        ))

    await db.commit()

    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
    )
    return _order_to_detail(result.scalar_one())


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int, body: OrderStatusUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.customer), selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")

    order.status = OrderStatus(body.status)
    await db.commit()
    await db.refresh(order)
    return _order_to_out(order)


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, "Order not found")
    await db.delete(order)
    await db.commit()
