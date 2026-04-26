from fastapi import APIRouter, Depends, HTTPException

from auth import ensure_not_demo_user, get_current_user
from database import async_session
from models import User
from repositories.taste import delete_snapshot, list_snapshots_desc
from schemas import UpdateSummaryInput
from services.taste_service import add_correction, get_taste_summary_payload, regenerate_taste_summary

router = APIRouter()


@router.get("/taste-summary")
async def get_taste_summary(user: User = Depends(get_current_user)):
    async with async_session() as session:
        return await get_taste_summary_payload(session, user.id)


@router.get("/snapshot-history")
async def get_snapshot_history(user: User = Depends(get_current_user)):
    async with async_session() as session:
        snapshots = await list_snapshots_desc(session, user.id)
        return {
            "snapshots": [
                {
                    "id": snapshot.id,
                    "movie_id": snapshot.movie_id,
                    "timestamp": snapshot.timestamp.isoformat() if snapshot.timestamp else None,
                    "mood": snapshot.mood_tag,
                    "comment": snapshot.gpt_comment,
                    "movie_title": snapshot.movie_title,
                }
                for snapshot in snapshots
            ]
        }


@router.delete("/delete_snapshot/{snapshot_id}")
async def delete_snapshot_route(snapshot_id: int, user: User = Depends(get_current_user)):
    ensure_not_demo_user(user)
    async with async_session() as session:
        snapshot = await delete_snapshot(session, user.id, snapshot_id)
        if not snapshot:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        await regenerate_taste_summary(session, user.id)
        await session.commit()
    return {"message": "Snapshot deleted and summary updated"}


@router.post("/update_summary")
async def update_taste_summary_feedback(
    data: UpdateSummaryInput,
    user: User = Depends(get_current_user),
):
    ensure_not_demo_user(user)
    async with async_session() as session:
        try:
            profile = await add_correction(session, user.id, data.feedback)
            return {"summary": profile.get("summary", "Summary updated."), "profile": profile}
        except Exception as exc:
            print("Summary update failed:", exc)
            raise HTTPException(status_code=500, detail="Failed to update summary")
