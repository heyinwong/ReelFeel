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
    liked:bool | None=False

class RatingInput(BaseModel):
    username: str
    title: str
    user_rating: float

class LikeInput(BaseModel):
    username: str
    title: str
    liked: bool

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
                "poster": TMDB_POSTER_PREFIX + movie["poster_path"] if movie.get("poster_path") else None,
                "backdrop": TMDB_BACKDROP_PREFIX + movie["backdrop_path"] if movie.get("backdrop_path") else None,
                "tmdb_rating": movie.get("vote_average"),
                "description": movie.get("overview")
            }
        else:
            return {
                "title": title,
                "poster_url": None,
                "backdrop_url": None,
                "tmdb_rating": None,
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
        new_movie = WatchedMovie(
    username=movie.username,
    title=movie.title,
    poster=movie.poster,
    backdrop=movie.backdrop,  # ✅ 添加
    tmdb_rating=movie.tmdb_rating,
    user_rating=movie.user_rating,
    description=movie.description,
    liked=movie.liked
)
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
        new_movie = WaitingMovie(
    username=movie.username,
    title=movie.title,
    poster=movie.poster,
    backdrop=movie.backdrop,  # ✅ 添加
    tmdb_rating=movie.tmdb_rating,
    user_rating=movie.user_rating,
    description=movie.description,
    liked=movie.liked
)
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
                select(WaitingMovie).where(
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

@app.post("/rate")
async def rate_movie(data: RatingInput):
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
                await session.commit()
                return {"message": f"Rated '{data.title}' with score {data.user_rating}"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found in watched list")
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        
@app.post("/like")
async def like_movie(data: LikeInput):
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
                await session.commit()
                return {"message": f"Movie '{data.title}' liked status set to {data.liked}"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found in watched list")
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
                movie.user_rating = data.user_rating
                await session.commit()
                return {"message": f"Rated (waiting) '{data.title}' with {data.user_rating}"}
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
                movie.liked = data.liked
                await session.commit()
                return {"message": f"Movie '{data.title}' liked status set to {data.liked} (waiting list)"}
            else:
                raise HTTPException(status_code=404, detail="Movie not found in waiting list")
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))