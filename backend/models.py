from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class WatchedMovie(Base):
    __tablename__ = "watched_movies"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    title = Column(String)
    poster = Column(String)
    rating = Column(Float)
    description = Column(String)

class WaitingMovie(Base):
    __tablename__ = "waiting_movies"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    title = Column(String)
    poster = Column(String)
    rating = Column(Float)
    description = Column(String)