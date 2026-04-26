from pathlib import Path
import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
ENV_PATH = BACKEND_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH, override=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{BACKEND_DIR / 'app.db'}",
)
APP_ENV = os.getenv("APP_ENV", "development").lower()
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5174",
)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
MOVIE_PASS_KEY = os.getenv("MOVIE_PASS_KEY", "dev-only-change-me")
DEMO_ENABLED = os.getenv("DEMO_ENABLED", "true").lower() != "false"
DEMO_USERNAME = os.getenv("DEMO_USERNAME", "reelfeel_demo")
DEMO_ACCESS_CODE = os.getenv("DEMO_ACCESS_CODE", "local-demo-code")

OPENAI_MODEL_CHEAP = os.getenv("OPENAI_MODEL_CHEAP", "gpt-4.1-nano")
OPENAI_MODEL_STANDARD = os.getenv("OPENAI_MODEL_STANDARD", "gpt-4.1-mini")

OPENAI_MAX_TOKENS_CHEAP = int(os.getenv("OPENAI_MAX_TOKENS_CHEAP", "220"))
OPENAI_MAX_TOKENS_STANDARD = int(os.getenv("OPENAI_MAX_TOKENS_STANDARD", "700"))
SUMMARY_SNAPSHOT_LIMIT = int(os.getenv("SUMMARY_SNAPSHOT_LIMIT", "18"))
RECOMMENDATION_CANDIDATE_LIMIT = int(os.getenv("RECOMMENDATION_CANDIDATE_LIMIT", "15"))

AI_USAGE_LOGGING = os.getenv("AI_USAGE_LOGGING", "true").lower() != "false"
OPENAI_CHEAP_INPUT_COST_PER_1M = float(os.getenv("OPENAI_CHEAP_INPUT_COST_PER_1M", "0.10"))
OPENAI_CHEAP_OUTPUT_COST_PER_1M = float(os.getenv("OPENAI_CHEAP_OUTPUT_COST_PER_1M", "0.40"))
OPENAI_STANDARD_INPUT_COST_PER_1M = float(os.getenv("OPENAI_STANDARD_INPUT_COST_PER_1M", "0.40"))
OPENAI_STANDARD_OUTPUT_COST_PER_1M = float(os.getenv("OPENAI_STANDARD_OUTPUT_COST_PER_1M", "1.60"))


def parse_cors_origins(raw_origins: str | None = None) -> list[str]:
    origins = raw_origins if raw_origins is not None else CORS_ORIGINS
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


def resolve_database_url(raw_url: str | None = None) -> str:
    url = raw_url or DATABASE_URL
    for prefix in ("sqlite+aiosqlite:///", "sqlite:///"):
        if url.startswith(prefix):
            db_path = url.removeprefix(prefix)
            if db_path.startswith("./"):
                return f"{prefix}{BACKEND_DIR / db_path.removeprefix('./')}"

    if url.startswith(("postgresql://", "postgres://")):
        parsed = urlsplit(url)
        query_items = []
        for key, value in parse_qsl(parsed.query, keep_blank_values=True):
            if key == "sslmode":
                if value and value != "disable":
                    query_items.append(("ssl", "require"))
            elif key != "channel_binding":
                query_items.append((key, value))

        return urlunsplit(
            (
                "postgresql+asyncpg",
                parsed.netloc,
                parsed.path,
                urlencode(query_items),
                parsed.fragment,
            )
        )

    return url


def validate_production_config() -> None:
    if APP_ENV != "production":
        return

    missing = []
    if not OPENAI_API_KEY:
        missing.append("OPENAI_API_KEY")
    if not TMDB_API_KEY:
        missing.append("TMDB_API_KEY")
    if MOVIE_PASS_KEY == "dev-only-change-me":
        missing.append("MOVIE_PASS_KEY")
    if DEMO_ENABLED and DEMO_ACCESS_CODE == "local-demo-code":
        missing.append("DEMO_ACCESS_CODE")

    if missing:
        names = ", ".join(missing)
        raise RuntimeError(f"Production config is missing safe values for: {names}")
