from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Optional


CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports"]


class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: Decimal

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in CATEGORIES:
            raise ValueError(f"category must be one of {CATEGORIES}")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("price must be positive")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in CATEGORIES:
            raise ValueError(f"category must be one of {CATEGORIES}")
        return v


class ProductOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    sku: str
    category: str
    price: Decimal
    created_at: datetime


class ProductListResponse(BaseModel):
    data: list[ProductOut]
    total: int
    page: int
    page_size: int
