from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from config import DEMO_ENABLED
from database import async_session, init_db
from routers import movies, recommendations, taste, tmdb, usage
from services.demo_service import ensure_demo_account


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🌱 Initializing DB...")
    await init_db()
    if DEMO_ENABLED:
        async with async_session() as session:
            await ensure_demo_account(session)
    print("✅ DB Ready.")
    yield
    print("🧹 Cleanup if needed.")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(movies.router)
app.include_router(recommendations.router)
app.include_router(taste.router)
app.include_router(tmdb.router)
app.include_router(usage.router)
