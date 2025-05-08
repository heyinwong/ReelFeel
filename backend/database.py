from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from models import WatchedMovie, WaitingMovie
DATABASE_URL = "sqlite+aiosqlite:///./app.db"  

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_watched_movies(username: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(WatchedMovie).where(WatchedMovie.username == username)
        )
        movies = result.scalars().all()
        return [
            {
                "title": movie.title,
                "poster": movie.poster,
                "backdrop": movie.backdrop,
                "tmdb_rating": movie.tmdb_rating,
                "user_rating": movie.user_rating,
                "description": movie.description,
                "liked": movie.liked
            }
            for movie in movies
        ]

async def get_waiting_movies(username: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(WaitingMovie).where(WaitingMovie.username == username)
        )
        movies = result.scalars().all()
        return [
            {
                "title": movie.title,
                "poster": movie.poster,
                "backdrop": movie.backdrop,
                "tmdb_rating": movie.tmdb_rating,
                "user_rating": movie.user_rating,
                "description": movie.description,
                "liked": movie.liked
            }
            for movie in movies
        ]