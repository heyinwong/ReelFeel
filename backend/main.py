from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json, os, httpx, asyncio
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from database import (
    init_db, AsyncSessionLocal, get_watched_movies, get_waiting_movies,
    add_to_watched, add_to_waiting, move_to_watched
)
from models import WatchedMovie, WaitingMovie

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if not TMDB_API_KEY:
    raise RuntimeError("TMDB_API_KEY is not set")

client = OpenAI()
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
TMDB_POSTER_PREFIX = "https://image.tmdb.org/t/p/w342"
TMDB_BACKDROP_PREFIX = "https://image.tmdb.org/t/p/w780"

class MovieInput(BaseModel):
    username: str
    title: str
    poster: str | None = None
    backdrop: str | None = None
    tmdb_rating: float | None = None
    user_rating: float | None = None
    description: str | None = None
    liked: bool | None = False

class MoodInput(BaseModel):
    mood: str

class RatingInput(BaseModel):
    username: str
    title: str
    user_rating: float

class LikeInput(BaseModel):
    username: str
    title: str
    liked: bool

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan, debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def fetch_movie_info(title: str):
    params = {
        "query": title,
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "include_adult": False,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(TMDB_SEARCH_URL, params=params)
        data = response.json()
        if data.get("results"):
            movie = data["results"][0]
            return {
                "title": movie.get("title"),
                "poster": TMDB_POSTER_PREFIX + movie["poster_path"] if movie.get("poster_path") else None,
                "backdrop": TMDB_BACKDROP_PREFIX + movie["backdrop_path"] if movie.get("backdrop_path") else None,
                "tmdb_rating": movie.get("vote_average"),
                "description": movie.get("overview")
            }
        return {
            "title": title,
            "poster": None,
            "backdrop": None,
            "tmdb_rating": None,
            "description": "No description found."
        }

@app.post("/recommend")
async def recommend_movies(data: MoodInput):
    prompt = f"Return ONLY a JSON array of 3 movie titles that match this mood: '{data.mood}'."
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        titles = json.loads(response.choices[0].message.content.strip())
        movie_details = await asyncio.gather(*(fetch_movie_info(t) for t in titles))
        return {"recommendations": movie_details}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/watched")
async def add_watched(movie: MovieInput):
    async with AsyncSessionLocal() as session:
        try:
            await add_to_watched(session, movie.dict())
            await session.commit()
            return {"message": "Added to watched list"}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/waiting")
async def add_waiting(movie: MovieInput):
    async with AsyncSessionLocal() as session:
        try:
            await add_to_waiting(session, movie.dict())
            await session.commit()
            return {"message": "Added to watchlist"}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/watched-list")
async def get_watched(username: str = Query(...)):
    try:
        return {"movies": await get_watched_movies(username)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/waiting-list")
async def get_waiting(username: str = Query(...)):
    try:
        return {"movies": await get_waiting_movies(username)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/watched/{title}")
async def delete_watched(title: str, username: str = Query(...)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(WatchedMovie).where(
                WatchedMovie.username == username,
                WatchedMovie.title == title
            )
        )
        movie = result.scalar_one_or_none()
        if movie:
            await session.delete(movie)
            await session.commit()
            return {"message": "Deleted"}
        raise HTTPException(status_code=404, detail="Not found")

@app.delete("/waiting/{title}")
async def delete_waiting(title: str, username: str = Query(...)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(WaitingMovie).where(
                WaitingMovie.username == username,
                WaitingMovie.title == title
            )
        )
        movie = result.scalar_one_or_none()
        if movie:
            await session.delete(movie)
            await session.commit()
            return {"message": "Deleted"}
        raise HTTPException(status_code=404, detail="Not found")

@app.post("/rate")
async def rate(data: RatingInput):
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                select(WatchedMovie).where(
                    WatchedMovie.username == data.username,
                    WatchedMovie.title == data.title
                )
            )
            movie = result.scalar_one_or_none()
            if movie:
                movie.user_rating = data.user_rating
            else:
                await add_to_watched(session, {
                    "username": data.username,
                    "title": data.title,
                    "user_rating": data.user_rating
                })
            await session.commit()
            return {"message": "Rating updated"}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/like")
async def like(data: LikeInput):
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                select(WatchedMovie).where(
                    WatchedMovie.username == data.username,
                    WatchedMovie.title == data.title
                )
            )
            movie = result.scalar_one_or_none()
            if movie:
                movie.liked = data.liked
            else:
                await add_to_watched(session, {
                    "username": data.username,
                    "title": data.title,
                    "liked": data.liked
                })
            await session.commit()
            return {"message": "Like updated"}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/rate-waiting")
async def rate_waiting_movie(data: RatingInput):
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                select(WaitingMovie).where(
                    WaitingMovie.username == data.username,
                    WaitingMovie.title == data.title
                )
            )
            movie = result.scalar_one_or_none()
            if movie:
                movie_data = {
                    "username": movie.username,
                    "title": movie.title,
                    "poster": movie.poster,
                    "backdrop": movie.backdrop,
                    "tmdb_rating": movie.tmdb_rating,
                    "description": movie.description,
                    "user_rating": data.user_rating,
                    "liked": movie.liked,
                }
                await move_to_watched(session, movie_data)
                await session.commit()
                return {"message": f"Rated '{data.title}' and moved to watched list"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found in waiting list")
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/like-waiting")
async def like_waiting_movie(data: LikeInput):
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                select(WaitingMovie).where(
                    WaitingMovie.username == data.username,
                    WaitingMovie.title == data.title
                )
            )
            movie = result.scalar_one_or_none()
            if movie:
                movie_data = {
                    "username": movie.username,
                    "title": movie.title,
                    "poster": movie.poster,
                    "backdrop": movie.backdrop,
                    "tmdb_rating": movie.tmdb_rating,
                    "description": movie.description,
                    "user_rating": movie.user_rating,
                    "liked": data.liked,
                }
                await move_to_watched(session, movie_data)
                await session.commit()
                return {"message": f"Liked '{data.title}' and moved to watched list"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found in waiting list")
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))