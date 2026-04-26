import json
from collections import Counter
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from config import SUMMARY_SNAPSHOT_LIMIT
from models import TasteSummary, WatchedMovie
from repositories import taste as taste_repo
from repositories.movies import normalize_moods
from schemas import TasteProfile
from services.openai_service import chat_json, chat_text

DEFAULT_PROFILE = TasteProfile().model_dump()


def confidence_for_count(count: int):
    if count >= 12:
        return "high"
    if count >= 4:
        return "medium"
    return "low"


def parse_summary_metadata(record: TasteSummary | None):
    if not record:
        return [], DEFAULT_PROFILE.copy()
    if not record.highlight_titles:
        profile = DEFAULT_PROFILE.copy()
        profile["summary"] = record.summary or ""
        return [], profile

    try:
        data = json.loads(record.highlight_titles)
    except Exception:
        profile = DEFAULT_PROFILE.copy()
        profile["summary"] = record.summary or ""
        return [], profile

    if isinstance(data, list):
        profile = DEFAULT_PROFILE.copy()
        profile["summary"] = record.summary or ""
        profile["highlight_titles"] = data
        return data, profile

    highlights = data.get("highlight_titles", [])
    profile = TasteProfile.from_any(data.get("profile", {})).model_dump()
    profile["summary"] = record.summary or profile.get("summary", "")
    profile["highlight_titles"] = highlights
    return highlights, profile


def movie_fact_line(movie: WatchedMovie) -> str:
    liked_state = "liked" if movie.liked else "disliked" if movie.disliked else "neutral"
    return (
        f"{movie.title} ({movie.release_year or 'unknown year'}): "
        f"rating={movie.user_rating}, reaction={liked_state}, "
        f"moods={movie.moods or 'none'}, genres={movie.genres or 'unknown'}, "
        f"director={movie.director or 'unknown'}, review={movie.review or 'none'}"
    )


def derive_profile_from_movies(movies: list[WatchedMovie], summary: str = ""):
    genres = Counter()
    directors = Counter()
    eras = Counter()
    liked_patterns = []
    disliked_patterns = []

    for movie in movies:
        if movie.genres:
            for genre in [g.strip() for g in movie.genres.split(",") if g.strip()]:
                genres[genre] += 1
        if movie.director:
            directors[movie.director] += 1
        if movie.release_year:
            decade = f"{movie.release_year // 10 * 10}s"
            eras[decade] += 1
        if movie.user_rating and movie.user_rating >= 8:
            liked_patterns.append(f"High affinity for {movie.title}")
        if movie.user_rating and movie.user_rating <= 4:
            disliked_patterns.append(f"Low affinity for {movie.title}")
        if movie.disliked:
            disliked_patterns.append(f"Explicit dislike for {movie.title}")

    return {
        **DEFAULT_PROFILE,
        "summary": summary,
        "favorite_genres": [name for name, _ in genres.most_common(5)],
        "favorite_directors": [name for name, _ in directors.most_common(5)],
        "favorite_eras": [name for name, _ in eras.most_common(4)],
        "liked_patterns": liked_patterns[:6],
        "disliked_patterns": disliked_patterns[:6],
        "confidence": confidence_for_count(len(movies)),
    }


def fallback_profile_from_snapshots(snapshots: list[Any], count: int):
    movie_snapshots = [snap for snap in snapshots if snap.action_type != "correction"]
    titles = []
    comments = []

    for snap in movie_snapshots[-6:]:
        if snap.movie_title and snap.movie_title not in titles:
            titles.append(snap.movie_title)
        if snap.gpt_comment:
            comments.append(snap.gpt_comment.strip())

    if not movie_snapshots:
        return {**DEFAULT_PROFILE, "confidence": confidence_for_count(count)}

    title_text = ", ".join(titles[:3])
    leading_signal = comments[0] if comments else "Your early logs are starting to form a taste pattern."
    summary = (
        f"Your taste profile is still early, but {title_text or 'your first logs'} "
        f"already gives a low-confidence signal: {leading_signal}"
    )

    return {
        **DEFAULT_PROFILE,
        "summary": summary,
        "preference_axes": {
            "early_signal": leading_signal[:160],
        },
        "liked_patterns": comments[:4],
        "confidence": confidence_for_count(count),
        "highlight_titles": titles[:6],
    }


async def generate_snapshot_comment(movie: WatchedMovie):
    liked_state = "liked" if movie.liked else "disliked" if movie.disliked else "not explicitly liked"
    prompt = (
        "Analyze one movie log and return one concise second-person taste observation. "
        "Use the user's 10-point rating correctly: 8-10 is strong affinity, 5-7 is mixed/neutral, 1-4 is low affinity. "
        "Do not overpraise disliked or low-rated movies.\n\n"
        f"Movie log: {movie_fact_line(movie)}. Explicit reaction: {liked_state}."
    )
    try:
        return await chat_text(
            [{"role": "user", "content": prompt}],
            tier="cheap",
            temperature=0.4,
            max_tokens=160,
            task="snapshot_comment",
            user_id=movie.user_id,
        )
    except Exception as exc:
        print("Error generating snapshot comment:", exc)
        return "You watched a movie, but we could not interpret your reaction clearly."


async def regenerate_taste_summary(session: AsyncSession, user_id: int):
    snapshots = await taste_repo.list_snapshots(session, user_id)
    movies_result = [
        snapshot for snapshot in snapshots if snapshot.action_type != "correction"
    ]

    if not snapshots:
        await taste_repo.upsert_summary(
            session,
            user_id,
            "",
            DEFAULT_PROFILE.copy(),
            [],
        )
        await session.commit()
        return DEFAULT_PROFILE.copy()

    recent = snapshots[-SUMMARY_SNAPSHOT_LIMIT:]
    snapshot_lines = "\n".join(
        f"- {snap.movie_title or 'Direct feedback'} [{snap.action_type}]: {snap.gpt_comment}"
        for snap in recent
        if snap.gpt_comment
    )
    correction_lines = "\n".join(
        f"- {snap.gpt_comment}"
        for snap in snapshots
        if snap.action_type == "correction" and snap.gpt_comment
    )
    count = len(movies_result)
    prompt = (
        "Build a compact JSON taste profile for a movie recommendation app. "
        "Return only valid JSON with keys: summary, preference_axes, liked_patterns, disliked_patterns, "
        "favorite_genres, favorite_directors, favorite_eras, confidence, highlight_titles. "
        "preference_axes must be an object with short string values. confidence must be low, medium, or high. "
        "Keep all arrays to 6 items or fewer. Use second person in summary.\n\n"
        f"Confidence hint from movie-log count: {confidence_for_count(count)}.\n"
        f"Direct user corrections:\n{correction_lines or '- none'}\n\n"
        f"Recent taste observations:\n{snapshot_lines or '- none'}"
    )
    fallback_profile = fallback_profile_from_snapshots(snapshots, count)
    try:
        parsed = await chat_json(
            [{"role": "user", "content": prompt}],
            tier="standard",
            temperature=0.35,
            max_tokens=650,
            fallback=fallback_profile,
            task="taste_summary",
            user_id=user_id,
        )
        profile = TasteProfile.from_any(parsed).model_dump()
    except Exception as exc:
        print("Error during summary generation:", exc)
        profile = fallback_profile

    if not profile.get("summary"):
        profile["summary"] = fallback_profile.get("summary", "")
    if not profile.get("highlight_titles"):
        profile["highlight_titles"] = fallback_profile.get("highlight_titles", [])
    if not profile.get("confidence"):
        profile["confidence"] = fallback_profile.get("confidence", confidence_for_count(count))

    summary_text = profile.get("summary", "")
    highlight_titles = profile.get("highlight_titles") or []
    await taste_repo.upsert_summary(session, user_id, summary_text, profile, highlight_titles)
    await session.commit()
    return profile


async def get_taste_summary_payload(session: AsyncSession, user_id: int):
    record = await taste_repo.get_summary(session, user_id)
    highlight_titles, profile = parse_summary_metadata(record)
    return {
        "summary": record.summary if record else "",
        "highlight_titles": highlight_titles,
        "profile": profile,
    }


async def process_taste_modeling(session: AsyncSession, user_id: int, movie: WatchedMovie):
    comment = await generate_snapshot_comment(movie)
    await taste_repo.add_snapshot(
        session,
        user_id=user_id,
        movie_id=movie.id,
        movie_title=movie.title,
        action_type="review",
        mood_tag=movie.moods,
        gpt_comment=comment,
    )
    return await regenerate_taste_summary(session, user_id)


async def add_correction(session: AsyncSession, user_id: int, feedback: str):
    await taste_repo.add_snapshot(
        session,
        user_id=user_id,
        movie_id=None,
        movie_title=None,
        action_type="correction",
        mood_tag=None,
        gpt_comment=feedback,
    )
    return await regenerate_taste_summary(session, user_id)


def normalize_review_payload(payload: dict[str, Any]):
    normalized = dict(payload)
    normalized["moods"] = normalize_moods(normalized.get("moods"))
    return normalized
