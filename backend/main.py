from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json
import os
import httpx
import asyncio

# --- API Keys ---
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if not TMDB_API_KEY:
    raise RuntimeError("TMDB_API_KEY is not set. Please check your environment variables.")

client = OpenAI()

# --- TMDB Constants ---
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
TMDB_IMAGE_PREFIX = "https://image.tmdb.org/t/p/w500"

# --- FastAPI App ---
app = FastAPI()

# --- CORS Support ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可以限制为你的前端域名
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