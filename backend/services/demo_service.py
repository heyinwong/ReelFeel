import json
import secrets
from datetime import date

from passlib.context import CryptContext
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import DEMO_ENABLED, DEMO_USERNAME
from models import TasteSnapshot, TasteSummary, User, WaitingMovie, WatchedMovie
from services.tmdb_service import get_movie_detail_by_id

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
DEMO_MEDIA_VERSION = "tmdb-refresh-2026-04-26"


DEMO_MOVIES = [
    {
        "title": "Yi Yi",
        "tmdb_id": 25538,
        "release_year": 2000,
        "genres": "Drama, Family",
        "director": "Edward Yang",
        "tmdb_rating": 7.9,
        "poster": "https://image.tmdb.org/t/p/w500/8QXGNP0Vb4nsYKub59XpAhiUSQN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/7t7zR3wS8G2JQxQm7QY7xG2sJ9f.jpg",
        "description": "Each member of a middle-class Taipei family seeks to reconcile past and present relationships within their daily lives.",
        "user_rating": 9,
        "liked": 1,
        "review": "Patient, human, and quietly devastating. It notices how family memory shapes ordinary days.",
        "moods": "reflective, family, bittersweet",
        "watch_date": date(2026, 1, 3),
    },
    {
        "title": "Aftersun",
        "tmdb_id": 965150,
        "release_year": 2022,
        "genres": "Drama",
        "director": "Charlotte Wells",
        "tmdb_rating": 7.7,
        "poster": "https://image.tmdb.org/t/p/w500/evKz85EKouVbIr51zy5fOtpNRPg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/hUeLvN6DbY4yK0wZwvX7aI6yG3h.jpg",
        "description": "Sophie reflects on the shared joy and private melancholy of a holiday with her father twenty years earlier.",
        "user_rating": 9,
        "liked": 1,
        "review": "A tiny emotional time capsule. The restraint makes the grief land harder.",
        "moods": "melancholy, intimate, memory",
        "watch_date": date(2026, 1, 8),
    },
    {
        "title": "Her",
        "tmdb_id": 152601,
        "release_year": 2013,
        "genres": "Romance, Science Fiction, Drama",
        "director": "Spike Jonze",
        "tmdb_rating": 7.9,
        "poster": "https://image.tmdb.org/t/p/w500/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/22z44LPkMyf5nyyXvv8qQLsbom.jpg",
        "description": "A lonely writer develops an unexpected relationship with an operating system designed to meet his every need.",
        "user_rating": 8.5,
        "liked": 1,
        "review": "Soft sci-fi that uses technology to ask very human questions about loneliness and intimacy.",
        "moods": "lonely, romantic, speculative",
        "watch_date": date(2026, 1, 13),
    },
    {
        "title": "Arrival",
        "tmdb_id": 329865,
        "release_year": 2016,
        "genres": "Drama, Science Fiction",
        "director": "Denis Villeneuve",
        "tmdb_rating": 7.6,
        "poster": "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg",
        "description": "A linguist works with the military to communicate with alien lifeforms after mysterious spacecraft appear worldwide.",
        "user_rating": 9,
        "liked": 1,
        "review": "Grand sci-fi with an intimate emotional core. The ending feels earned, not engineered.",
        "moods": "existential, emotional, cerebral",
        "watch_date": date(2026, 1, 17),
    },
    {
        "title": "Inside Out",
        "tmdb_id": 150540,
        "release_year": 2015,
        "genres": "Animation, Family, Drama",
        "director": "Pete Docter",
        "tmdb_rating": 7.9,
        "poster": "https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/szytSpLAyBh3ULei3x663mAv5ZT.jpg",
        "description": "A young girl's emotions try to guide her through a difficult move to a new city.",
        "user_rating": 8.5,
        "liked": 1,
        "review": "Colorful, clever, and emotionally precise. Family animation with real interior life.",
        "moods": "heartwarming, family, emotional",
        "watch_date": date(2026, 1, 21),
    },
    {
        "title": "Drive My Car",
        "tmdb_id": 758866,
        "release_year": 2021,
        "genres": "Drama",
        "director": "Ryusuke Hamaguchi",
        "tmdb_rating": 7.4,
        "poster": "https://image.tmdb.org/t/p/w500/2SF6yd4ovjz8k1LjYyUbEtgE5p6.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/3z1w6g5HGzP2yN3nLQC2tZ8fVJw.jpg",
        "description": "A theater director and his chauffeur form a quiet connection while confronting grief and buried truths.",
        "user_rating": 8.5,
        "liked": 1,
        "review": "Slow but hypnotic. I like how performance becomes a way to process grief.",
        "moods": "patient, grief, contemplative",
        "watch_date": date(2026, 2, 2),
    },
    {
        "title": "Eternal Sunshine of the Spotless Mind",
        "tmdb_id": 38,
        "release_year": 2004,
        "genres": "Science Fiction, Romance, Drama",
        "director": "Michel Gondry",
        "tmdb_rating": 8.1,
        "poster": "https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/7Z2K08J0WantJHNa0vLTOmii41l.jpg",
        "description": "After a painful breakup, two people erase each other from memory and rediscover what made the relationship meaningful.",
        "user_rating": 8,
        "liked": 1,
        "review": "Messy, romantic, and formally playful. Memory-as-architecture works beautifully.",
        "moods": "romantic, surreal, bittersweet",
        "watch_date": date(2026, 2, 9),
    },
    {
        "title": "The Tree of Life",
        "tmdb_id": 8967,
        "release_year": 2011,
        "genres": "Drama, Fantasy",
        "director": "Terrence Malick",
        "tmdb_rating": 6.7,
        "poster": "https://image.tmdb.org/t/p/w500/l8cwuB5WJSoj4uMAsnzuHBOMaSJ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/5vZw7ltCKI0JiOYTtRxaIC3DX0e.jpg",
        "description": "A man reflects on childhood, family, grace, nature, and the vastness of existence.",
        "user_rating": 7.5,
        "liked": 1,
        "review": "Imperfect, but the cosmic-family scale is exactly the kind of ambition I remember.",
        "moods": "spiritual, visual, family",
        "watch_date": date(2026, 2, 18),
    },
    {
        "title": "Lost in Translation",
        "tmdb_id": 153,
        "release_year": 2003,
        "genres": "Drama, Romance",
        "director": "Sofia Coppola",
        "tmdb_rating": 7.4,
        "poster": "https://image.tmdb.org/t/p/w500/4k4Yz08WGfbu8ITIjaG99XTeco8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/mOTtuakUTb1qLzqf6ae6B8XVp5P.jpg",
        "description": "Two lonely Americans form a fleeting connection while adrift in Tokyo.",
        "user_rating": 8,
        "liked": 1,
        "review": "Mood over plot in the best way. I like the unsaid things and the city-as-emotion feeling.",
        "moods": "lonely, atmospheric, tender",
        "watch_date": date(2026, 2, 26),
    },
    {
        "title": "The Grand Budapest Hotel",
        "tmdb_id": 120467,
        "release_year": 2014,
        "genres": "Comedy, Drama",
        "director": "Wes Anderson",
        "tmdb_rating": 8.0,
        "poster": "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/6A9tKcNFKyV0c9Qk8hYJjH1q9mW.jpg",
        "description": "A concierge and lobby boy become involved in a theft, a murder, and a lost world of manners.",
        "user_rating": 7,
        "liked": 0,
        "review": "Beautifully built and funny, though sometimes the precision keeps me a little outside the emotion.",
        "moods": "stylized, funny, ornate",
        "watch_date": date(2026, 3, 4),
    },
    {
        "title": "Midsommar",
        "tmdb_id": 530385,
        "release_year": 2019,
        "genres": "Horror, Drama, Mystery",
        "director": "Ari Aster",
        "tmdb_rating": 7.2,
        "poster": "https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/g6GtOfXtzDpY73ef7wludoorTti.jpg",
        "description": "A grieving woman joins her boyfriend's trip to a remote Swedish festival that turns increasingly sinister.",
        "user_rating": 5,
        "liked": 0,
        "disliked": True,
        "review": "Striking imagery, but the cruelty overwhelms what I want from emotional horror.",
        "moods": "disturbing, bright horror, grief",
        "watch_date": date(2026, 3, 10),
    },
    {
        "title": "Past Lives",
        "tmdb_id": 666277,
        "release_year": 2023,
        "genres": "Drama, Romance",
        "director": "Celine Song",
        "tmdb_rating": 7.7,
        "poster": "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/6NcQe7it4rK5hBvnX5yHYkBUL1W.jpg",
        "description": "Two childhood friends reconnect decades later and consider the lives they might have shared.",
        "user_rating": 9,
        "liked": 1,
        "review": "Quiet, mature, and emotionally exact. I love how it trusts pauses and alternate lives.",
        "moods": "romantic, wistful, restrained",
        "watch_date": date(2026, 3, 16),
    },
]


DEMO_WAITING = [
    {
        "title": "Perfect Days",
        "tmdb_id": 976893,
        "release_year": 2023,
        "genres": "Drama",
        "director": "Wim Wenders",
        "tmdb_rating": 7.8,
        "poster": "https://image.tmdb.org/t/p/w500/k5Xz7lxh8YhA9s9L3YbXK2W5YTW.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/9PqD3wSIjntyJDBzMNuxuKHwpUD.jpg",
        "description": "A cleaner in Tokyo finds meaning in routine, music, trees, and small acts of attention.",
        "added_date": date(2026, 3, 21),
    },
    {
        "title": "Columbus",
        "tmdb_id": 414453,
        "release_year": 2017,
        "genres": "Drama",
        "director": "Kogonada",
        "tmdb_rating": 7.1,
        "poster": "https://image.tmdb.org/t/p/w500/r3zrUubT7l5jF7m7tQJvINnS8ff.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w780/wUrd6bTRVY9Jy1R0I5FeYbE3iFS.jpg",
        "description": "Two strangers form a connection through architecture, family duty, and deferred dreams.",
        "added_date": date(2026, 3, 22),
    },
]


DEMO_PROFILE = {
    "summary": (
        "You gravitate toward emotionally precise films where memory, family, and longing carry the story. "
        "Your strongest signals point to contemplative dramas, intimate sci-fi, and visually expressive films that stay humane even when they get ambitious."
    ),
    "preference_axes": {
        "emotional_core": "memory, family, grief, and alternate lives",
        "pacing": "patient, reflective, willing to sit in silence",
        "visual_language": "poetic imagery when it reveals inner life",
        "genre_blend": "drama with sci-fi, romance, or family animation",
        "avoidance": "cruelty or formal precision without enough warmth",
    },
    "liked_patterns": [
        "quiet emotional stakes rather than plot machinery",
        "family memory and unresolved longing",
        "existential sci-fi grounded in human relationships",
        "animation that treats feelings with seriousness",
        "visual ambition connected to character interiority",
    ],
    "disliked_patterns": [
        "cruelty that overwhelms emotional meaning",
        "overly polished style that keeps you outside the feeling",
    ],
    "favorite_genres": ["Drama", "Romance", "Science Fiction", "Family", "Animation"],
    "favorite_directors": ["Edward Yang", "Charlotte Wells", "Denis Villeneuve", "Celine Song"],
    "favorite_eras": ["2000s", "2010s", "2020s"],
    "confidence": "high",
    "highlight_titles": ["Yi Yi", "Aftersun", "Arrival", "Past Lives", "Inside Out"],
}


def demo_snapshot_comment(movie: dict) -> str:
    if movie.get("disliked"):
        return f"{movie['title']} marks a useful negative signal: striking images are not enough when the emotional texture feels too cruel."
    if movie.get("user_rating", 0) >= 8.5:
        return f"{movie['title']} strengthens your preference for emotionally exact stories with memory, family, or existential longing at the center."
    return f"{movie['title']} adds nuance: you appreciate craft and visual style, but warmth and emotional access still matter."


def demo_summary_metadata() -> str:
    return json.dumps(
        {
            "highlight_titles": DEMO_PROFILE["highlight_titles"],
            "profile": DEMO_PROFILE,
            "demo_media_version": DEMO_MEDIA_VERSION,
        }
    )


def merge_movie_detail(item: dict, detail: dict | None) -> dict:
    if not detail:
        return item
    merged = {**item}
    for field in (
        "title",
        "poster",
        "backdrop",
        "tmdb_rating",
        "description",
        "release_year",
        "genres",
        "director",
    ):
        if detail.get(field):
            merged[field] = detail[field]
    return merged


async def enrich_demo_item(item: dict) -> dict:
    tmdb_id = item.get("tmdb_id")
    if not tmdb_id:
        return item
    try:
        detail = await get_movie_detail_by_id(tmdb_id)
    except Exception as exc:
        print(f"[demo] failed to refresh TMDB media for {item.get('title')}: {exc}")
        return item
    return merge_movie_detail(item, detail)


async def upsert_demo_summary(session: AsyncSession, user_id: int):
    result = await session.execute(select(TasteSummary).where(TasteSummary.user_id == user_id))
    summary = result.scalar_one_or_none()
    metadata = demo_summary_metadata()
    if summary:
        summary.summary = DEMO_PROFILE["summary"]
        summary.highlight_titles = metadata
    else:
        session.add(
            TasteSummary(
                user_id=user_id,
                summary=DEMO_PROFILE["summary"],
                highlight_titles=metadata,
            )
        )


def summary_has_current_demo_media(summary: TasteSummary | None) -> bool:
    if not summary or not summary.highlight_titles:
        return False
    try:
        metadata = json.loads(summary.highlight_titles)
    except json.JSONDecodeError:
        return False
    return metadata.get("demo_media_version") == DEMO_MEDIA_VERSION


def apply_media_fields(row, item: dict):
    row.title = item.get("title") or row.title
    row.poster = item.get("poster", row.poster) or ""
    row.backdrop = item.get("backdrop", row.backdrop) or ""
    row.tmdb_rating = item.get("tmdb_rating", row.tmdb_rating)
    row.description = item.get("description", row.description) or ""
    row.release_year = item.get("release_year", row.release_year)
    row.genres = item.get("genres", row.genres) or ""
    row.director = item.get("director", row.director) or ""


async def refresh_demo_media(session: AsyncSession, user_id: int):
    watched_by_id = {item["tmdb_id"]: item for item in DEMO_MOVIES}
    waiting_by_id = {item["tmdb_id"]: item for item in DEMO_WAITING}

    watched_rows = (
        await session.execute(
            select(WatchedMovie).where(
                WatchedMovie.user_id == user_id,
                WatchedMovie.tmdb_id.in_(list(watched_by_id.keys())),
            )
        )
    ).scalars()
    for movie in watched_rows:
        item = await enrich_demo_item(watched_by_id[movie.tmdb_id])
        apply_media_fields(movie, item)

    waiting_rows = (
        await session.execute(
            select(WaitingMovie).where(
                WaitingMovie.user_id == user_id,
                WaitingMovie.tmdb_id.in_(list(waiting_by_id.keys())),
            )
        )
    ).scalars()
    for movie in waiting_rows:
        item = await enrich_demo_item(waiting_by_id[movie.tmdb_id])
        apply_media_fields(movie, item)


async def ensure_demo_account(session: AsyncSession) -> User:
    if not DEMO_ENABLED:
        raise RuntimeError("Demo mode is not enabled")

    result = await session.execute(select(User).where(User.username == DEMO_USERNAME))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            username=DEMO_USERNAME,
            hashed_password=pwd_context.hash(secrets.token_urlsafe(32)),
        )
        session.add(user)
        await session.flush()

    watched_count = await session.scalar(
        select(func.count(WatchedMovie.id)).where(WatchedMovie.user_id == user.id)
    )
    if watched_count:
        result = await session.execute(select(TasteSummary).where(TasteSummary.user_id == user.id))
        summary = result.scalar_one_or_none()
        if not summary_has_current_demo_media(summary):
            await refresh_demo_media(session, user.id)
            await upsert_demo_summary(session, user.id)
            await session.commit()
        return user

    for item in DEMO_MOVIES:
        item = await enrich_demo_item(item)
        movie = WatchedMovie(
            user_id=user.id,
            title=item["title"],
            poster=item.get("poster", ""),
            backdrop=item.get("backdrop", ""),
            tmdb_rating=item.get("tmdb_rating"),
            user_rating=item.get("user_rating"),
            description=item.get("description", ""),
            liked=item.get("liked"),
            disliked=item.get("disliked", False),
            review=item.get("review", ""),
            moods=item.get("moods", ""),
            watch_date=item.get("watch_date"),
            tmdb_id=item.get("tmdb_id"),
            release_year=item.get("release_year"),
            genres=item.get("genres", ""),
            director=item.get("director", ""),
        )
        session.add(movie)
        await session.flush()
        session.add(
            TasteSnapshot(
                user_id=user.id,
                movie_id=movie.id,
                movie_title=movie.title,
                action_type="review",
                mood_tag=movie.moods,
                gpt_comment=demo_snapshot_comment(item),
            )
        )

    for item in DEMO_WAITING:
        item = await enrich_demo_item(item)
        session.add(
            WaitingMovie(
                user_id=user.id,
                title=item["title"],
                poster=item.get("poster", ""),
                backdrop=item.get("backdrop", ""),
                tmdb_rating=item.get("tmdb_rating"),
                description=item.get("description", ""),
                added_date=item.get("added_date"),
                tmdb_id=item.get("tmdb_id"),
                release_year=item.get("release_year"),
                genres=item.get("genres", ""),
                director=item.get("director", ""),
            )
        )

    await upsert_demo_summary(session, user.id)
    await session.commit()
    return user
