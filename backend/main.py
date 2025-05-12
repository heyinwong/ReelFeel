from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import engine, async_session
from models import Base, WatchedMovie, WaitingMovie
from sqlalchemy.future import select
from sqlalchemy import delete, update
import datetime

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ========== Pydantic Models ==========
class MovieBase(BaseModel):
    username: str
    title: str
    poster: Optional[str] = None
    backdrop: Optional[str] = None
    tmdb_rating: Optional[float] = None
    description: Optional[str] = None

class ReviewData(MovieBase):
    user_rating: Optional[int] = None
    liked: Optional[bool] = None
    review: Optional[str] = None
    moods: Optional[List[str]] = None
    watch_date: Optional[str] = None  # ISO Date string
    from_waiting: Optional[bool] = False
    delete: Optional[bool] = False

# ========== API Endpoints ==========
@app.post("/review")
async def review_movie(data: ReviewData):
    async with async_session() as session:
        # DELETE if requested
        if data.delete:
            stmt = delete(WatchedMovie).where(
                WatchedMovie.username == data.username,
                WatchedMovie.title == data.title
            )
            await session.execute(stmt)
            await session.commit()
            return {"message": "Movie deleted from watched list."}

        # FROM WAITING ➜ Move
        if data.from_waiting:
            # Delete from waiting
            await session.execute(
                delete(WaitingMovie).where(
                    WaitingMovie.username == data.username,
                    WaitingMovie.title == data.title
                )
            )

        # Insert or update in watched
        result = await session.execute(
            select(WatchedMovie).where(
                WatchedMovie.username == data.username,
                WatchedMovie.title == data.title
            )
        )
        movie = result.scalars().first()

        if movie:
            # update existing
            movie.user_rating = data.user_rating
            movie.liked = data.liked
            movie.review = data.review
            movie.moods = ",".join(data.moods or [])
            movie.watch_date = data.watch_date or movie.watch_date
        else:
            movie = WatchedMovie(
                username=data.username,
                title=data.title,
                poster=data.poster,
                backdrop=data.backdrop,
                tmdb_rating=data.tmdb_rating,
                description=data.description,
                user_rating=data.user_rating,
                liked=data.liked,
                review=data.review,
                moods=",".join(data.moods or []),
                watch_date=data.watch_date or datetime.date.today().isoformat()
            )
            session.add(movie)

        await session.commit()
        return {"message": "Review saved."}

@app.get("/watched-list")
async def get_watched(username: str):
    async with async_session() as session:
        result = await session.execute(
            select(WatchedMovie).where(WatchedMovie.username == username)
        )
        movies = result.scalars().all()
        return {"movies": [m.dict() for m in movies]}

@app.get("/waiting-list")
async def get_waiting(username: str):
    async with async_session() as session:
        result = await session.execute(
            select(WaitingMovie).where(WaitingMovie.username == username)
        )
        movies = result.scalars().all()
        return {"movies": [m.dict() for m in movies]}

@app.post("/add-watched")
async def add_watched(movie: MovieBase):
    async with async_session() as session:
        new_movie = WatchedMovie(**movie.dict())
        session.add(new_movie)
        await session.commit()
        return {"message": "Added to watched list"}

@app.post("/add-waiting")
async def add_waiting(movie: MovieBase):
    async with async_session() as session:
        new_movie = WaitingMovie(**movie.dict())
        session.add(new_movie)
        await session.commit()
        return {"message": "Added to waiting list"}

@app.delete("/waiting/{title}")
async def delete_waiting(title: str, username: str):
    async with async_session() as session:
        await session.execute(
            delete(WaitingMovie).where(
                WaitingMovie.username == username,
                WaitingMovie.title == title
            )
        )
        await session.commit()
        return {"message": "Deleted from waiting list"}