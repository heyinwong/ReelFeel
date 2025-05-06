from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json
import os
import httpx
import asyncio
from contextlib import asynccontextmanager
from database import init_db
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from database import AsyncSessionLocal
from models import WatchedMovie, WaitingMovie
from fastapi import Query
from database import get_watched_movies, get_waiting_movies
from fastapi import Path

# --- API Keys ---
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if not TMDB_API_KEY:
    raise RuntimeError("TMDB_API_KEY is not set. Please check your environment variables.")

client = OpenAI()

# --- TMDB Constants ---
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
TMDB_IMAGE_PREFIX = "https://image.tmdb.org/t/p/w500"

class MovieInput(BaseModel):
    username: str
    title: str
    poster: str | None = None
    rating: float | None = None
    description: str | None = None

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
# --- FastAPI App with Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  # Database initialization
    yield  # continue serving requests

app = FastAPI(lifespan=lifespan, debug=True)

# --- CORS Support ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Input Model ---
class MoodInput(BaseModel):
    mood: str

# --- TMDB API 查询逻辑 ---
async def fetch_movie_info(title: str):
    params = {
        "query": title,
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "include_adult": False
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(TMDB_SEARCH_URL, params=params)
        data = response.json()
        if data.get("results"):
            movie = data["results"][0]
            return {
                "title": movie.get("title"),
                "poster": TMDB_IMAGE_PREFIX + movie["poster_path"] if movie.get("poster_path") else None,
                "rating": movie.get("vote_average"),
                "description": movie.get("overview")
            }
        else:
            return {
                "title": title,
                "poster": None,
                "rating": None,
                "description": "No description found."
            }

# --- 推荐接口逻辑 ---
@app.post("/recommend")
async def recommend_movies(data: MoodInput):
    prompt = (
        f"Return ONLY a JSON array of 3 movie titles that match this mood: '{data.mood}'. "
        "No explanation, no description, no year. Example: [\"Up\", \"La La Land\", \"Her\"]"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        raw_content = response.choices[0].message.content.strip()

        try:
            titles = json.loads(raw_content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"GPT response not valid JSON:\n{raw_content}")

        movie_details = await asyncio.gather(*(fetch_movie_info(title) for title in titles))

        return {"recommendations": movie_details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/watched")
async def add_watched_movie(movie: MovieInput):
    async with AsyncSessionLocal() as session:
        new_movie = WatchedMovie(**movie.dict())
        session.add(new_movie)
        try:
            await session.commit()
            return {"message": "Movie added to watched list"}
        except SQLAlchemyError as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/waiting")
async def add_waiting_movie(movie: MovieInput):
    async with AsyncSessionLocal() as session:
        new_movie = WaitingMovie(**movie.dict())
        session.add(new_movie)
        try:
            await session.commit()
            return {"message": "Movie added to waiting list"}
        except SQLAlchemyError as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        

@app.get("/watched-list")
async def get_watched_list(username: str = Query(...)):
    try:
        movies = await get_watched_movies(username)
        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/waiting-list")
async def get_waiting_list(username: str = Query(...)):
    try:
        movies = await get_waiting_movies(username)
        return {"movies": movies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/watched/{title}")
async def delete_watched_movie(title: str, username: str = Query(...)):
    async with AsyncSessionLocal() as session:
        try:
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
                return {"message": "Deleted from watched list"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.delete("/waiting/{title}")
async def delete_watched_movie(title: str, username: str = Query(...)):
    async with AsyncSessionLocal() as session:
        try:
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
                return {"message": "Deleted from to watch list"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))