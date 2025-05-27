# ReelFeel: AI-Powered Taste-Based Movie Recommender

A full-stack personal project that explores how large language models (LLMs) can provide personalized movie recommendations and analysis based on a user's cinematic taste.

##  Design Philosophy

ReelFeel started as an exploration of how AI can make movie discovery feel more personal.  
Rather than recommending what's trending or highly rated, it tries to understand the viewer’s taste based on what they’ve liked, rated, or written about.

The goal is not to build a perfect algorithm, but to create a space where recommendations feel more like reflections — grounded in your past experiences and emotional responses to films.

We chose to focus on simplicity:  
- A clean UI that prioritizes what matters — your thoughts and your history  
- A retro-inspired visual style to reflect the analog charm of cinema  
- An evolving “taste model” built using snapshots of your interactions

The system isn’t meant to be smarter than you — it’s meant to learn from you.

> In the end, ReelFeel is a small attempt to let AI assist in something very human: choosing a story that speaks to you.


## Features

- Taste-based movie recommendation (GPT + TMDB API)
- Secure user login and JWT authentication (FastAPI + bcrypt)
- Watched list with rating, mood tagging, comment, and likes
- Waiting list (To-Watch movies), with no duplicates across lists
- Taste modeling agent: generates taste snapshots and summary using GPT
- Dashboard-ready backend endpoints (`/taste-summary`, `/snapshot-history`)

## Tech Stack

| Layer     | Technology                          |
|----------|--------------------------------------|
| Frontend | React, TailwindCSS, shadcn/ui        |
| Backend  | FastAPI, SQLite, SQLAlchemy (async)  |
| Auth     | JWT, bcrypt                          |
| AI/ML    | OpenAI API (GPT), TMDB API           |
| Design   | Retro film-style interface (custom)  |

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
  ├── ai.py                 # GPT recommendation + taste modeling logic
  ├── auth.py               # JWT auth logic
  ├── base.py               # Utility functions
  ├── database.py           # Async database setup
  ├── main.py               # API endpoints
  ├── models.py             # SQLAlchemy ORM models
  └── app.db                # SQLite database

/frontend
  ├── public/
  ├── src/
  │   ├── assets/           # Static assets
  │   ├── components/       # Reusable UI components
  │   ├── hooks/            # Custom React hooks
  │   └── pages/            # Route-based page components
  └── ...
```

## Status

This project is actively in development. All core backend functionality is complete. Frontend features, dashboard UI, and styling are being polished. An about page and final UI touches are planned.
