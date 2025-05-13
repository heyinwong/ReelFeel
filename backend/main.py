from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
import json
import asyncio
import aiohttp
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import httpx
from fastapi.responses import JSONResponse

from database import (
    async_session,
    get_watched_movies,
    get_waiting_movies,
    add_to_watched,
    add_to_waiting,
    move_to_watched,
)
from models import WatchedMovie, WaitingMovie

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Pydantic Models ----------
class MoodInput(BaseModel):
    mood: str

class AddMovieInput(BaseModel):
    username: str
    title: str
    poster: str
    backdrop: str
    tmdb_rating: float | None = None
    description: str

# ---------- TMDB Movie Info Helper ----------
async def fetch_movie_info(title: str):
    api_key = os.getenv("TMDB_API_KEY")
    url = f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={title}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=500, detail="TMDB API Error")

            data = await resp.json()
            if not data["results"]:
                return {
                    "title": title,
                    "description": "Not found",
                    "poster": "",
                    "backdrop": "",
                    "tmdb_rating": None,
                }

            movie = data["results"][0]
            return {
                "title": movie["title"],
                "description": movie.get("overview", "No description."),
                "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else "",
                "backdrop": f"https://image.tmdb.org/t/p/w780{movie['backdrop_path']}" if movie.get("backdrop_path") else "",
                "tmdb_rating": movie.get("vote_average"),
            }

# ---------- Routes ----------

@app.post("/recommend")
async def recommend_movies(data: MoodInput):
    prompt = (
        f"Return ONLY a JSON array of 3 movie titles that match this mood: '{data.mood}'. "
        "No explanation, no description, no year. Example: [\"Up\", \"La La Land\", \"Her\"]"
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        raw_content = response.choices[0].message.content.strip()
        try:
            titles = json.loads(raw_content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"Invalid JSON:\n{raw_content}")

        movie_details = await asyncio.gather(*(fetch_movie_info(t) for t in titles))
        return {"recommendations": movie_details}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/watched-list")
async def get_watched(username: str):
    return {"movies": await get_watched_movies(username)}

@app.get("/waiting-list")
async def get_waiting(username: str):
    return {"movies": await get_waiting_movies(username)}

@app.post("/watched")
async def add_watched(movie: AddMovieInput):
    async with async_session() as session:
        await add_to_watched(session, movie.dict())
        await session.commit()
    return {"message": "Added to watched."}

@app.post("/waiting")
async def add_waiting(movie: AddMovieInput):
    async with async_session() as session:
        await add_to_waiting(session, movie.dict())
        await session.commit()
    return {"message": "Added to waiting."}

@app.delete("/watched/{title}")
async def delete_watched(title: str, username: str):
    async with async_session() as session:
        await session.execute(
            delete(WatchedMovie).where(
                (WatchedMovie.username == username) & (WatchedMovie.title == title)
            )
        )
        await session.commit()
    return {"message": "Deleted from watched list"}

@app.delete("/waiting/{title}")
async def delete_waiting(title: str, username: str):
    async with async_session() as session:
        await session.execute(
            delete(WaitingMovie).where(
                (WaitingMovie.username == username) & (WaitingMovie.title == title)
            )
        )
        await session.commit()
    return {"message": "Deleted from waiting list"}

@app.post("/review")
async def review_movie(payload: dict = Body(...)):
    print("📥 Received review payload:", payload)

    from_waiting = payload.pop("fromWaiting", False)
    print("📌 fromWaiting popped:", from_waiting)

    async with async_session() as session:
        if from_waiting:
            print("➡️ Entering move_to_watched()...")
            try:
                await move_to_watched(session, payload)
                print("✅ move_to_watched() completed")
                await session.commit()
                print("✅ session.commit() completed")
            except Exception as e:
                print("❌ Error in from_waiting block:", e)
                raise
        else:
            try:
                result = await session.execute(
                    select(WatchedMovie).where(
                        (WatchedMovie.username == payload["username"]) &
                        (WatchedMovie.title == payload["title"])
                    )
                )
                movie = result.scalar_one_or_none()
                if movie:
                    print("✏️ Updating existing watched movie:", movie.title)
                    movie.review = payload.get("review", movie.review)
                    moods = payload.get("moods", [])
                    movie.moods = ", ".join(moods) if isinstance(moods, list) else moods
                    date_str = payload.get("watch_date", None)
                    if date_str:
                        movie.watch_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                    movie.user_rating = payload.get("user_rating", movie.user_rating)
                    movie.liked = payload.get("liked", movie.liked)
                    await session.commit()
                    print("✅ Updated and committed")
                else:
                    print("⚠️ Movie not found in watched list")
                    raise HTTPException(status_code=404, detail="Movie not found in watched list")
            except Exception as e:
                print("❌ Error in watched update block:", e)
                raise

    return {"message": "Review saved."}

@app.get("/search_suggestions")
async def search_suggestions(query: str = Query(..., min_length=1)):
    api_key = os.getenv("TMDB_API_KEY")
    """
    提供实时搜索建议：返回与关键词匹配的最多 5 部电影（标题 + 海报路径 + ID）
    """
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": api_key,
        "query": query,
        "language": "en-US",
        "include_adult": False,
        "page": 1,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    results = data.get("results", [])[:5]
    suggestions = [
        {
            "id": movie["id"],
            "title": movie["title"],
            "poster": f"https://image.tmdb.org/t/p/w185{movie['poster_path']}" if movie.get("poster_path") else "",
        }
        for movie in results if movie.get("title")
    ]

    return {"suggestions": suggestions}