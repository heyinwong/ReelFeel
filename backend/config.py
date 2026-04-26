from pathlib import Path
import os

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
ENV_PATH = BACKEND_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH, override=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{BACKEND_DIR / 'app.db'}",
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


def resolve_database_url(raw_url: str | None = None) -> str:
    url = raw_url or DATABASE_URL
    for prefix in ("sqlite+aiosqlite:///", "sqlite:///"):
        if url.startswith(prefix):
            db_path = url.removeprefix(prefix)
            if db_path.startswith("./"):
                return f"{prefix}{BACKEND_DIR / db_path.removeprefix('./')}"
    return url
