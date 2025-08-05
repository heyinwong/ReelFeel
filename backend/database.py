from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import delete
from models import WatchedMovie, WaitingMovie
from base import Base
from datetime import datetime

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")  

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ---------- Watched List ----------
async def get_watched_movies(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(WatchedMovie).where(WatchedMovie.user_id == user_id)
        )
        return result.scalars().all()

async def add_to_watched(session: AsyncSession, movie_data: dict):
    user_id = movie_data["user_id"]
    title = movie_data["title"]

    existing = await session.execute(
    select(WatchedMovie).where(
        WatchedMovie.user_id == user_id,
        WatchedMovie.tmdb_id == movie_data["tmdb_id"]
    )
)
    if existing.scalar():
        return

    await session.execute(
    delete(WaitingMovie).where(
        WaitingMovie.user_id == user_id,
        WaitingMovie.tmdb_id == movie_data["tmdb_id"]
        )
    )

    # Ensure all new fields are present
    new_movie = WatchedMovie(
        title=movie_data["title"],
        poster=movie_data.get("poster"),
        backdrop=movie_data.get("backdrop"),
        tmdb_rating=movie_data.get("tmdb_rating"),
        description=movie_data.get("description"),
        user_rating=movie_data.get("user_rating"),
        liked=movie_data.get("liked"),
        review=movie_data.get("review"),
        moods=movie_data.get("moods"),
        watch_date=movie_data.get("watch_date"),
        user_id=user_id,
        tmdb_id=movie_data.get("tmdb_id"),
        release_year=movie_data.get("release_year"),
        genres=movie_data.get("genres"),
        director=movie_data.get("director"),
    )
    session.add(new_movie)

# ---------- Waiting List ----------
async def get_waiting_movies(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(WaitingMovie).where(WaitingMovie.user_id == user_id)
        )
        return result.scalars().all()

async def add_to_waiting(session: AsyncSession, movie_data: dict):
    user_id = movie_data["user_id"]
    title = movie_data["title"]

    existing_watched = await session.execute(
    select(WatchedMovie).where(
        WatchedMovie.user_id == user_id,
        WatchedMovie.tmdb_id == movie_data["tmdb_id"]
    )
)
    if existing_watched.scalar():
        return

    existing_waiting = await session.execute(
    select(WaitingMovie).where(
        WaitingMovie.user_id == user_id,
        WaitingMovie.tmdb_id == movie_data["tmdb_id"]
    )
)
    if existing_waiting.scalar():
        return

    new_movie = WaitingMovie(
        title=movie_data["title"],
        poster=movie_data.get("poster"),
        backdrop=movie_data.get("backdrop"),
        tmdb_rating=movie_data.get("tmdb_rating"),
        description=movie_data.get("description"),
        user_id=user_id,
        tmdb_id=movie_data.get("tmdb_id"),
        release_year=movie_data.get("release_year"),
        genres=movie_data.get("genres"),
        director=movie_data.get("director"),
        added_date=movie_data.get("added_date")  # Optional
    )
    session.add(new_movie)

# ---------- Move from Waiting → Watched ----------
async def move_to_watched(session: AsyncSession, movie_data: dict):
    user_id = movie_data["user_id"]
    title = movie_data["title"]

    result = await session.execute(
    select(WaitingMovie).where(
        WaitingMovie.user_id == user_id,
        WaitingMovie.tmdb_id == movie_data["tmdb_id"]
    )
)
    waiting_movie = result.scalar_one_or_none()
    if not waiting_movie:
        return

    await session.execute(
    delete(WaitingMovie).where(
        WaitingMovie.user_id == user_id,
        WaitingMovie.tmdb_id == movie_data["tmdb_id"]
    )
)

    full_data = {
        "user_id": waiting_movie.user_id,
        "title": waiting_movie.title,
        "poster": waiting_movie.poster,
        "backdrop": waiting_movie.backdrop,
        "tmdb_rating": waiting_movie.tmdb_rating,
        "description": waiting_movie.description,
        "user_rating": movie_data.get("user_rating"),
        "liked": movie_data.get("liked", False),
        "review": movie_data.get("review", ""),
        "tmdb_id": waiting_movie.tmdb_id,
        "release_year": waiting_movie.release_year,
        "genres": waiting_movie.genres,
        "director": waiting_movie.director,
        "moods": ", ".join(movie_data.get("moods") or []) if isinstance(movie_data.get("moods"), list) else (movie_data.get("moods") or ""),
        "watch_date": datetime.strptime(movie_data["watch_date"], "%Y-%m-%d").date()
            if movie_data.get("watch_date")
            else None,
    }

    existing = await session.execute(
    select(WatchedMovie).where(
        WatchedMovie.user_id == user_id,
        WatchedMovie.tmdb_id == movie_data["tmdb_id"]
    )
)
    if existing.scalar():
        return

    session.add(WatchedMovie(**full_data))

# ---------- Dependency ----------
from contextlib import asynccontextmanager

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session