from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from auth import get_current_user
from models import User
from fastapi import Depends
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
from auth import router as auth_router
from typing import Optional
from ai import generate_snapshot_comment, regenerate_taste_summary
from database import (
    async_session,
    init_db,
    get_db,
    get_watched_movies,
    get_waiting_movies,
    add_to_watched,
    add_to_waiting,
    move_to_watched,
)
from models import WatchedMovie, WaitingMovie, TasteSnapshot, TasteSummary

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🌱 Initializing DB...")
    await init_db()
    print("✅ DB Ready.")
    yield
    print("🧹 Cleanup if needed.")

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router)

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
    mode: Optional[str] = None  # "include_waiting"
    user_id: Optional[int] = None

class AddMovieInput(BaseModel):
    title: str
    poster: str
    backdrop: str
    tmdb_rating: float | None = None
    description: str

class UpdateSummaryInput(BaseModel):
    feedback: str
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
async def recommend_movies(data: MoodInput, db: AsyncSession = Depends(get_db)):
    try:
        # === 游客模式（无 user_id） ===
        if data.user_id is None:
            prompt = (
                f"Return ONLY a JSON array of 3 movie titles that match this mood: '{data.mood}'. "
                "No explanation, no description, no year. Example: [\"Up\", \"La La Land\", \"Her\"]"
            )

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

            movie_details = []
            for title in titles:
                info = await fetch_movie_info(title)
                if info:
                    info["reason"] = ""  # 空理由
                    movie_details.append(info)

            return {"recommendations": movie_details}

        # === 登录用户完整逻辑 ===
        user_id = data.user_id

        watched_result = await db.execute(
            select(WatchedMovie.title).where(WatchedMovie.user_id == user_id)
        )
        watched_titles = [row[0] for row in watched_result.fetchall()]

        waiting_titles = []
        if data.mode == "include_waiting":
            waiting_result = await db.execute(
                select(WaitingMovie.title).where(WaitingMovie.user_id == user_id)
            )
            waiting_titles = [row[0] for row in waiting_result.fetchall()]

        summary_result = await db.execute(
            select(TasteSummary.summary).where(TasteSummary.user_id == user_id)
        )
        taste_summary = summary_result.scalar() or "暂无用户画像。"

        prompt = (
            f"You are a personalized movie recommender.\n"
            f"User's taste summary:\n{taste_summary}\n\n"
            f"User query or mood: {data.mood}\n"
            f"Do NOT recommend these watched titles:\n{watched_titles}\n"
        )
        if waiting_titles:
            prompt += f"Try to include or prioritize these waiting titles if relevant:\n{waiting_titles}\n"

        prompt += (
            "Return a JSON array of 3 items, each containing a 'title' and a short 'reason'.\n"
            "Example: [{\"title\": \"Inception\", \"reason\": \"You enjoy sci-fi mind-bending plots.\"}]\n"
        )

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        raw_content = response.choices[0].message.content.strip()

        try:
            recommendations = json.loads(raw_content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"Invalid JSON:\n{raw_content}")

        result = []
        for item in recommendations:
            title = item.get("title")
            reason = item.get("reason", "")
            info = await fetch_movie_info(title)
            if info:
                info["reason"] = reason
                result.append(info)

        return {"recommendations": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/watched-list")
async def get_watched(user: User = Depends(get_current_user)):
    return {"movies": await get_watched_movies(user.id)}

@app.get("/waiting-list")
async def get_waiting(user: User = Depends(get_current_user)):
    return {"movies": await get_waiting_movies(user.id)}

@app.get("/taste-summary")
async def get_taste_summary(user: User = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(
            select(TasteSummary).where(TasteSummary.user_id == user.id)
        )
        summary = result.scalar_one_or_none()
        if summary:
            return {"summary": summary.summary}
        else:
            return {"summary": "No summary available yet."}

@app.get("/snapshot-history")
async def get_snapshot_history(user: User = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(
            select(TasteSnapshot)
            .where(TasteSnapshot.user_id == user.id)
            .order_by(TasteSnapshot.timestamp.desc())
        )
        snapshots = result.scalars().all()
        return {
            "snapshots": [
                {   "id": s.id,
                    "movie_id": s.movie_id,
                    "timestamp": s.timestamp.isoformat() if s.timestamp else None,
                    "mood": s.mood_tag,
                    "comment": s.gpt_comment,
                    "movie_title": s.movie_title,
                }
                for s in snapshots
            ]
        }


@app.post("/watched")
async def add_watched(
    movie: AddMovieInput,
    user: User = Depends(get_current_user)
):
    movie_data = movie.model_dump()
    movie_data["user_id"] = user.id  # 绑定当前登录用户

    async with async_session() as session:
        await add_to_watched(session, movie_data)
        await session.commit()
    return {"message": "Added to watched."}

@app.post("/waiting")
async def add_waiting(movie: AddMovieInput, user: User = Depends(get_current_user)):
    movie_data = movie.model_dump()
    movie_data["user_id"] = user.id

    async with async_session() as session:
        await add_to_waiting(session, movie_data)
        await session.commit()
    return {"message": "Added to waiting."}

@app.delete("/watched/{title}")
async def delete_watched(title: str, user: User = Depends(get_current_user)):
    async with async_session() as session:
        # ✅ 先找对应电影
        result = await session.execute(
            select(WatchedMovie).where(
                (WatchedMovie.user_id == user.id) & (WatchedMovie.title == title)
            )
        )
        movie = result.scalar_one_or_none()

        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")

        # ✅ 删除 snapshot
        await session.execute(
            delete(TasteSnapshot).where(
                (TasteSnapshot.user_id == user.id) & (TasteSnapshot.movie_id == movie.id)
            )
        )

        # ✅ 删除 watched
        await session.execute(
            delete(WatchedMovie).where(
                (WatchedMovie.user_id == user.id) & (WatchedMovie.title == title)
            )
        )

        # ✅ 重建 summary
        await regenerate_taste_summary(session, user.id)

        await session.commit()

    return {"message": "Deleted and summary updated"}

@app.delete("/waiting/{title}")
async def delete_waiting(title: str, user: User = Depends(get_current_user)):
    async with async_session() as session:
        await session.execute(
            delete(WaitingMovie).where(
                (WaitingMovie.user_id == user.id) & (WaitingMovie.title == title)
            )
        )
        await session.commit()
    return {"message": "Deleted from waiting list"}

@app.post("/review")
async def review_movie(
    payload: dict = Body(...),
    user: User = Depends(get_current_user)
):
    print(" Received review payload:", payload)

    from_waiting = payload.pop("fromWaiting", False)
    print(" fromWaiting popped:", from_waiting)

    async with async_session() as session:
        if from_waiting:
            print(" Entering move_to_watched()...")
            try:
                payload["user_id"] = user.id  # 提供给 move_to_watched 使用
                await move_to_watched(session, payload)
                await session.commit()
                print(" move_to_watched() committed")

                # 🔄 再查一次刚添加的 watched movie（供 AI 使用）
                result = await session.execute(
                    select(WatchedMovie).where(
                        (WatchedMovie.user_id == user.id) &
                        (WatchedMovie.title == payload["title"])
                    )
                )
                movie = result.scalar_one_or_none()
                if not movie:
                    raise HTTPException(status_code=500, detail="Movie moved but not found")

                # ✨ AI 处理 snapshot + summary
                await process_taste_modeling(session, user, movie)

            except Exception as e:
                print(" Error in from_waiting block:", e)
                raise

        else:
            try:
                result = await session.execute(
                    select(WatchedMovie).where(
                        (WatchedMovie.user_id == user.id) &
                        (WatchedMovie.title == payload["title"])
                    )
                )
                movie = result.scalar_one_or_none()
                if movie:
                    print(" Updating existing watched movie:", movie.title)
                    movie.review = payload.get("review", movie.review)
                    moods = payload.get("moods", [])
                    movie.moods = ", ".join(moods) if isinstance(moods, list) else moods
                    date_str = payload.get("watch_date", None)
                    if date_str:
                        movie.watch_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                    movie.user_rating = payload.get("user_rating", movie.user_rating)
                    movie.liked = payload.get("liked", movie.liked)
                    await session.commit()
                    print(" Updated and committed")

                    # ✨ AI 处理 snapshot + summary
                    await process_taste_modeling(session, user, movie)

                else:
                    print(" Movie not found in watched list")
                    raise HTTPException(status_code=404, detail="Movie not found in watched list")
            except Exception as e:
                print("Error in watched update block:", e)
                raise

    return {"message": "Review saved."}
async def process_taste_modeling(session, user, movie):
    try:
        snapshot_comment = await generate_snapshot_comment(
            movie_title=movie.title,
            user_rating=movie.user_rating,
            review=movie.review,
            mood_tags=movie.moods
        )

        snapshot = TasteSnapshot(
            user_id=user.id,
            movie_title=movie.title,
            movie_id=movie.id,
            action_type="review",
            mood_tag=movie.moods,
            gpt_comment=snapshot_comment
        )
        session.add(snapshot)

        await regenerate_taste_summary(session, user.id)
        await session.commit()
    except Exception as e:
        print("Snapshot/summary update failed:", e)

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

@app.post("/search")
async def search_movies(data: MoodInput):
    """
    接收关键词并返回最多 3 个匹配电影的完整信息
    """
    query = data.mood

    try:
        api_key = os.getenv("TMDB_API_KEY")
        url = f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={query}&language=en-US&include_adult=false&page=1"

        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

        results = data.get("results", [])[:3]
        if not results:
            return {"recommendations": []}

        # 利用 fetch_movie_info 获取完整详情（但你可以选用更轻量方式）
        # 也可以直接在这里统一字段名，避免前端再判断
        recommendations = [
            {
                "title": movie.get("title", "Unknown"),
                "description": movie.get("overview", "No description."),
                "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else "",
                "backdrop": f"https://image.tmdb.org/t/p/w780{movie['backdrop_path']}" if movie.get("backdrop_path") else "",
                "tmdb_rating": movie.get("vote_average", "N/A"),
            }
            for movie in results
        ]

        return {"recommendations": recommendations}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/movie_by_title")
async def movie_by_title(title: str):
    try:
        movie = await fetch_movie_info(title)
        return {"recommendations": [movie]}  
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/me")
async def read_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username}

        

@app.delete("/delete_snapshot/{snapshot_id}")
async def delete_snapshot(snapshot_id: int, user: User = Depends(get_current_user)):
    async with async_session() as session:
        # 1. 查询 snapshot 是否属于当前用户
        result = await session.execute(
            select(TasteSnapshot).where(
                (TasteSnapshot.id == snapshot_id) &
                (TasteSnapshot.user_id == user.id)
            )
        )
        snapshot = result.scalar_one_or_none()

        if not snapshot:
            raise HTTPException(status_code=404, detail="Snapshot not found")

        # 2. 删除 snapshot
        await session.execute(
            delete(TasteSnapshot).where(TasteSnapshot.id == snapshot_id)
        )

        # 3. 重建 summary
        await regenerate_taste_summary(session, user.id)

        await session.commit()

    return {"message": "Snapshot deleted and summary updated"}

@app.post("/update_summary")
async def update_taste_summary_feedback(
    data: UpdateSummaryInput,
    user: User = Depends(get_current_user)
):
    async with async_session() as session:
        try:
            # 📌 添加 correction 类型 snapshot
            correction_snapshot = TasteSnapshot(
                user_id=user.id,
                movie_id=None,
                action_type="correction",
                mood_tag=None,
                gpt_comment=data.feedback,
                timestamp=datetime.utcnow()
            )
            session.add(correction_snapshot)

            # ✅ 重建 summary（将所有 snapshot 包括 correction 统一建模）
            await regenerate_taste_summary(session, user.id)

            await session.commit()
            print("✅ Summary regenerated with correction.")

            # 🔁 再次获取新 summary 返回给前端
            result = await session.execute(
                select(TasteSummary.summary).where(TasteSummary.user_id == user.id)
            )
            updated_summary = result.scalar_one_or_none()

            return {"summary": updated_summary or "Summary updated."}

        except Exception as e:
            print("❌ COMMIT ERROR:", e)
            raise HTTPException(status_code=500, detail="Failed to update summary")