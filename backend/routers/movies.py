from fastapi import APIRouter, Depends, HTTPException

from auth import ensure_not_demo_user, get_current_user
from database import async_session
from models import User
from repositories.movies import (
    add_waiting_movie,
    add_watched_movie,
    delete_waiting_movie,
    delete_watched_movie,
    find_watched_movie,
    list_waiting_movies,
    list_watched_movies,
    move_waiting_to_watched,
    normalize_moods,
    parse_optional_date,
)
from schemas import AddMovieInput, ReviewInput
from services.taste_service import process_taste_modeling, regenerate_taste_summary

router = APIRouter()


@router.get("/watched-list")
async def get_watched(user: User = Depends(get_current_user)):
    return {"movies": await list_watched_movies(user.id)}


@router.get("/waiting-list")
async def get_waiting(user: User = Depends(get_current_user)):
    return {"movies": await list_waiting_movies(user.id)}


@router.post("/watched")
async def add_watched(movie: AddMovieInput, user: User = Depends(get_current_user)):
    ensure_not_demo_user(user)
    async with async_session() as session:
        await add_watched_movie(session, user.id, movie.model_dump())
        await session.commit()
    return {"message": "Added to watched."}


@router.post("/waiting")
async def add_waiting(movie: AddMovieInput, user: User = Depends(get_current_user)):
    ensure_not_demo_user(user)
    async with async_session() as session:
        await add_waiting_movie(session, user.id, movie.model_dump())
        await session.commit()
    return {"message": "Added to waiting."}


@router.delete("/watched/{movie_id}")
async def delete_watched(movie_id: int, user: User = Depends(get_current_user)):
    ensure_not_demo_user(user)
    async with async_session() as session:
        movie = await delete_watched_movie(session, user.id, movie_id)
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        await regenerate_taste_summary(session, user.id)
        await session.commit()
    return {"message": "Deleted and summary updated"}


@router.delete("/waiting/{movie_id}")
async def delete_waiting(movie_id: int, user: User = Depends(get_current_user)):
    ensure_not_demo_user(user)
    async with async_session() as session:
        movie = await delete_waiting_movie(session, user.id, movie_id)
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        await session.commit()
    return {"message": "Deleted from waiting list"}


@router.post("/review")
async def review_movie(payload: ReviewInput, user: User = Depends(get_current_user)):
    ensure_not_demo_user(user)
    data = payload.model_dump()
    from_waiting = data.pop("fromWaiting", False)

    async with async_session() as session:
        if from_waiting:
            movie = await move_waiting_to_watched(session, user.id, data)
            if not movie and data.get("tmdb_id"):
                movie = await find_watched_movie(session, user.id, {"tmdb_id": data.get("tmdb_id")})
            if not movie:
                raise HTTPException(status_code=500, detail="Movie moved but not found")
        else:
            movie = await find_watched_movie(session, user.id, data)
            if not movie:
                raise HTTPException(status_code=404, detail="Movie not found in watched list")
            movie.review = data.get("review", movie.review)
            movie.moods = normalize_moods(data.get("moods"))
            watch_date = parse_optional_date(data.get("watch_date"))
            if watch_date:
                movie.watch_date = watch_date
            movie.user_rating = data.get("user_rating", movie.user_rating)
            movie.liked = data.get("liked", movie.liked)
            movie.disliked = data.get("disliked", movie.disliked)
            await session.flush()

        await process_taste_modeling(session, user.id, movie)
        await session.commit()

    return {"message": "Review saved."}
