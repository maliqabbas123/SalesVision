from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.query import NLQueryRequest, NLQueryResponse
from app.services.nl_query import run_nl_query

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=NLQueryResponse)
async def nl_query(request: NLQueryRequest, db: AsyncSession = Depends(get_db)):
    return await run_nl_query(request, db)
