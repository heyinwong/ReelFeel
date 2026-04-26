from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from schemas import MoodInput
from services.tmdb_service import fetch_movie_info, get_movie_detail_by_id, search_full_movies, search_suggestions

router = APIRouter()


@router.get("/search_suggestions")
async def search_suggestion_route(query: str = Query(..., min_length=1)):
    try:
        return {"suggestions": await search_suggestions(query)}
    except Exception as exc:
        return JSONResponse(content={"error": str(exc)}, status_code=500)


@router.post("/search")
async def search_movies(data: MoodInput):
    try:
        return {"recommendations": await search_full_movies(data.mood, limit=3)}
    except Exception as exc:
        print(f"[search top-level error]: {exc}")
        return JSONResponse(content={"error": str(exc)}, status_code=500)


@router.get("/movie_by_title")
async def movie_by_title(title: str):
    try:
        return {"recommendations": [await fetch_movie_info(title)]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/movie_detail/{tmdb_id}")
async def movie_detail(tmdb_id: int):
    try:
        return await get_movie_detail_by_id(tmdb_id)
    except Exception as exc:
        print(f"[movie_detail] Failed to fetch: {exc}")
        return JSONResponse(content={"error": str(exc)}, status_code=500)
