from fastapi import APIRouter
from app.api.v1.endpoints import dashboard, query

api_router = APIRouter()
api_router.include_router(dashboard.router)
api_router.include_router(query.router)
