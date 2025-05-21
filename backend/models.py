from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    watched_movies = relationship("WatchedMovie", back_populates="user")
    waiting_movies = relationship("WaitingMovie", back_populates="user")