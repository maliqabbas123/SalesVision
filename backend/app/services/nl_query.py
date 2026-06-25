from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.schemas.query import NLQueryRequest, NLQueryResponse

SCHEMA_CONTEXT = """
Tables:
- products(id, name, sku, category, price, created_at)
  category values: 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'
- customers(id, name, email, city, country, created_at)
- orders(id, customer_id, status, created_at, updated_at)
  status values: 'completed', 'pending', 'cancelled'
- order_items(id, order_id, product_id, quantity, unit_price)

Revenue = SUM(order_items.quantity * order_items.unit_price) for completed orders only.
"""


async def run_nl_query(request: NLQueryRequest, db: AsyncSession) -> NLQueryResponse:
    if not settings.OPENAI_API_KEY:
        return NLQueryResponse(
            question=request.question,
            error="NL query is not configured. Set OPENAI_API_KEY in backend/.env to enable this feature.",
            configured=False,
        )

    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    prompt = f"""You are a SQL expert. Generate a read-only PostgreSQL SELECT query to answer this question.

Schema:
{SCHEMA_CONTEXT}

Question: {request.question}

Rules:
- Return ONLY a valid SQL SELECT statement, no explanation or markdown
- Never use INSERT, UPDATE, DELETE, DROP, TRUNCATE, or any mutation
- Limit results to 50 rows max using LIMIT
- Use table aliases for readability
"""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    sql = response.choices[0].message.content.strip()
    if sql.startswith("```"):
        sql = "\n".join(sql.split("\n")[1:]).rsplit("```", 1)[0].strip()

    if not sql.upper().lstrip().startswith("SELECT"):
        return NLQueryResponse(
            question=request.question,
            sql=sql,
            error="Generated query is not a SELECT statement.",
            configured=True,
        )

    try:
        result = await db.execute(text(sql))
        rows = result.mappings().all()
        return NLQueryResponse(
            question=request.question,
            sql=sql,
            results=[dict(r) for r in rows],
            configured=True,
        )
    except Exception as e:
        return NLQueryResponse(
            question=request.question,
            sql=sql,
            error=str(e),
            configured=True,
        )
