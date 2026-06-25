import enum
from datetime import datetime
from sqlalchemy import ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class OrderStatus(str, enum.Enum):
    completed = "completed"
    pending = "pending"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, name="orderstatus"), nullable=False, default=OrderStatus.completed)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    customer: Mapped["Customer"] = relationship("Customer")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order")
