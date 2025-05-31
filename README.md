# ReelFeel: AI-Powered Taste-Based Movie Recommender

A full-stack project that uses AI to understand your cinematic taste — not by genre or public rating, but by how you respond to films.

## Design Philosophy

I’ve always watched films not just for fun, but for connection — to something quiet, emotional, or hard to explain.  
Over time, I started logging what I watched, trying to understand why certain stories stayed with me. That reflection led to this project.

ReelFeel is built around the idea that recommendations should begin with the viewer.  
Instead of sorting by genre or popularity, it learns from how you react — what you rate, like, or write about.

I chose to use AI not just as a trend, but because I believe it's especially suited to understanding personal taste.  
The system acts like an AI agent: observing how you respond to films and gradually forming a sense of your preferences based on your history snapshots.

> In the end, ReelFeel is a small attempt to let AI assist in something very human: choosing a story that speaks to you.


## Features

### Personalized AI Recommendation
- Uses GPT + TMDB API to recommend movies based on user's taste profile
- Avoids suggesting movies already in the user's history (watched/waiting lists)

### Taste Modeling
- Every time a user likes, rates, or reviews a movie, a “taste snapshot” is created
- Snapshots are summarized into a long-term taste profile using GPT
- These profiles drive future recommendations and provide transparent reasoning for each suggestion.

### Interactive Movie Management
- Can log movies to watched list with detailed user input: rating (1–10), moods, comments, likes
- Waiting list (to-watch), with backend validation to avoid duplicates
- Review interface supports seamless transition from waiting → watched

### Authentication & Security
- Login and registration system using FastAPI + JWT and bcrypt hashing

### API-first Backend Design
- Modular API endpoints for all operations: recommendation, snapshot, taste summary, list CRUD
- Built with asynchronous FastAPI and SQLite, enabling smooth multi-user interaction

---

## Tech Stack

| Layer       | Technology                                                              |
|-------------|-------------------------------------------------------------------------|
| Frontend    | React (Vite), TailwindCSS, Framer Motion (animations)       |
| Backend     | FastAPI, SQLite, Async SQLAlchemy, Pydantic                            |
| Auth        | JWT (token-based auth), bcrypt (password hashing)                      |
| AI Logic    | OpenAI(recommendation, taste modeling), TMDB API (movie data)   |
| UI Design   | Retro film-inspired theme, responsive layout, animated components      |

## Getting Started

### Backend (FastAPI)

1. *(Optional)* Create and activate a virtual environment:

   ```bash
   python3 -m venv venv_reelfeel
   source venv_reelfeel/bin/activate  # macOS/Linux
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the development server:

   ```bash
   uvicorn main:app --reload
   ```

### Frontend (React)

To start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Before running, make sure to export the following environment variables:

```bash
export OPENAI_API_KEY=your_openai_key
export TMDB_API_KEY=your_tmdb_key
export MOVIE_PASS_KEY=your_jwt_secret_key
```

## Project Structure

```
/backend
  ├── ai.py                 # GPT taste modeling + movie recommendations
  ├── auth.py               # JWT login/register logic
  ├── database.py           # Async SQLite setup
  ├── models.py             # SQLAlchemy ORM models
  ├── main.py               # FastAPI routes
  └── app.db                # Local SQLite database

/frontend
  ├── assets/               # Static assets
  ├── components/           # Reusable UI elements
  ├── hooks/                # Custom React hooks
  └── pages/                # Route-level views (Main, Dashboard, etc.)
```

## Status

ReelFeel is in active development. All core features — including secure login, taste-based recommendation, and watchlist management — are complete. The app is fully responsive across devices and supports real-time taste modeling powered by GPT.

**Upcoming improvements:**

- Exclude movies already in the waiting list from AI recommendations  
- Improve title matching accuracy to avoid wrong movie retrievals from TMDB  
- Add subtle UI animations and polish  
- Expand the Dashboard with more insights and interactive feedback  
- Support for demo user access before final deployment
