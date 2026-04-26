from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_optional_current_user
from database import get_db
from models import User
from schemas import MoodInput
from services.recommendation_service import recommend

router = APIRouter()


@router.post("/recommend")
async def recommend_movies(
    data: MoodInput,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    try:
        recommendations = await recommend(db, data.mood, current_user)
        return {"recommendations": recommendations}
    except Exception as exc:
        print("[recommend top-level error]:", repr(exc))
        raise HTTPException(status_code=500, detail=str(exc))
