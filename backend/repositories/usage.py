from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models import LlmUsage


async def summarize_usage(session: AsyncSession, user_id: int):
    totals = await session.execute(
        select(
            func.count(LlmUsage.id),
            func.coalesce(func.sum(LlmUsage.prompt_tokens), 0),
            func.coalesce(func.sum(LlmUsage.completion_tokens), 0),
            func.coalesce(func.sum(LlmUsage.total_tokens), 0),
            func.coalesce(func.sum(LlmUsage.estimated_cost_usd), 0),
        ).where(LlmUsage.user_id == user_id)
    )
    count, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd = totals.one()

    by_task_rows = await session.execute(
        select(
            LlmUsage.task,
            func.count(LlmUsage.id),
            func.coalesce(func.sum(LlmUsage.total_tokens), 0),
            func.coalesce(func.sum(LlmUsage.estimated_cost_usd), 0),
        )
        .where(LlmUsage.user_id == user_id)
        .group_by(LlmUsage.task)
        .order_by(func.coalesce(func.sum(LlmUsage.estimated_cost_usd), 0).desc())
    )

    recent_rows = await session.execute(
        select(LlmUsage)
        .where(LlmUsage.user_id == user_id)
        .order_by(LlmUsage.created_at.desc(), LlmUsage.id.desc())
        .limit(20)
    )

    return {
        "total_calls": count,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
        "estimated_cost_usd": round(float(estimated_cost_usd or 0), 6),
        "by_task": [
            {
                "task": task,
                "calls": calls,
                "total_tokens": tokens,
                "estimated_cost_usd": round(float(cost or 0), 6),
            }
            for task, calls, tokens, cost in by_task_rows.all()
        ],
        "recent": [
            {
                "id": row.id,
                "task": row.task,
                "tier": row.tier,
                "model": row.model,
                "prompt_tokens": row.prompt_tokens,
                "completion_tokens": row.completion_tokens,
                "total_tokens": row.total_tokens,
                "estimated_cost_usd": round(float(row.estimated_cost_usd or 0), 6),
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in recent_rows.scalars().all()
        ],
    }
