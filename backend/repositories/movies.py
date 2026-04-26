from datetime import date, datetime
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import async_session
from models import TasteSnapshot, WaitingMovie, WatchedMovie


def serialize_movie(movie: WatchedMovie | WaitingMovie) -> dict[str, Any]:
    return {
        "id": movie.id,
        "title": movie.title,
        "poster": movie.poster,
        "backdrop": movie.backdrop,
        "tmdb_rating": movie.tmdb_rating,
        "description": movie.description,
        "user_id": movie.user_id,
        "tmdb_id": movie.tmdb_id,
        "release_year": movie.release_year,
        "genres": movie.genres,
        "director": movie.director,
        "user_rating": getattr(movie, "user_rating", None),
        "liked": getattr(movie, "liked", None),
        "disliked": getattr(movie, "disliked", False),
        "review": getattr(movie, "review", None),
        "moods": getattr(movie, "moods", None),
        "watch_date": getattr(movie, "watch_date", None),
        "added_date": getattr(movie, "added_date", None),
    }


async def list_watched_movies(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(WatchedMovie).where(WatchedMovie.user_id == user_id)
        )
        return result.scalars().all()


async def list_waiting_movies(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(WaitingMovie).where(WaitingMovie.user_id == user_id)
        )
        return result.scalars().all()


async def get_user_title_sets(session: AsyncSession, user_id: int):
    watched = await session.execute(
        select(WatchedMovie.title, WatchedMovie.tmdb_id).where(WatchedMovie.user_id == user_id)
    )
    waiting = await session.execute(
        select(WaitingMovie.title, WaitingMovie.tmdb_id).where(WaitingMovie.user_id == user_id)
    )
    return watched.fetchall(), waiting.fetchall()


async def add_watched_movie(session: AsyncSession, user_id: int, movie_data: dict):
    existing = await session.execute(
        select(WatchedMovie).where(
            WatchedMovie.user_id == user_id,
            WatchedMovie.tmdb_id == movie_data["tmdb_id"],
        )
    )
    if existing.scalar_one_or_none():
        return None

    await session.execute(
        delete(WaitingMovie).where(
            WaitingMovie.user_id == user_id,
            WaitingMovie.tmdb_id == movie_data["tmdb_id"],
        )
    )

    movie = WatchedMovie(
        title=movie_data["title"],
        poster=movie_data.get("poster", ""),
        backdrop=movie_data.get("backdrop", ""),
        tmdb_rating=movie_data.get("tmdb_rating"),
        description=movie_data.get("description", ""),
        user_rating=movie_data.get("user_rating"),
        liked=movie_data.get("liked"),
        disliked=movie_data.get("disliked", False),
        review=movie_data.get("review"),
        moods=movie_data.get("moods"),
        watch_date=movie_data.get("watch_date"),
        user_id=user_id,
        tmdb_id=movie_data.get("tmdb_id"),
        release_year=movie_data.get("release_year"),
        genres=movie_data.get("genres"),
        director=movie_data.get("director"),
    )
    session.add(movie)
    await session.flush()
    return movie


async def add_waiting_movie(session: AsyncSession, user_id: int, movie_data: dict):
    existing_watched = await session.execute(
        select(WatchedMovie).where(
            WatchedMovie.user_id == user_id,
            WatchedMovie.tmdb_id == movie_data["tmdb_id"],
        )
    )
    if existing_watched.scalar_one_or_none():
        return None

    existing_waiting = await session.execute(
        select(WaitingMovie).where(
            WaitingMovie.user_id == user_id,
            WaitingMovie.tmdb_id == movie_data["tmdb_id"],
        )
    )
    if existing_waiting.scalar_one_or_none():
        return None

    movie = WaitingMovie(
        title=movie_data["title"],
        poster=movie_data.get("poster", ""),
        backdrop=movie_data.get("backdrop", ""),
        tmdb_rating=movie_data.get("tmdb_rating"),
        description=movie_data.get("description", ""),
        user_id=user_id,
        tmdb_id=movie_data.get("tmdb_id"),
        release_year=movie_data.get("release_year"),
        genres=movie_data.get("genres"),
        director=movie_data.get("director"),
        added_date=movie_data.get("added_date"),
    )
    session.add(movie)
    await session.flush()
    return movie


async def find_watched_movie(session: AsyncSession, user_id: int, payload: dict):
    movie_id = payload.get("id")
    tmdb_id = payload.get("tmdb_id")
    title = payload.get("title")

    filters = []
    if movie_id:
        filters.append(WatchedMovie.id == movie_id)
    if tmdb_id:
        filters.append(WatchedMovie.tmdb_id == tmdb_id)
    if title:
        filters.append(WatchedMovie.title == title)

    for condition in filters:
        result = await session.execute(
            select(WatchedMovie).where(WatchedMovie.user_id == user_id, condition)
        )
        movie = result.scalar_one_or_none()
        if movie:
            return movie
    return None


async def move_waiting_to_watched(session: AsyncSession, user_id: int, payload: dict):
    result = await session.execute(
        select(WaitingMovie).where(
            WaitingMovie.user_id == user_id,
            WaitingMovie.tmdb_id == payload.get("tmdb_id"),
        )
    )
    waiting_movie = result.scalar_one_or_none()
    if not waiting_movie:
        return None

    existing = await session.execute(
        select(WatchedMovie).where(
            WatchedMovie.user_id == user_id,
            WatchedMovie.tmdb_id == waiting_movie.tmdb_id,
        )
    )
    if existing.scalar_one_or_none():
        await session.delete(waiting_movie)
        await session.flush()
        return None

    watch_date = parse_optional_date(payload.get("watch_date"))
    movie = WatchedMovie(
        user_id=user_id,
        title=waiting_movie.title,
        poster=waiting_movie.poster,
        backdrop=waiting_movie.backdrop,
        tmdb_rating=waiting_movie.tmdb_rating,
        description=waiting_movie.description,
        tmdb_id=waiting_movie.tmdb_id,
        release_year=waiting_movie.release_year,
        genres=waiting_movie.genres,
        director=waiting_movie.director,
        user_rating=payload.get("user_rating"),
        liked=payload.get("liked", False),
        disliked=payload.get("disliked", False),
        review=payload.get("review", ""),
        moods=normalize_moods(payload.get("moods")),
        watch_date=watch_date,
    )
    session.add(movie)
    await session.delete(waiting_movie)
    await session.flush()
    return movie


async def delete_watched_movie(session: AsyncSession, user_id: int, movie_id: int):
    result = await session.execute(
        select(WatchedMovie).where(WatchedMovie.user_id == user_id, WatchedMovie.id == movie_id)
    )
    movie = result.scalar_one_or_none()
    if not movie:
        return None

    await session.execute(
        delete(TasteSnapshot).where(
            TasteSnapshot.user_id == user_id,
            TasteSnapshot.movie_id == movie.id,
        )
    )
    await session.delete(movie)
    await session.flush()
    return movie


async def delete_waiting_movie(session: AsyncSession, user_id: int, movie_id: int):
    result = await session.execute(
        select(WaitingMovie).where(WaitingMovie.user_id == user_id, WaitingMovie.id == movie_id)
    )
    movie = result.scalar_one_or_none()
    if not movie:
        return None

    await session.delete(movie)
    await session.flush()
    return movie


def normalize_moods(value) -> str:
    if isinstance(value, list):
        return ", ".join(value)
    return value or ""


def parse_optional_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value), "%Y-%m-%d").date()
