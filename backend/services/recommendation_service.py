from sqlalchemy.ext.asyncio import AsyncSession

from models import TasteSummary, User
from repositories.movies import get_user_title_sets
from services.openai_service import chat_json
from services.taste_service import parse_summary_metadata
from services.tmdb_service import GENRE_IDS, candidate_pool, normalize_title, search_full_movies


def normalize_rows(rows):
    titles = {normalize_title(row[0]) for row in rows if row[0]}
    tmdb_ids = {row[1] for row in rows if row[1]}
    return titles, tmdb_ids


def profile_terms(profile: dict, mood: str):
    terms = [mood]
    for key in ("favorite_genres", "favorite_directors", "favorite_eras"):
        terms.extend(profile.get(key) or [])
    terms.extend((profile.get("liked_patterns") or [])[:3])
    return [term for term in terms if term][:8]


async def guest_recommendations(mood: str):
    movies = await search_full_movies(mood, limit=3)
    if not movies:
        movies = (await candidate_pool(guest_search_terms(mood), set(), set()))[:3]
    for movie in movies:
        movie["reason"] = ""
        movie["taste_match_tags"] = []
        movie["confidence"] = "low"
    return movies


def guest_search_terms(mood: str):
    normalized = normalize_title(mood)
    terms = []
    for genre in GENRE_IDS:
        if genre in normalized:
            terms.append(genre)

    mood_map = {
        "quiet": "drama",
        "emotional": "drama",
        "heartwarming": "family",
        "family": "family",
        "funny": "comedy",
        "laugh": "comedy",
        "romantic": "romance",
        "love": "romance",
        "scary": "horror",
        "tense": "thriller",
        "dark": "thriller",
        "dreamy": "fantasy",
        "space": "science fiction",
    }
    for keyword, term in mood_map.items():
        if keyword in normalized:
            terms.append(term)

    priority = {
        "family": 0,
        "romance": 1,
        "comedy": 2,
        "science fiction": 3,
        "fantasy": 4,
        "horror": 5,
        "thriller": 6,
        "drama": 9,
    }
    genre_terms = sorted(
        set(terms),
        key=lambda term: (priority.get(term, 5), term),
    )
    clean = []
    for term in [*genre_terms, "drama"]:
        if term and term not in clean:
            clean.append(term)
    return clean[:5]


async def build_search_terms(mood: str, profile: dict, user_id: int):
    fallback = profile_terms(profile, mood)
    prompt = (
        "Return only JSON with key search_terms, an array of 5 short TMDB search phrases. "
        "Use the user request and taste profile. Prefer concrete genres, directors, eras, themes, or title-like phrases. "
        "Do not include explanations.\n\n"
        f"User request: {mood}\nTaste profile: {profile}"
    )
    parsed = await chat_json(
        [{"role": "user", "content": prompt}],
        tier="cheap",
        temperature=0.35,
        max_tokens=180,
        fallback={"search_terms": fallback},
        task="recommend_search_terms",
        user_id=user_id,
    )
    terms = parsed.get("search_terms") if isinstance(parsed, dict) else None
    if not isinstance(terms, list) or not terms:
        terms = fallback
    clean = []
    for term in terms:
        text = str(term).strip()
        if text and text not in clean:
            clean.append(text)
    return clean[:8] or [mood]


async def rerank_candidates(mood: str, profile: dict, candidates: list[dict], user_id: int):
    compact_candidates = [
        {
            "title": movie.get("title"),
            "year": movie.get("release_year"),
            "genres": movie.get("genres"),
            "director": movie.get("director"),
            "tmdb_rating": movie.get("tmdb_rating"),
            "description": (movie.get("description") or "")[:280],
        }
        for movie in candidates
    ]
    prompt = (
        "Choose the best 3 recommendations from the candidate movies. "
        "Return only valid JSON array. Each item must include title, reason, taste_match_tags, confidence. "
        "confidence must be low, medium, or high. reason must be one sentence under 28 words. "
        "taste_match_tags must have 1-4 short tags. Do not invent titles outside candidates.\n\n"
        f"User request: {mood}\nTaste profile: {profile}\nCandidates: {compact_candidates}"
    )
    parsed = await chat_json(
        [{"role": "user", "content": prompt}],
        tier="standard",
        temperature=0.35,
        max_tokens=520,
        fallback=[],
        task="recommend_rerank",
        user_id=user_id,
    )
    if not isinstance(parsed, list):
        parsed = []

    by_title = {normalize_title(movie.get("title", "")): movie for movie in candidates}
    ranked = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        movie = by_title.get(normalize_title(item.get("title", "")))
        if not movie:
            continue
        enriched = dict(movie)
        enriched["reason"] = item.get("reason", "")
        tags = item.get("taste_match_tags", [])
        enriched["taste_match_tags"] = tags if isinstance(tags, list) else []
        enriched["confidence"] = item.get("confidence", profile.get("confidence") or "low")
        ranked.append(enriched)
        if len(ranked) >= 3:
            break

    if ranked:
        return ranked

    fallback = []
    for movie in candidates[:3]:
        enriched = dict(movie)
        enriched["reason"] = "This lines up with your current mood and viewing patterns."
        enriched["taste_match_tags"] = []
        enriched["confidence"] = profile.get("confidence") or "low"
        fallback.append(enriched)
    return fallback


async def personalized_recommendations(session: AsyncSession, user: User, mood: str):
    watched_rows, waiting_rows = await get_user_title_sets(session, user.id)
    watched_titles, watched_ids = normalize_rows(watched_rows)
    waiting_titles, waiting_ids = normalize_rows(waiting_rows)
    excluded_titles = watched_titles.union(waiting_titles)
    excluded_ids = watched_ids.union(waiting_ids)

    summary = await session.get(TasteSummary, user.id)
    _, profile = parse_summary_metadata(summary)
    if not profile.get("summary"):
        profile["summary"] = "The user has not built a detailed taste profile yet."

    terms = await build_search_terms(mood, profile, user.id)
    candidates = await candidate_pool(terms, excluded_ids, excluded_titles)
    if not candidates:
        fallback_terms = profile_terms(profile, mood)
        if fallback_terms != terms:
            candidates = await candidate_pool(fallback_terms, excluded_ids, excluded_titles)
    if not candidates:
        return await guest_recommendations(mood)
    return await rerank_candidates(mood, profile, candidates, user.id)


async def recommend(session: AsyncSession, mood: str, user: User | None):
    if user is None:
        return await guest_recommendations(mood)
    return await personalized_recommendations(session, user, mood)
