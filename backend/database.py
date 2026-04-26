from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from base import Base

from config import resolve_database_url


DATABASE_URL = resolve_database_url()

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ---------- Dependency ----------
async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
