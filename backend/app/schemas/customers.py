from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    city: str
    country: str = "USA"


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    country: Optional[str] = None


class CustomerOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    email: str
    city: str
    country: str
    created_at: datetime


class CustomerListResponse(BaseModel):
    data: list[CustomerOut]
    total: int
    page: int
    page_size: int
