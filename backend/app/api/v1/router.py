from fastapi import APIRouter
from app.api.v1.endpoints import dashboard, query, products, customers, orders

api_router = APIRouter()
api_router.include_router(dashboard.router)
api_router.include_router(query.router)
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(orders.router)
