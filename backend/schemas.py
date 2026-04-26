from datetime import date
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class MoodInput(BaseModel):
    mood: str
    mode: Optional[str] = None


class AddMovieInput(BaseModel):
    title: str
    poster: str = ""
    backdrop: str = ""
    tmdb_rating: float | None = None
    description: str = ""
    release_year: int | None = None
    genres: str | None = ""
    director: str | None = ""
    tmdb_id: int
    disliked: bool | None = False


class ReviewInput(BaseModel):
    id: int | None = None
    tmdb_id: int | None = None
    title: str | None = None
    user_rating: float | None = None
    liked: bool | int | None = None
    disliked: bool | None = None
    review: str | None = None
    moods: list[str] | str | None = None
    watch_date: date | str | None = None
    fromWaiting: bool = False


class UpdateSummaryInput(BaseModel):
    feedback: str


class MovieInfo(BaseModel):
    title: str
    description: str = ""
    poster: str = ""
    backdrop: str = ""
    tmdb_rating: float | str | None = None
    tmdb_id: int | None = None
    release_year: int | None = None
    genres: str = ""
    director: str | None = ""
    reason: str = ""
    taste_match_tags: list[str] = Field(default_factory=list)
    confidence: Literal["low", "medium", "high"] = "low"


class RecommendationResponse(BaseModel):
    recommendations: list[MovieInfo]


class TasteProfile(BaseModel):
    summary: str = ""
    preference_axes: dict[str, str] = Field(default_factory=dict)
    liked_patterns: list[str] = Field(default_factory=list)
    disliked_patterns: list[str] = Field(default_factory=list)
    favorite_genres: list[str] = Field(default_factory=list)
    favorite_directors: list[str] = Field(default_factory=list)
    favorite_eras: list[str] = Field(default_factory=list)
    confidence: Literal["low", "medium", "high"] = "low"
    highlight_titles: list[str] = Field(default_factory=list)

    @classmethod
    def from_any(cls, value: Any) -> "TasteProfile":
        if isinstance(value, dict):
            return cls(**{k: v for k, v in value.items() if k in cls.model_fields})
        return cls()
