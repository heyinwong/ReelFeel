from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class WatchedMovie(Base):
    __tablename__ = "watched_movies"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    title = Column(String)
    poster = Column(String)
    tmdb_rating = Column(Float)
    user_rating = Column(Float)
    description = Column(String)
    liked = Column (Boolean, default=False)

class WaitingMovie(Base):
    __tablename__ = "waiting_movies"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    title = Column(String)
    poster = Column(String)
    tmdb_rating = Column(Float)
    description = Column(String)
    user_rating = Column(Float)
    liked = Column (Boolean,default=False)