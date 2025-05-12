from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import delete
from models import WatchedMovie, WaitingMovie
from base import Base

DATABASE_URL = "sqlite+aiosqlite:///./app.db"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_watched_movies(username: str):
    async with async_session() as session:
        result = await session.execute(
            select(WatchedMovie).where(WatchedMovie.username == username)
        )
        return result.scalars().all()

async def get_waiting_movies(username: str):
    async with async_session() as session:
        result = await session.execute(
            select(WaitingMovie).where(WaitingMovie.username == username)
        )
        return result.scalars().all()

async def add_to_watched(session: AsyncSession, movie_data: dict):
    existing = await session.execute(
        select(WatchedMovie).where(
            WatchedMovie.username == movie_data["username"],
            WatchedMovie.title == movie_data["title"]
        )
    )
    if existing.scalar():
        return

    await session.execute(
        delete(WaitingMovie).where(
            WaitingMovie.username == movie_data["username"],
            WaitingMovie.title == movie_data["title"]
        )
    )

    new_movie = WatchedMovie(**movie_data)
    session.add(new_movie)

async def add_to_waiting(session: AsyncSession, movie_data: dict):
    existing_watched = await session.execute(
        select(WatchedMovie).where(
            WatchedMovie.username == movie_data["username"],
            WatchedMovie.title == movie_data["title"]
        )
    )
    if existing_watched.scalar():
        return

    existing_waiting = await session.execute(
        select(WaitingMovie).where(
            WaitingMovie.username == movie_data["username"],
            WaitingMovie.title == movie_data["title"]
        )
    )
    if existing_waiting.scalar():
        return

    new_movie = WaitingMovie(**movie_data)
    session.add(new_movie)

async def move_to_watched(session: AsyncSession, movie_data: dict):
    result = await session.execute(
        select(WaitingMovie).where(
            WaitingMovie.username == movie_data["username"],
            WaitingMovie.title == movie_data["title"]
        )
    )
    waiting_movie = result.scalar_one_or_none()
    if not waiting_movie:
        return

    await session.execute(
        delete(WaitingMovie).where(
            WaitingMovie.username == movie_data["username"],
            WaitingMovie.title == movie_data["title"]
        )
    )

    full_data = {
        "username": waiting_movie.username,
        "title": waiting_movie.title,
        "poster": waiting_movie.poster,
        "backdrop": waiting_movie.backdrop,
        "tmdb_rating": waiting_movie.tmdb_rating,
        "description": waiting_movie.description,
        "user_rating": movie_data.get("user_rating"),
        "liked": movie_data.get("liked", False),
        "review": movie_data.get("review", ""),
        "moods": ", ".join(movie_data.get("moods") or []) if isinstance(movie_data.get("moods"), list) else (movie_data.get("moods") or ""),
        "watch_date": datetime.strptime(movie_data["watch_date"], "%Y-%m-%d").date()
            if movie_data.get("watch_date")
            else None,
    }

    existing = await session.execute(
        select(WatchedMovie).where(
            WatchedMovie.username == full_data["username"],
            WatchedMovie.title == full_data["title"]
        )
    )
    if existing.scalar():
        return
    print("🟡 trying to insert into watched:", full_data)
    session.add(WatchedMovie(**full_data))