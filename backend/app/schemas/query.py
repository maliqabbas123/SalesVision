from typing import Any, Optional
from pydantic import BaseModel


class NLQueryRequest(BaseModel):
    question: str


class NLQueryResponse(BaseModel):
    question: str
    sql: Optional[str] = None
    results: Optional[list[dict[str, Any]]] = None
    error: Optional[str] = None
    configured: bool = True
