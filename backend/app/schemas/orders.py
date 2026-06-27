from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Optional


STATUSES = ["completed", "pending", "cancelled"]


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def validate_qty(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be >= 1")
        return v


class OrderCreate(BaseModel):
    customer_id: int
    status: str = "pending"
    items: list[OrderItemCreate]

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in STATUSES:
            raise ValueError(f"status must be one of {STATUSES}")
        return v

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list) -> list:
        if not v:
            raise ValueError("order must have at least one item")
        return v


class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in STATUSES:
            raise ValueError(f"status must be one of {STATUSES}")
        return v


class OrderItemOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    customer_id: int
    customer_name: str
    status: str
    total_amount: Decimal
    items_count: int
    created_at: datetime
    updated_at: datetime


class OrderDetailOut(OrderOut):
    items: list[OrderItemOut]


class OrderListResponse(BaseModel):
    data: list[OrderOut]
    total: int
    page: int
    page_size: int
