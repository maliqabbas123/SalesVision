import enum
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Numeric, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class ProductCategory(str, enum.Enum):
    electronics = "Electronics"
    clothing = "Clothing"
    books = "Books"
    home_garden = "Home & Garden"
    sports = "Sports"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    category: Mapped[ProductCategory] = mapped_column(Enum(ProductCategory, name="productcategory"), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
