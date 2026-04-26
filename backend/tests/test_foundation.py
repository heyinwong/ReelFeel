import unittest

import config
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from config import (
    DEMO_ACCESS_CODE,
    DEMO_ENABLED,
    DEMO_USERNAME,
    OPENAI_MODEL_CHEAP,
    OPENAI_MODEL_STANDARD,
    parse_cors_origins,
    resolve_database_url,
    validate_production_config,
)
from database import async_session
from main import app
from models import TasteSummary, User, WatchedMovie
from services import recommendation_service
from services.demo_service import DEMO_MEDIA_VERSION, ensure_demo_account, merge_movie_detail
from services.openai_service import estimate_cost_usd, get_model, parse_json_payload
from services.taste_service import fallback_profile_from_snapshots, parse_summary_metadata
from services.tmdb_service import genre_id_for_term, normalize_title


class FoundationTests(unittest.IsolatedAsyncioTestCase):
    def test_model_routing_uses_low_cost_defaults(self):
        self.assertEqual(get_model("cheap"), OPENAI_MODEL_CHEAP)
        self.assertEqual(get_model("standard"), OPENAI_MODEL_STANDARD)
        self.assertNotIn("pro", get_model("cheap"))
        self.assertNotIn("pro", get_model("standard"))

    def test_usage_cost_estimate_uses_tier_pricing(self):
        cheap_cost = estimate_cost_usd("cheap", 1000, 1000)
        standard_cost = estimate_cost_usd("standard", 1000, 1000)
        self.assertLess(cheap_cost, standard_cost)
        self.assertGreater(standard_cost, 0)

    def test_relative_sqlite_url_resolves_under_backend(self):
        resolved = resolve_database_url("sqlite+aiosqlite:///./app.db")
        self.assertTrue(resolved.endswith("/backend/app.db"))

    def test_postgres_url_resolves_to_asyncpg_driver(self):
        resolved = resolve_database_url(
            "postgresql://user:pass@example.neon.tech/db?sslmode=require&channel_binding=require"
        )
        self.assertEqual(
            resolved,
            "postgresql+asyncpg://user:pass@example.neon.tech/db?ssl=require",
        )

    def test_legacy_postgres_scheme_resolves_to_asyncpg_driver(self):
        resolved = resolve_database_url("postgres://user:pass@example.com/db")
        self.assertEqual(resolved, "postgresql+asyncpg://user:pass@example.com/db")

    def test_cors_origins_parse_comma_separated_values(self):
        origins = parse_cors_origins("https://app.example.com, http://localhost:5173,")
        self.assertEqual(origins, ["https://app.example.com", "http://localhost:5173"])

    def test_health_endpoint_returns_ok(self):
        with TestClient(app) as client:
            response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_production_config_rejects_unsafe_defaults(self):
        original = {
            "APP_ENV": config.APP_ENV,
            "OPENAI_API_KEY": config.OPENAI_API_KEY,
            "TMDB_API_KEY": config.TMDB_API_KEY,
            "MOVIE_PASS_KEY": config.MOVIE_PASS_KEY,
            "DEMO_ACCESS_CODE": config.DEMO_ACCESS_CODE,
        }
        config.APP_ENV = "production"
        config.OPENAI_API_KEY = None
        config.TMDB_API_KEY = None
        config.MOVIE_PASS_KEY = "dev-only-change-me"
        config.DEMO_ACCESS_CODE = "local-demo-code"
        try:
            with self.assertRaises(RuntimeError) as exc:
                validate_production_config()
        finally:
            for key, value in original.items():
                setattr(config, key, value)
        self.assertIn("OPENAI_API_KEY", str(exc.exception))
        self.assertIn("DEMO_ACCESS_CODE", str(exc.exception))

    def test_title_normalization_for_duplicate_filtering(self):
        self.assertEqual(normalize_title("Amélie! (2001)"), "amélie 2001")

    def test_genre_terms_map_to_tmdb_discover_ids(self):
        self.assertEqual(genre_id_for_term("Romantic Drama"), 18)
        self.assertEqual(genre_id_for_term("sci-fi"), 878)

    def test_json_payload_parser_accepts_fenced_json(self):
        payload = parse_json_payload('```json\n{"summary":"ok"}\n```', fallback={})
        self.assertEqual(payload, {"summary": "ok"})

    def test_json_payload_parser_extracts_embedded_object(self):
        payload = parse_json_payload('Here is the profile: {"confidence":"low"}', fallback={})
        self.assertEqual(payload, {"confidence": "low"})

    def test_taste_summary_accepts_legacy_highlight_list(self):
        record = TasteSummary(
            user_id=1,
            summary="You like quiet, reflective dramas.",
            highlight_titles='["Yi Yi", "Drive My Car"]',
        )
        highlights, profile = parse_summary_metadata(record)
        self.assertEqual(highlights, ["Yi Yi", "Drive My Car"])
        self.assertEqual(profile["summary"], "You like quiet, reflective dramas.")

    def test_taste_summary_accepts_structured_profile_metadata(self):
        record = TasteSummary(
            user_id=1,
            summary="You like patient, emotional films.",
            highlight_titles=(
                '{"highlight_titles":["Her"],'
                '"profile":{"summary":"You like patient, emotional films.",'
                '"favorite_genres":["Drama"],"confidence":"medium"}}'
            ),
        )
        highlights, profile = parse_summary_metadata(record)
        self.assertEqual(highlights, ["Her"])
        self.assertEqual(profile["favorite_genres"], ["Drama"])
        self.assertEqual(profile["confidence"], "medium")

    def test_snapshot_fallback_profile_is_not_empty(self):
        class Snapshot:
            action_type = "review"
            movie_title = "Yi Yi"
            gpt_comment = "You respond to patient family dramas."

        profile = fallback_profile_from_snapshots([Snapshot()], 1)
        self.assertIn("Yi Yi", profile["summary"])
        self.assertEqual(profile["highlight_titles"], ["Yi Yi"])
        self.assertEqual(profile["confidence"], "low")

    async def test_rerank_falls_back_without_external_llm_json(self):
        original_chat_json = recommendation_service.chat_json

        async def fake_chat_json(*args, **kwargs):
            return []

        recommendation_service.chat_json = fake_chat_json
        try:
            movies = [
                {"title": "A", "description": "one", "tmdb_id": 1},
                {"title": "B", "description": "two", "tmdb_id": 2},
                {"title": "C", "description": "three", "tmdb_id": 3},
            ]
            ranked = await recommendation_service.rerank_candidates(
                "melancholy", {"confidence": "low"}, movies, user_id=1
            )
        finally:
            recommendation_service.chat_json = original_chat_json

        self.assertEqual([movie["title"] for movie in ranked], ["A", "B", "C"])
        self.assertTrue(all("reason" in movie for movie in ranked))

    def test_guest_mood_terms_fall_back_to_discoverable_genres(self):
        terms = recommendation_service.guest_search_terms("quiet emotional family drama")
        self.assertIn("drama", terms)
        self.assertIn("family", terms)
        self.assertLess(terms.index("family"), terms.index("drama"))

    def test_demo_login_rejects_invalid_code(self):
        if not DEMO_ENABLED:
            self.skipTest("Demo mode disabled")
        with TestClient(app) as client:
            response = client.post("/demo-login", json={"code": "bad-code"})
        self.assertEqual(response.status_code, 401)

    def test_demo_login_returns_token_for_valid_code(self):
        if not DEMO_ENABLED:
            self.skipTest("Demo mode disabled")
        with TestClient(app) as client:
            response = client.post("/demo-login", json={"code": DEMO_ACCESS_CODE})
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())

    def test_demo_user_is_read_only(self):
        if not DEMO_ENABLED:
            self.skipTest("Demo mode disabled")
        with TestClient(app) as client:
            login = client.post("/demo-login", json={"code": DEMO_ACCESS_CODE})
            token = login.json()["access_token"]
            response = client.post(
                "/waiting",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "title": "Demo Mutation",
                    "tmdb_id": 999999001,
                    "description": "Should not be added.",
                },
            )
        self.assertEqual(response.status_code, 403)
        self.assertIn("read-only", response.json()["detail"])

    def test_demo_media_refresh_prefers_tmdb_detail_images(self):
        original = {
            "title": "Drive My Car",
            "poster": "https://image.tmdb.org/t/p/w500/old.jpg",
            "backdrop": "https://image.tmdb.org/t/p/w780/old.jpg",
            "review": "Keep demo-specific review text.",
        }
        detail = {
            "title": "Drive My Car",
            "poster": "https://image.tmdb.org/t/p/w500/new.jpg",
            "backdrop": "https://image.tmdb.org/t/p/w780/new.jpg",
            "description": "TMDB overview.",
        }
        merged = merge_movie_detail(original, detail)
        self.assertEqual(merged["poster"], detail["poster"])
        self.assertEqual(merged["backdrop"], detail["backdrop"])
        self.assertEqual(merged["review"], original["review"])

    async def test_demo_seed_is_idempotent(self):
        if not DEMO_ENABLED:
            self.skipTest("Demo mode disabled")
        async with async_session() as session:
            user = await ensure_demo_account(session)
            first_count = await session.scalar(
                select(func.count(WatchedMovie.id)).where(WatchedMovie.user_id == user.id)
            )
            await ensure_demo_account(session)
            result = await session.execute(select(User).where(User.username == DEMO_USERNAME))
            same_user = result.scalar_one()
            second_count = await session.scalar(
                select(func.count(WatchedMovie.id)).where(WatchedMovie.user_id == same_user.id)
            )
            summary = await session.scalar(
                select(TasteSummary).where(TasteSummary.user_id == same_user.id)
            )
        self.assertEqual(first_count, second_count)
        self.assertGreaterEqual(second_count, 12)
        self.assertIn(DEMO_MEDIA_VERSION, summary.highlight_titles)


if __name__ == "__main__":
    unittest.main()
