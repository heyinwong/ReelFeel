from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, func
from base import Base
from sqlalchemy.orm import relationship

class WatchedMovie(Base):
    __tablename__ = "watched_movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    poster = Column(String)
    backdrop = Column(String)
    tmdb_rating = Column(Float)
    user_rating = Column(Float, nullable=True)
    description = Column(String, nullable=True)
    liked = Column(Integer, nullable=True)  # 1 for liked, 0 or null otherwise
    review = Column(String, nullable=True)
    moods = Column(String, nullable=True)  # Stored as comma-separated tags
    watch_date = Column(Date, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="watched_movies")
    tmdb_id = Column(Integer, nullable=True)
    release_year = Column(Integer, nullable=True)
    genres = Column(String, nullable=True)   # e.g., "Drama, Animation"
    director = Column(String, nullable=True)

class WaitingMovie(Base):
    __tablename__ = "waiting_movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    poster = Column(String)
    backdrop = Column(String)
    tmdb_rating = Column(Float)
    description = Column(String, nullable=True)
    added_date = Column(Date, nullable=True)  # 可以新增记录加入watchlist的时间（可选）
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="waiting_movies")
    tmdb_id = Column(Integer, nullable=True)
    release_year = Column(Integer, nullable=True)
    genres = Column(String, nullable=True)   # e.g., "Drama, Animation"
    director = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    watched_movies = relationship("WatchedMovie", back_populates="user")
    waiting_movies = relationship("WaitingMovie", back_populates="user")
    taste_snapshots = relationship("TasteSnapshot", back_populates="user")
    taste_summary = relationship("TasteSummary", back_populates="user", uselist=False)

class TasteSnapshot(Base):
    __tablename__ = "taste_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("watched_movies.id"), nullable=True)  # 可选
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action_type = Column(String)  # e.g. 'rate', 'review', 'like'
    mood_tag = Column(String, nullable=True)  # if user has selected mood
    gpt_comment = Column(Text)  # GPT's summary on this user
    movie_title = Column(String) 
    user = relationship("User", back_populates="taste_snapshots")

class TasteSummary(Base):
    __tablename__ = "taste_summaries"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    summary = Column(Text)
    highlight_titles = Column(String, nullable=True)  # stored as JSON string
    user = relationship("User", back_populates="taste_summary")