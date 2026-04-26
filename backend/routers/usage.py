from fastapi import APIRouter, Depends

from auth import get_current_user
from database import async_session
from models import User
from repositories.usage import summarize_usage

router = APIRouter()


@router.get("/ai-usage-summary")
async def get_ai_usage_summary(user: User = Depends(get_current_user)):
    async with async_session() as session:
        return await summarize_usage(session, user.id)
