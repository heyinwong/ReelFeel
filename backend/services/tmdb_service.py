import asyncio
import os
import re
from typing import Any

import httpx
from fastapi import HTTPException

from config import RECOMMENDATION_CANDIDATE_LIMIT, TMDB_API_KEY

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p"
GENRE_IDS = {
    "action": 28,
    "adventure": 12,
    "animation": 16,
    "comedy": 35,
    "crime": 80,
    "documentary": 99,
    "drama": 18,
    "family": 10751,
    "fantasy": 14,
    "history": 36,
    "horror": 27,
    "music": 10402,
    "mystery": 9648,
    "romance": 10749,
    "science fiction": 878,
    "scifi": 878,
    "sci-fi": 878,
    "thriller": 53,
    "war": 10752,
    "western": 37,
}


def parse_title_and_year(raw_title: str):
    match = re.match(r"(.+)\s+\((\d{4})\)", raw_title)
    if match:
        return match.group(1).strip(), int(match.group(2))
    return raw_title.strip(), None


def normalize_title(title: str):
    return re.sub(r"[^\w\s]", "", title.lower().strip())


def genre_id_for_term(term: str):
    normalized = normalize_title(term)
    if normalized in GENRE_IDS:
        return GENRE_IDS[normalized]
    for name, genre_id in GENRE_IDS.items():
        if name in normalized:
            return genre_id
    return None


def require_api_key() -> str:
    api_key = TMDB_API_KEY or os.getenv("TMDB_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TMDB_API_KEY is not configured")
    return api_key


def movie_payload(detail: dict[str, Any], credits: dict[str, Any] | None = None):
    director = None
    if credits:
        director = next(
            (c["name"] for c in credits.get("crew", []) if c.get("job") == "Director"),
            None,
        )
    release_date = detail.get("release_date") or ""
    return {
        "title": detail.get("title") or detail.get("name") or "",
        "description": detail.get("overview", ""),
        "poster": f"{IMAGE_BASE}/w500{detail.get('poster_path')}" if detail.get("poster_path") else "",
        "backdrop": f"{IMAGE_BASE}/w780{detail.get('backdrop_path')}" if detail.get("backdrop_path") else "",
        "tmdb_rating": detail.get("vote_average"),
        "tmdb_id": detail.get("id"),
        "release_year": int(release_date[:4]) if release_date[:4].isdigit() else None,
        "genres": ", ".join([g["name"] for g in detail.get("genres", [])]) if detail.get("genres") else "",
        "director": director or "",
    }


async def get_movie_detail_by_id(tmdb_id: int):
    api_key = require_api_key()
    async with httpx.AsyncClient(timeout=15) as client:
        detail_resp = await client.get(f"{BASE_URL}/movie/{tmdb_id}", params={"api_key": api_key})
        if detail_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="TMDB API detail error")
        credit_resp = await client.get(f"{BASE_URL}/movie/{tmdb_id}/credits", params={"api_key": api_key})
        if credit_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="TMDB API credit error")
    return movie_payload(detail_resp.json(), credit_resp.json())


async def search_movies_raw(query: str, *, year_hint: int | None = None, page: int = 1):
    api_key = require_api_key()
    params: dict[str, Any] = {
        "api_key": api_key,
        "query": query,
        "language": "en-US",
        "include_adult": False,
        "page": page,
    }
    if year_hint:
        params["year"] = year_hint
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(f"{BASE_URL}/search/movie", params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="TMDB API search error")
    return response.json().get("results", [])


async def discover_movies_raw(*, genre_id: int | None = None, page: int = 1):
    api_key = require_api_key()
    params: dict[str, Any] = {
        "api_key": api_key,
        "language": "en-US",
        "include_adult": False,
        "include_video": False,
        "page": page,
        "sort_by": "vote_count.desc",
        "vote_count.gte": 80,
    }
    if genre_id:
        params["with_genres"] = genre_id
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(f"{BASE_URL}/discover/movie", params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="TMDB API discover error")
    return response.json().get("results", [])


async def fetch_movie_info(title: str, year_hint: int | None = None):
    candidates = await search_movies_raw(title, year_hint=year_hint)
    if not candidates:
        return {
            "title": title,
            "description": "Not found",
            "poster": "",
            "backdrop": "",
            "tmdb_rating": None,
            "tmdb_id": None,
            "release_year": None,
            "genres": "",
            "director": "",
        }

    filtered = []
    for movie in candidates:
        release_date = movie.get("release_date") or ""
        year = int(release_date[:4]) if release_date[:4].isdigit() else 0
        if year_hint and abs(year - year_hint) > 5:
            continue
        if not movie.get("poster_path") or movie.get("vote_count", 0) < 10:
            continue
        filtered.append(movie)

    best = sorted(
        filtered or candidates,
        key=lambda item: (item.get("vote_count", 0), item.get("popularity", 0)),
        reverse=True,
    )[0]
    return await get_movie_detail_by_id(best["id"])


async def search_suggestions(query: str):
    results = (await search_movies_raw(query))[:5]
    suggestions = []
    for movie in results:
        movie_id = movie.get("id")
        title = movie.get("title")
        poster_path = movie.get("poster_path")
        if not title or not movie_id:
            continue
        suggestions.append({
            "id": movie_id,
            "title": title,
            "poster": f"{IMAGE_BASE}/w500{poster_path}" if poster_path else "",
        })
    return suggestions


async def search_full_movies(query: str, limit: int = 3):
    results = (await search_movies_raw(query))[:limit]
    full_infos = []
    for movie in results:
        title = movie.get("title")
        release_date = movie.get("release_date", "")
        year_hint = int(release_date[:4]) if release_date[:4].isdigit() else None
        if not title:
            continue
        try:
            full_infos.append(await fetch_movie_info(title, year_hint=year_hint))
        except Exception as exc:
            print(f"[search] failed to fetch detail for {title}: {exc}")
    return full_infos


async def candidate_pool(search_terms: list[str], exclude_tmdb_ids: set[int], exclude_titles: set[str]):
    seen_ids = set(exclude_tmdb_ids)
    ids_to_fetch = []
    for term in search_terms:
        if len(ids_to_fetch) >= RECOMMENDATION_CANDIDATE_LIMIT:
            break
        try:
            genre_id = genre_id_for_term(term)
            raw_results = (
                await discover_movies_raw(genre_id=genre_id)
                if genre_id
                else await search_movies_raw(term)
            )
        except Exception as exc:
            print(f"[recommend] TMDB candidate query failed for {term}: {exc}")
            continue
        for movie in raw_results:
            tmdb_id = movie.get("id")
            title = movie.get("title") or ""
            if not tmdb_id or tmdb_id in seen_ids or normalize_title(title) in exclude_titles:
                continue
            if not movie.get("poster_path") or movie.get("vote_count", 0) < 10:
                continue
            seen_ids.add(tmdb_id)
            ids_to_fetch.append(tmdb_id)
            if len(ids_to_fetch) >= RECOMMENDATION_CANDIDATE_LIMIT:
                break

    async def fetch_with_limit(tmdb_id: int):
        async with semaphore:
            try:
                return await get_movie_detail_by_id(tmdb_id)
            except Exception as exc:
                print(f"[recommend] TMDB detail failed for {tmdb_id}: {exc}")
                return None

    semaphore = asyncio.Semaphore(5)
    details = await asyncio.gather(*(fetch_with_limit(tmdb_id) for tmdb_id in ids_to_fetch))
    return [movie for movie in details if movie]
