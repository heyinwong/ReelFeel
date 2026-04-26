import json

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from models import TasteSnapshot, TasteSummary


async def list_snapshots(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(TasteSnapshot)
        .where(TasteSnapshot.user_id == user_id)
        .order_by(TasteSnapshot.timestamp.asc())
    )
    return result.scalars().all()


async def list_snapshots_desc(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(TasteSnapshot)
        .where(TasteSnapshot.user_id == user_id)
        .order_by(TasteSnapshot.timestamp.desc())
    )
    return result.scalars().all()


async def get_summary(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(TasteSummary).where(TasteSummary.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def upsert_summary(
    session: AsyncSession,
    user_id: int,
    summary_text: str,
    profile: dict,
    highlight_titles: list[str],
):
    record = await get_summary(session, user_id)
    metadata = {
        "highlight_titles": highlight_titles,
        "profile": profile,
    }
    if record:
        record.summary = summary_text
        record.highlight_titles = json.dumps(metadata)
    else:
        session.add(
            TasteSummary(
                user_id=user_id,
                summary=summary_text,
                highlight_titles=json.dumps(metadata),
            )
        )
    await session.flush()


async def add_snapshot(
    session: AsyncSession,
    user_id: int,
    movie_id: int | None,
    movie_title: str | None,
    action_type: str,
    gpt_comment: str,
    mood_tag: str | None = None,
):
    snapshot = TasteSnapshot(
        user_id=user_id,
        movie_id=movie_id,
        movie_title=movie_title,
        action_type=action_type,
        mood_tag=mood_tag,
        gpt_comment=gpt_comment,
    )
    session.add(snapshot)
    await session.flush()
    return snapshot


async def delete_snapshot(session: AsyncSession, user_id: int, snapshot_id: int):
    result = await session.execute(
        select(TasteSnapshot).where(
            TasteSnapshot.id == snapshot_id,
            TasteSnapshot.user_id == user_id,
        )
    )
    snapshot = result.scalar_one_or_none()
    if not snapshot:
        return None

    await session.execute(delete(TasteSnapshot).where(TasteSnapshot.id == snapshot_id))
    await session.flush()
    return snapshot
